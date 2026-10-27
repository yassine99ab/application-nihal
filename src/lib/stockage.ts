"use client";
// Historique, scores et fiches gardés dans le navigateur (localStorage).
// Toutes les lectures et écritures sont protégées : l'appli marche même si le stockage est bloqué.
import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { NiveauEleve } from "./competences";
import type { MatiereId, Niveau } from "./programmes";
import type { MessageEleve, Mode, OptionsGeneration } from "./requetes";

const PREFIXE = "profbac:";
const abonnes = new Set<() => void>();

function prevenir() {
  abonnes.forEach((f) => f());
}

function abonner(f: () => void) {
  abonnes.add(f);
  window.addEventListener("storage", f);
  return () => {
    abonnes.delete(f);
    window.removeEventListener("storage", f);
  };
}

function lireBrut(cle: string): string | null {
  try {
    return window.localStorage.getItem(PREFIXE + cle);
  } catch {
    return null;
  }
}

export function lire<T>(cle: string, defaut: T): T {
  const brut = lireBrut(cle);
  if (brut === null) return defaut;
  try {
    return JSON.parse(brut) as T;
  } catch {
    return defaut;
  }
}

export function ecrire<T>(cle: string, valeur: T): boolean {
  try {
    window.localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur));
    prevenir();
    return true;
  } catch {
    return false;
  }
}

export function effacer(cle: string) {
  try {
    window.localStorage.removeItem(PREFIXE + cle);
    prevenir();
  } catch {
    // Stockage indisponible : rien à effacer.
  }
}

/** Valeur stockée, relue à chaque changement (y compris depuis un autre onglet). */
export function useStockage<T>(cle: string, defaut: T): [T, (valeur: T) => void] {
  const brut = useSyncExternalStore(abonner, () => lireBrut(cle), () => null);
  const valeur = useMemo(() => {
    if (brut === null) return defaut;
    try {
      return JSON.parse(brut) as T;
    } catch {
      return defaut;
    }
    // `defaut` est volontairement ignoré : seule la valeur stockée compte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brut]);
  const modifier = useCallback((v: T) => ecrire(cle, v), [cle]);
  return [valeur, modifier];
}

/** Vrai une fois le composant monté dans le navigateur (le stockage est alors lisible). */
export function useMonte(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// ---- Niveau choisi ----

export function useNiveau(): [Niveau, (n: Niveau) => void] {
  return useStockage<Niveau>("niveau", "terminale");
}

// ---- Historique des corrections ----

export interface EntreeHistorique {
  id: string;
  date: number;
  mode: Mode;
  matiere: MatiereId;
  niveau: Niveau;
  titre: string;
  options?: OptionsGeneration;
  note?: number;
  /** Conversation sans le contenu des fichiers (trop lourd pour le navigateur). */
  messages: MessageEleve[];
}

const CLE_HISTORIQUE = "historique";
const HISTORIQUE_MAX = 60;

export function useHistorique() {
  return useStockage<EntreeHistorique[]>(CLE_HISTORIQUE, []);
}

export function enregistrerHistorique(entree: EntreeHistorique) {
  const sansFichiers: EntreeHistorique = {
    ...entree,
    messages: entree.messages.map((m) => ({
      ...m,
      fichiers: m.fichiers?.map((f) => ({ ...f, data: "" })),
    })),
  };
  let liste = lire<EntreeHistorique[]>(CLE_HISTORIQUE, []).filter((e) => e.id !== entree.id);
  liste = [sansFichiers, ...liste].slice(0, HISTORIQUE_MAX);
  // Si le navigateur manque de place, on retire les plus anciennes entrées.
  while (!ecrire(CLE_HISTORIQUE, liste) && liste.length > 1) {
    liste = liste.slice(0, Math.ceil(liste.length / 2));
  }
}

export function supprimerHistorique(id: string) {
  ecrire(
    CLE_HISTORIQUE,
    lire<EntreeHistorique[]>(CLE_HISTORIQUE, []).filter((e) => e.id !== id),
  );
}

// ---- Scores de QCM ----

export interface ScoreQcm {
  matiere: MatiereId;
  niveau: Niveau;
  chapitre: string;
  dernier: number;
  total: number;
  /** Meilleur résultat en pourcentage, toutes tentatives confondues. */
  meilleurPct: number;
  tentatives: number;
  date: number;
}

const CLE_SCORES = "scores-qcm";

export function useScores() {
  return useStockage<Record<string, ScoreQcm>>(CLE_SCORES, {});
}

export function enregistrerScore(s: Omit<ScoreQcm, "meilleurPct" | "tentatives" | "date">) {
  const scores = lire<Record<string, ScoreQcm>>(CLE_SCORES, {});
  const cle = `${s.matiere}|${s.niveau}|${s.chapitre}`;
  const ancien = scores[cle];
  const pct = s.total ? Math.round((100 * s.dernier) / s.total) : 0;
  scores[cle] = {
    ...s,
    meilleurPct: Math.max(pct, ancien?.meilleurPct ?? 0),
    tentatives: (ancien?.tentatives ?? 0) + 1,
    date: Date.now(),
  };
  ecrire(CLE_SCORES, scores);
}

// ---- Fiches de cours déjà générées ----

export function cleFiche(matiere: string, niveau: string, chapitre: string) {
  return `fiche:${matiere}:${niveau}:${chapitre}`;
}

export function nouvelId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---- Niveau de l'élève par matière ----

const CLE_PROFIL = "profil-niveaux";

/** Niveau choisi par l'élève pour chaque matière (sert à adapter les conseils et les exercices). */
export function useProfil() {
  return useStockage<Partial<Record<MatiereId, NiveauEleve>>>(CLE_PROFIL, {});
}

/** Moyenne des notes sur 20 obtenues dans une matière (copies et sujets corrigés). */
export function moyenneNotes(historique: EntreeHistorique[], matiere: MatiereId): { moyenne: number; nombre: number } | null {
  const notes = historique.filter((e) => e.matiere === matiere && e.note !== undefined).map((e) => e.note as number);
  if (!notes.length) return null;
  return { moyenne: notes.reduce((t, n) => t + n, 0) / notes.length, nombre: notes.length };
}

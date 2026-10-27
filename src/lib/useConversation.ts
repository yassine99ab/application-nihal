"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { lireFlux } from "./flux";
import type { MatiereId, Niveau } from "./programmes";
import type { Fichier, MessageEleve, Mode, OptionsGeneration } from "./requetes";

export interface ConfigConversation {
  mode: Mode;
  matiere: MatiereId;
  niveau: Niveau;
  options?: OptionsGeneration;
}

// Le texte reçu est affiché par paquets pour ne pas re-rendre les formules à chaque mot.
const INTERVALLE_AFFICHAGE = 60;

/**
 * Conversation avec l'IA : une première demande (demarrer) puis des questions de suivi (envoyer),
 * qui gardent le même mode, la même matière et le même contexte.
 */
export function useConversation(
  onTermine?: (config: ConfigConversation, messages: MessageEleve[]) => void,
  /** Conversation déjà existante (fiche en cache, historique) : lue une seule fois au montage. */
  initiale?: () => { config: ConfigConversation; messages: MessageEleve[] } | null,
) {
  const [depart] = useState(() => initiale?.() ?? null);
  const [config, setConfig] = useState<ConfigConversation | null>(depart?.config ?? null);
  const [messages, setMessages] = useState<MessageEleve[]>(depart?.messages ?? []);
  const [enCours, setEnCours] = useState(false);
  const [reflexion, setReflexion] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [tronque, setTronque] = useState(false);
  const controleur = useRef<AbortController | null>(null);
  const configCourante = useRef<ConfigConversation | null>(depart?.config ?? null);
  const rappel = useRef(onTermine);
  useEffect(() => {
    rappel.current = onTermine;
  });

  const diffuser = useCallback(async (historique: MessageEleve[]) => {
    const cfg = configCourante.current;
    if (!cfg) return;
    controleur.current?.abort();
    const ctrl = new AbortController();
    controleur.current = ctrl;
    setErreur(null);
    setTronque(false);
    setEnCours(true);
    setReflexion(false);
    setMessages([...historique, { role: "assistant", texte: "" }]);

    let texte = "";
    let dernierAffichage = 0;
    let finNormale = false;

    // Les fichiers d'une conversation rouverte depuis l'historique n'ont plus leur contenu : on ne les renvoie pas.
    const aEnvoyer = historique.map((m) =>
      m.fichiers ? { ...m, fichiers: m.fichiers.filter((f) => f.data) } : m,
    );

    for await (const ev of lireFlux(
      { mode: cfg.mode, matiere: cfg.matiere, niveau: cfg.niveau, options: cfg.options ?? {}, messages: aEnvoyer },
      ctrl.signal,
    )) {
      if (ev.t === "reflexion") setReflexion(true);
      else if (ev.t === "texte") {
        texte += ev.v;
        setReflexion(false);
        const maintenant = performance.now();
        if (maintenant - dernierAffichage > INTERVALLE_AFFICHAGE) {
          dernierAffichage = maintenant;
          setMessages([...historique, { role: "assistant", texte }]);
        }
      } else if (ev.t === "erreur") setErreur(ev.v);
      else if (ev.t === "fin") {
        finNormale = true;
        if (ev.arret === "max_tokens") setTronque(true);
      }
    }

    if (controleur.current !== ctrl) {
      // Arrêt demandé par l'élève : on garde ce qui a été écrit. (Remplacé par une autre demande : on ne touche à rien.)
      if (!controleur.current && texte && configCourante.current === cfg) {
        setMessages([...historique, { role: "assistant", texte }]);
      }
      return;
    }
    controleur.current = null;
    setEnCours(false);
    setReflexion(false);
    const complet: MessageEleve[] = texte ? [...historique, { role: "assistant", texte }] : historique;
    setMessages(complet);
    if (finNormale && texte) rappel.current?.(cfg, complet);
  }, []);

  const demarrer = useCallback(
    (cfg: ConfigConversation, texte: string, fichiers?: Fichier[]) => {
      configCourante.current = cfg;
      setConfig(cfg);
      return diffuser([{ role: "user", texte, ...(fichiers?.length ? { fichiers } : {}) }]);
    },
    [diffuser],
  );

  const envoyer = useCallback(
    (texte: string, fichiers?: Fichier[]) => {
      const message: MessageEleve = { role: "user", texte, ...(fichiers?.length ? { fichiers } : {}) };
      // Après une erreur, la dernière question reste sans réponse : on la remplace.
      const base = messages.at(-1)?.role === "user" ? messages.slice(0, -1) : messages;
      return diffuser([...base, message]);
    },
    [messages, diffuser],
  );

  const relancer = useCallback(() => {
    const base = messages.at(-1)?.role === "assistant" ? messages.slice(0, -1) : messages;
    if (base.length) return diffuser(base);
  }, [messages, diffuser]);

  const arreter = useCallback(() => {
    controleur.current?.abort();
    controleur.current = null;
    setEnCours(false);
    setReflexion(false);
  }, []);

  /** Rouvre une conversation enregistrée (historique), sans rien régénérer. */
  const reprendre = useCallback(
    (cfg: ConfigConversation, anciens: MessageEleve[]) => {
      arreter();
      configCourante.current = cfg;
      setConfig(cfg);
      setErreur(null);
      setTronque(false);
      setMessages(anciens);
    },
    [arreter],
  );

  const reinitialiser = useCallback(() => {
    arreter();
    configCourante.current = null;
    setConfig(null);
    setErreur(null);
    setTronque(false);
    setMessages([]);
  }, [arreter]);

  return {
    config,
    messages,
    enCours,
    reflexion,
    erreur,
    tronque,
    demarrer,
    envoyer,
    relancer,
    arreter,
    reprendre,
    reinitialiser,
  };
}

export type Conversation = ReturnType<typeof useConversation>;

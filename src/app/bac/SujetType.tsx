"use client";
import { useRef, useState } from "react";
import { ChoixNiveau } from "@/components/ChoixMatiere";
import { useNiveauEleve } from "@/components/ChoixNiveauEleve";
import ChoixOeuvre from "@/components/ChoixOeuvre";
import Chrono from "@/components/Chrono";
import FilConversation, { lireNote } from "@/components/FilConversation";
import { IconeOeil, IconeToque } from "@/components/Icones";
import MathMarkdown from "@/components/MathMarkdown";
import ZoneDepot from "@/components/ZoneDepot";
import { baremesDe } from "@/lib/baremes";
import { EPREUVES, formatDuree, getEpreuve } from "@/lib/epreuves";
import { getMatiere } from "@/lib/programmes";
import { MARQUEUR_CORRIGE, type Fichier } from "@/lib/requetes";
import { couleur } from "@/lib/style";
import { enregistrerHistorique, nouvelId, useNiveau } from "@/lib/stockage";
import { useConversation } from "@/lib/useConversation";

function separer(texte: string) {
  const i = texte.indexOf(MARQUEUR_CORRIGE);
  return i < 0
    ? { sujet: texte.trim(), corrige: null }
    : { sujet: texte.slice(0, i).trim(), corrige: texte.slice(i + MARQUEUR_CORRIGE.length).trim() };
}

export default function SujetType() {
  const [niveau, setNiveau] = useNiveau();
  const epreuves = EPREUVES.filter((e) => e.niveau === niveau);
  const [epreuveChoisie, setEpreuve] = useState<string>("");
  const epreuve = epreuves.find((e) => e.id === epreuveChoisie) ?? epreuves[0];
  const [oeuvre, setOeuvre] = useState("");
  const [theme, setTheme] = useState("");
  const [corrigeVisible, setCorrigeVisible] = useState(false);
  const [copie, setCopie] = useState("");
  const [fichiersCopie, setFichiersCopie] = useState<Fichier[]>([]);
  const [alerte, setAlerte] = useState<string | null>(null);
  const [numeroSujet, setNumeroSujet] = useState(0);
  const [baremeChoisi, setBareme] = useState<string | null>(null);
  const ids = useRef({ sujet: "", copie: "", titre: "" });
  const zoneSujet = useRef<HTMLDivElement>(null);
  const zoneCorrection = useRef<HTMLDivElement>(null);

  const sujet = useConversation((cfg, messages) =>
    enregistrerHistorique({
      id: ids.current.sujet,
      date: Date.now(),
      mode: cfg.mode,
      matiere: cfg.matiere,
      niveau: cfg.niveau,
      options: cfg.options,
      titre: ids.current.titre,
      messages,
    }),
  );

  const correction = useConversation((cfg, messages) => {
    const derniere = messages.findLast((m) => m.role === "assistant");
    enregistrerHistorique({
      id: ids.current.copie,
      date: Date.now(),
      mode: cfg.mode,
      matiere: cfg.matiere,
      niveau: cfg.niveau,
      options: cfg.options,
      titre: `Ma copie — ${ids.current.titre}`,
      note: (derniere && lireNote(derniere.texte)) ?? undefined,
      messages,
    });
  });

  const epreuveSujet = sujet.config?.options?.epreuve ? getEpreuve(sujet.config.options.epreuve) : undefined;
  const premiere = sujet.messages.find((m) => m.role === "assistant")?.texte ?? "";
  const { sujet: texteSujet, corrige } = separer(premiere);
  const sujetPret = corrige !== null || (!!premiere && !sujet.enCours);
  // Grilles possibles pour la copie : l'oral a la sienne, l'écrit de français et la philo en ont deux.
  const baremesCopie = epreuveSujet
    ? baremesDe(epreuveSujet.matiere).filter((b) => (epreuveSujet.oral ? b.id === "francais-oral" : b.id !== "francais-oral"))
    : [];
  const baremeCopie = baremesCopie.find((b) => b.id === baremeChoisi) ?? baremesCopie[0];
  const [niveauEleve] = useNiveauEleve(epreuveSujet?.matiere ?? null);

  function generer() {
    setAlerte(null);
    if (!epreuve) return;
    if (epreuve.avecOeuvre && epreuve.oral && !oeuvre.trim()) {
      return setAlerte("Pour l'oral, choisis l'œuvre que tu présentes.");
    }
    ids.current = { sujet: nouvelId(), copie: "", titre: `Sujet type — ${epreuve.nom}` };
    setCorrigeVisible(false);
    setNumeroSujet((n) => n + 1);
    setCopie("");
    setFichiersCopie([]);
    correction.reinitialiser();
    void sujet.demarrer(
      {
        mode: "sujet-bac",
        matiere: epreuve.matiere,
        niveau: epreuve.niveau,
        options: {
          epreuve: epreuve.id,
          ...(oeuvre.trim() ? { oeuvre: oeuvre.trim() } : {}),
          ...(theme.trim() ? { chapitre: theme.trim() } : {}),
        },
      },
      `Génère un sujet d'entraînement : ${epreuve.nom}.`,
    );
    setTimeout(() => zoneSujet.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function rendreCopie() {
    setAlerte(null);
    if (!sujet.config || !epreuveSujet) return;
    if (!copie.trim() && !fichiersCopie.length) return setAlerte("Écris ta copie ou ajoute-en des photos.");
    ids.current.copie = nouvelId();
    const texte = [
      `SUJET :\n${texteSujet}`,
      corrige ? `CORRIGÉ DE RÉFÉRENCE (pour t'aider à noter, ne le recopie pas en entier) :\n${corrige}` : "",
      `MA COPIE :\n${copie.trim() || "(voir les photos de ma copie)"}`,
    ]
      .filter(Boolean)
      .join("\n\n");
    void correction.demarrer(
      {
        mode: "copie",
        matiere: sujet.config.matiere,
        niveau: sujet.config.niveau,
        options: {
          ...(baremeCopie ? { bareme: baremeCopie.id } : {}),
          ...(niveauEleve ? { niveauEleve } : {}),
        },
      },
      texte,
      fichiersCopie,
    );
    setTimeout(() => zoneCorrection.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  return (
    <div className="space-y-8">
      <div className="no-print carte space-y-6 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="etiquette mb-0">Choisis ton épreuve</span>
          <ChoixNiveau niveau={niveau} onChange={setNiveau} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {epreuves.map((e) => {
            const m = getMatiere(e.matiere);
            return (
              <button
                key={e.id}
                type="button"
                aria-pressed={epreuve?.id === e.id}
                onClick={() => setEpreuve(e.id)}
                style={m ? couleur(m) : undefined}
                className={`rounded-2xl border-[1.5px] p-4 text-left transition-colors ${
                  epreuve?.id === e.id ? "border-encre bg-carte-2" : "border-ligne hover:border-encre-douce"
                }`}
              >
                <span className="flex items-center gap-2 font-bold">
                  <span className="pastille" /> {e.nom}
                </span>
                <span className="mt-1 block text-sm text-encre-douce">
                  {formatDuree(e.dureeMinutes)} · {e.oral ? "oral" : "écrit"}
                </span>
              </button>
            );
          })}
        </div>

        {epreuve && <p className="rounded-xl bg-carte-2 p-3 text-sm">{epreuve.structure}</p>}

        <div className="grid gap-5 md:grid-cols-2">
          {epreuve?.avecOeuvre && (
            <ChoixOeuvre valeur={oeuvre} onChange={setOeuvre} facultatif={!epreuve.oral} />
          )}
          {!epreuve?.oral && (
            <div>
              <label className="etiquette" htmlFor="theme">
                Thème à privilégier <span className="normal-case">(facultatif)</span>
              </label>
              <input
                id="theme"
                className="champ"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder={epreuve?.matiere === "maths" ? "Ex. : suites et logarithme" : "Ex. : un chapitre que tu veux revoir"}
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button type="button" className="bouton text-lg" onClick={generer} disabled={sujet.enCours}>
            <IconeToque width={20} height={20} /> Générer un sujet type
          </button>
          {alerte && <p className="font-semibold text-rouge">{alerte}</p>}
        </div>
      </div>

      <div ref={zoneSujet} className="scroll-mt-24 space-y-5">
        {sujetPret && epreuveSujet && (
          <Chrono
            key={numeroSujet}
            dureeMinutes={epreuveSujet.dureeMinutes}
            libelle={epreuveSujet.oral ? "Préparation" : "Mode examen"}
          />
        )}
        <FilConversation
          conversation={sujet}
          placeholderSuivi="Une question sur le sujet ou le corrigé ?"
          premiereReponse={(texte, enCours) => {
            const parties = separer(texte);
            return (
              <div>
                <MathMarkdown texte={parties.sujet} />
                {parties.corrige !== null && (
                  <div className="mt-8 border-t-[1.5px] border-dashed border-ligne pt-6">
                    {corrigeVisible ? (
                      <div className="apparait">
                        <h2 className="titre mb-4 text-3xl font-semibold">
                          <span className="stabilo">Corrigé</span>
                        </h2>
                        <MathMarkdown texte={parties.corrige} />
                      </div>
                    ) : (
                      <div className="no-print flex flex-wrap items-center gap-3">
                        <button type="button" className="bouton-second" onClick={() => setCorrigeVisible(true)}>
                          <IconeOeil width={18} height={18} /> Voir le corrigé
                        </button>
                        <span className="text-sm text-encre-douce">
                          {enCours ? "Le corrigé est en cours de rédaction…" : "Fais d'abord le sujet, chrono en main !"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>

      {sujetPret && !sujet.enCours && epreuveSujet && (
        <section className="no-print carte apparait space-y-4 p-5 sm:p-7">
          <h2 className="titre text-3xl font-semibold">
            Rendre ma <span className="stabilo">copie</span>
          </h2>
          <p className="text-encre-douce">
            {epreuveSujet.oral
              ? "Écris ton explication et tes réponses (ou tes notes de préparation) : elles seront évaluées comme à l'oral."
              : "Tape ta copie ou prends-la en photo : elle sera corrigée et notée sur 20 avec le barème."}
          </p>
          {baremesCopie.length > 1 && (
            <div>
              <span className="etiquette">J&apos;ai traité</span>
              <div className="flex flex-wrap gap-2">
                {baremesCopie.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className="puce"
                    aria-pressed={baremeCopie?.id === b.id}
                    onClick={() => setBareme(b.id)}
                  >
                    {b.nom}
                  </button>
                ))}
              </div>
            </div>
          )}
          <textarea
            className="champ min-h-44"
            value={copie}
            onChange={(e) => setCopie(e.target.value)}
            placeholder="Ta copie…"
            aria-label="Ta copie"
          />
          <ZoneDepot fichiers={fichiersCopie} onChange={setFichiersCopie} libelle="Ajoute les photos de ta copie" />
          <button type="button" className="bouton" onClick={rendreCopie} disabled={correction.enCours}>
            Corriger et noter ma copie
          </button>
        </section>
      )}

      <div ref={zoneCorrection} className="scroll-mt-24">
        <FilConversation conversation={correction} />
      </div>
    </div>
  );
}

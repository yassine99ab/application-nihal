"use client";
import { useState } from "react";
import FilConversation from "@/components/FilConversation";
import { IconeCorbeille } from "@/components/Icones";
import { NIVEAUX, getMatiere, type MatiereId } from "@/lib/programmes";
import type { Mode } from "@/lib/requetes";
import { couleur } from "@/lib/style";
import {
  enregistrerHistorique,
  supprimerHistorique,
  useHistorique,
  useScores,
  type EntreeHistorique,
} from "@/lib/stockage";
import { useConversation } from "@/lib/useConversation";

const NOMS_MODE: Record<Mode, string> = {
  correction: "Correction",
  indices: "Indices",
  copie: "Copie notée",
  redaction: "Rédaction",
  cours: "Cours",
  exercice: "Exercice",
  "sujet-bac": "Sujet type",
  question: "Question",
  analyse: "Analyse de texte",
  methode: "Fiche méthode",
  approfondissement: "Approfondissement",
};

function Conversation({ entree, onFermer }: { entree: EntreeHistorique; onFermer: () => void }) {
  const conversation = useConversation(
    (_, messages) => enregistrerHistorique({ ...entree, date: Date.now(), messages }),
    () => ({
      config: { mode: entree.mode, matiere: entree.matiere, niveau: entree.niveau, options: entree.options },
      messages: entree.messages,
    }),
  );
  return (
    <div className="space-y-4">
      <button type="button" className="bouton-second no-print" onClick={onFermer}>
        ← Retour à l&apos;historique
      </button>
      <h2 className="titre text-3xl font-semibold">{entree.titre}</h2>
      {entree.messages.some((m) => m.fichiers?.length) && (
        <p className="no-print text-sm text-encre-douce">
          Les photos et PDF ne sont pas conservés : pour une nouvelle question qui en a besoin, renvoie-les depuis
          « Corriger ».
        </p>
      )}
      <FilConversation conversation={conversation} masquerPremiereDemande={false} />
    </div>
  );
}

export default function Historique() {
  const [historique] = useHistorique();
  const [scores] = useScores();
  const [ouverte, setOuverte] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<MatiereId | "toutes">("toutes");

  const entree = historique.find((e) => e.id === ouverte);
  if (entree) return <Conversation key={entree.id} entree={entree} onFermer={() => setOuverte(null)} />;

  const matieresPresentes = [...new Set(historique.map((e) => e.matiere))];
  const liste = historique.filter((e) => filtre === "toutes" || e.matiere === filtre);
  const listeScores = Object.values(scores).sort((a, b) => b.date - a.date);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <section className="space-y-4">
        {matieresPresentes.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button type="button" className="puce" aria-pressed={filtre === "toutes"} onClick={() => setFiltre("toutes")}>
              Tout
            </button>
            {matieresPresentes.map((id) => {
              const m = getMatiere(id);
              return (
                m && (
                  <button
                    key={id}
                    type="button"
                    className="puce"
                    style={couleur(m)}
                    aria-pressed={filtre === id}
                    onClick={() => setFiltre(id)}
                  >
                    <span className="pastille" /> {m.court}
                  </button>
                )
              );
            })}
          </div>
        )}

        {!liste.length && (
          <div className="copie">
            <p className="manuscrit text-3xl">Rien pour l&apos;instant !</p>
            <p className="mt-2 text-encre-douce">
              Tes corrections, exercices et sujets type apparaîtront ici automatiquement.
            </p>
          </div>
        )}

        <ul className="space-y-3">
          {liste.map((e, i) => {
            const m = getMatiere(e.matiere);
            return (
              <li key={e.id} className="carte apparait flex items-stretch" style={{ animationDelay: `${Math.min(i, 8) * 40}ms`, ...(m ? couleur(m) : {}) }}>
                <button type="button" className="flex min-w-0 flex-1 items-center gap-4 p-4 text-left" onClick={() => setOuverte(e.id)}>
                  <span className="pastille h-10 w-1.5 rounded-full" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{e.titre}</span>
                    <span className="block text-sm text-encre-douce">
                      {NOMS_MODE[e.mode]} · {m?.court} · {NIVEAUX[e.niveau]} ·{" "}
                      {new Date(e.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </span>
                  {e.note !== undefined && (
                    <span className="manuscrit shrink-0 text-3xl">{String(e.note).replace(".", ",")}/20</span>
                  )}
                </button>
                <button
                  type="button"
                  className="no-print px-4 text-encre-douce hover:text-rouge"
                  aria-label={`Supprimer « ${e.titre} »`}
                  onClick={() => {
                    if (window.confirm("Supprimer cet élément de l'historique ?")) supprimerHistorique(e.id);
                  }}
                >
                  <IconeCorbeille width={20} height={20} />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <aside className="space-y-3">
        <h2 className="titre text-2xl font-semibold">Mes QCM</h2>
        {!listeScores.length ? (
          <p className="text-sm text-encre-douce">Fais un QCM dans « S&apos;entraîner » pour suivre ta progression.</p>
        ) : (
          <ul className="carte divide-y divide-dashed divide-ligne px-4">
            {listeScores.map((s) => {
              const m = getMatiere(s.matiere);
              return (
                <li key={`${s.matiere}|${s.niveau}|${s.chapitre}`} className="py-3" style={m ? couleur(m) : undefined}>
                  <p className="flex items-center gap-2 text-sm font-bold">
                    <span className="pastille" /> {s.chapitre}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-carte-2">
                      <div className="h-full rounded-full" style={{ width: `${s.meilleurPct}%`, background: "var(--c)" }} />
                    </div>
                    <span className="text-sm font-black tabular-nums">{s.meilleurPct} %</span>
                  </div>
                  <p className="mt-1 text-xs text-encre-douce">
                    Dernier : {s.dernier}/{s.total} · {s.tentatives} essai{s.tentatives > 1 ? "s" : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </aside>
    </div>
  );
}

"use client";
import { useState } from "react";
import type { Qcm } from "@/lib/requetes";
import MathMarkdown from "./MathMarkdown";
import { NoteRouge } from "./FilConversation";

const LETTRES = ["A", "B", "C", "D", "E", "F"];

export default function Quiz({
  qcm,
  onFini,
  onRecommencer,
}: {
  qcm: Qcm;
  onFini: (bonnes: number, total: number) => void;
  onRecommencer: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [reponses, setReponses] = useState<number[]>([]);
  const total = qcm.questions.length;
  const fini = reponses.length === total && index >= total;
  const bonnes = reponses.filter((r, i) => r === qcm.questions[i].bonneReponse).length;

  if (fini) {
    const sur20 = Math.round((bonnes / total) * 40) / 2;
    return (
      <div className="space-y-5">
        <div className="copie apparait flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <NoteRouge note={sur20} />
          <div>
            <p className="titre text-3xl font-semibold">
              {bonnes} bonne{bonnes > 1 ? "s" : ""} réponse{bonnes > 1 ? "s" : ""} sur {total}
            </p>
            <p className="mt-1 text-encre-douce">
              {bonnes === total
                ? "Parfait, ce chapitre est maîtrisé !"
                : bonnes / total >= 0.7
                  ? "Bien joué ! Relis les explications des questions ratées."
                  : "Ce chapitre mérite d'être retravaillé : relis la fiche de cours puis refais un QCM."}
            </p>
          </div>
        </div>
        <ol className="space-y-3">
          {qcm.questions.map((q, i) => {
            const juste = reponses[i] === q.bonneReponse;
            return (
              <li key={i} className="carte p-4">
                <p className="mb-1 text-sm font-black" style={{ color: juste ? "var(--vert)" : "var(--rouge)" }}>
                  {juste ? "✓" : "✗"} Question {i + 1}
                </p>
                <MathMarkdown texte={q.enonce} />
                <p className="mt-2 text-sm font-bold">
                  Bonne réponse : {LETTRES[q.bonneReponse]}
                  {!juste && ` (tu avais répondu ${LETTRES[reponses[i]]})`}
                </p>
                <div className="mt-2 rounded-xl bg-carte-2 p-3 text-[0.95rem]">
                  <MathMarkdown texte={q.explication} />
                </div>
              </li>
            );
          })}
        </ol>
        <button type="button" className="bouton no-print" onClick={onRecommencer}>
          Nouveau QCM sur ce chapitre
        </button>
      </div>
    );
  }

  const q = qcm.questions[index];
  const choisie = reponses[index];
  const repondu = choisie !== undefined;

  function choisir(i: number) {
    if (repondu) return;
    const nouvelles = [...reponses];
    nouvelles[index] = i;
    setReponses(nouvelles);
    if (nouvelles.length === total) {
      const score = nouvelles.filter((r, k) => r === qcm.questions[k].bonneReponse).length;
      onFini(score, total);
    }
  }

  return (
    <div className="copie apparait" key={index}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-black uppercase tracking-wide text-encre-douce">
          Question {index + 1} / {total}
        </p>
        <div className="flex gap-1" aria-hidden="true">
          {qcm.questions.map((qq, i) => (
            <span
              key={i}
              className="h-2 w-5 rounded-full"
              style={{
                background:
                  reponses[i] === undefined
                    ? "var(--ligne)"
                    : reponses[i] === qq.bonneReponse
                      ? "var(--vert)"
                      : "var(--rouge)",
              }}
            />
          ))}
        </div>
      </div>

      <div className="text-lg">
        <MathMarkdown texte={q.enonce} />
      </div>

      <div className="mt-5 grid gap-2.5">
        {q.choix.map((c, i) => {
          const estBonne = i === q.bonneReponse;
          let style = "border-ligne hover:border-encre";
          if (repondu && estBonne) style = "border-vert bg-[color-mix(in_srgb,var(--vert)_12%,transparent)]";
          else if (repondu && i === choisie) style = "border-rouge bg-[color-mix(in_srgb,var(--rouge)_10%,transparent)]";
          else if (repondu) style = "border-ligne opacity-60";
          return (
            <button
              key={i}
              type="button"
              disabled={repondu}
              onClick={() => choisir(i)}
              className={`flex items-start gap-3 rounded-2xl border-[1.5px] p-3 text-left transition-colors ${style}`}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-carte-2 text-sm font-black">
                {LETTRES[i]}
              </span>
              <span className="min-w-0 flex-1 pt-0.5">
                <MathMarkdown texte={c} />
              </span>
            </button>
          );
        })}
      </div>

      {repondu && (
        <div className="apparait mt-5">
          <p className="manuscrit text-3xl" style={{ color: choisie === q.bonneReponse ? "var(--vert)" : "var(--rouge)" }}>
            {choisie === q.bonneReponse ? "Bien vu !" : `Raté : c'était ${LETTRES[q.bonneReponse]}.`}
          </p>
          <div className="mt-2 rounded-xl bg-carte-2 p-4">
            <MathMarkdown texte={q.explication} />
          </div>
          <button type="button" className="bouton mt-4" onClick={() => setIndex(index + 1)}>
            {index + 1 < total ? "Question suivante" : "Voir mon résultat"}
          </button>
        </div>
      )}
    </div>
  );
}

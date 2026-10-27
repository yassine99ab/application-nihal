"use client";
import { useState } from "react";
import { MARQUEUR_ETAPE } from "@/lib/requetes";
import MathMarkdown from "./MathMarkdown";
import { IconeOeil } from "./Icones";

/**
 * Affiche une réponse découpée par @@ETAPE@@ partie par partie :
 * l'élève dévoile lui-même l'indice suivant puis la correction.
 */
export default function RevelationProgressive({
  texte,
  enCours,
  libelles,
}: {
  texte: string;
  enCours: boolean;
  /** Texte du bouton pour dévoiler la partie i+1. */
  libelles: string[];
}) {
  const parties = texte.split(MARQUEUR_ETAPE).map((p) => p.trim());
  const [visibles, setVisibles] = useState(1);
  const prochaine = parties[visibles];
  const enAttente = enCours && visibles >= parties.length;

  return (
    <div>
      {parties.slice(0, visibles).map((p, i) => (
        <div key={i} className={i ? "apparait mt-6 border-t-[1.5px] border-dashed border-ligne pt-6" : ""}>
          <MathMarkdown texte={p} />
        </div>
      ))}
      {(prochaine !== undefined || enCours) && (
        <div className="no-print mt-6 flex flex-wrap items-center gap-3">
          {prochaine !== undefined && (
            <button type="button" className="bouton" onClick={() => setVisibles(visibles + 1)}>
              <IconeOeil width={18} height={18} />
              {libelles[visibles - 1] ?? "Voir la suite"}
            </button>
          )}
          {enAttente && <span className="text-sm text-encre-douce">Rédaction en cours…</span>}
          {prochaine !== undefined && enCours && visibles === parties.length - 1 && (
            <span className="text-sm text-encre-douce">(la suite est encore en cours d&apos;écriture)</span>
          )}
        </div>
      )}
    </div>
  );
}

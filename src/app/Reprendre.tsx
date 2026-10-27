"use client";
import Link from "next/link";
import { getMatiere } from "@/lib/programmes";
import { couleur } from "@/lib/style";
import { useHistorique, useMonte, useScores } from "@/lib/stockage";

/** « Reprendre là où tu t'es arrêté » : derniers éléments de l'historique et progression aux QCM. */
export default function Reprendre() {
  const monte = useMonte();
  const [historique] = useHistorique();
  const [scores] = useScores();
  if (!monte || (!historique.length && !Object.keys(scores).length)) return null;

  const valeurs = Object.values(scores);
  const moyenne = valeurs.length
    ? Math.round(valeurs.reduce((t, s) => t + s.meilleurPct, 0) / valeurs.length)
    : null;

  return (
    <section className="apparait mt-14 grid gap-4 md:grid-cols-[1fr_16rem]" aria-labelledby="titre-reprendre">
      <div className="carte p-5">
        <h2 id="titre-reprendre" className="titre mb-3 text-2xl font-semibold">
          Reprendre où tu t&apos;es arrêté
        </h2>
        <ul className="divide-y divide-dashed divide-ligne">
          {historique.slice(0, 4).map((e) => {
            const m = getMatiere(e.matiere);
            return (
              <li key={e.id} style={m ? couleur(m) : undefined}>
                <Link href="/historique" className="flex items-center gap-3 py-2.5 hover:underline">
                  <span className="pastille" />
                  <span className="min-w-0 flex-1 truncate font-medium">{e.titre}</span>
                  {e.note !== undefined && <span className="manuscrit text-2xl">{String(e.note).replace(".", ",")}/20</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      {moyenne !== null && (
        <Link href="/historique" className="carte flex flex-col justify-center p-5 text-center hover:border-encre-douce">
          <span className="text-sm font-bold uppercase tracking-wide text-encre-douce">Réussite aux QCM</span>
          <span className="titre my-1 text-5xl font-semibold">{moyenne} %</span>
          <span className="text-sm text-encre-douce">
            sur {valeurs.length} chapitre{valeurs.length > 1 ? "s" : ""}
          </span>
        </Link>
      )}
    </section>
  );
}

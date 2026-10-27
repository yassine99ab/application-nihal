"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChoixMatiere, ChoixNiveau } from "@/components/ChoixMatiere";
import { couleur } from "@/lib/style";
import { getMatiere, matieresDuNiveau, type MatiereId } from "@/lib/programmes";
import { cleFiche, lire, useMonte, useNiveau, useScores } from "@/lib/stockage";

export default function ListeCours() {
  const [niveau, setNiveau] = useNiveau();
  const params = useSearchParams();
  const [matiereChoisie, setMatiere] = useState<MatiereId | null>(
    (getMatiere(params.get("matiere") ?? "")?.id as MatiereId | undefined) ?? null,
  );
  const [scores] = useScores();
  const monte = useMonte();
  const matieres = matieresDuNiveau(niveau);
  const matiere = matieres.find((m) => m.id === matiereChoisie) ?? matieres[0];
  const chapitres = matiere.niveaux[niveau] ?? [];
  const themes = [...new Set(chapitres.map((c) => c.theme))];

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ChoixMatiere niveau={niveau} matiere={matiere.id} onChange={setMatiere} />
        <ChoixNiveau niveau={niveau} onChange={setNiveau} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {themes.map((theme, t) => (
          <section key={theme} className="carte apparait p-5" style={{ animationDelay: `${t * 60}ms`, ...couleur(matiere) }}>
            <h2 className="mb-3 flex items-center gap-2 font-bold">
              <span className="pastille" />
              {theme}
            </h2>
            <ol className="divide-y divide-dashed divide-ligne">
              {chapitres
                .filter((c) => c.theme === theme)
                .map((c) => {
                  const fiche = monte && lire<string | null>(cleFiche(matiere.id, niveau, c.id), null);
                  const score = scores[`${matiere.id}|${niveau}|${c.titre}`];
                  return (
                    <li key={c.id}>
                      <Link
                        href={`/cours/${niveau}/${matiere.id}/${c.id}`}
                        className="group flex items-center justify-between gap-3 py-2.5"
                      >
                        <span className="font-medium group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
                          {c.titre}
                        </span>
                        <span className="flex shrink-0 items-center gap-2 text-xs font-bold">
                          {score && (
                            <span className="rounded-full bg-carte-2 px-2 py-0.5" title="Meilleur score au QCM">
                              {score.meilleurPct} %
                            </span>
                          )}
                          {fiche && (
                            <span className="manuscrit text-lg" title="Fiche déjà générée">
                              ✓ fiche
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

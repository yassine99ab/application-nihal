"use client";
import { NIVEAUX, matieresDuNiveau, type Matiere, type MatiereId, type Niveau } from "@/lib/programmes";
import { couleur } from "@/lib/style";

export function ChoixNiveau({ niveau, onChange }: { niveau: Niveau; onChange: (n: Niveau) => void }) {
  return (
    <div className="inline-flex rounded-full border-[1.5px] border-ligne bg-carte p-1" role="tablist" aria-label="Niveau">
      {(Object.keys(NIVEAUX) as Niveau[]).map((n) => (
        <button
          key={n}
          type="button"
          role="tab"
          aria-selected={niveau === n}
          onClick={() => onChange(n)}
          className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
            niveau === n ? "bg-encre text-papier" : "text-encre-douce hover:text-encre"
          }`}
        >
          {NIVEAUX[n]}
        </button>
      ))}
    </div>
  );
}

export function ChoixMatiere({
  niveau,
  matiere,
  onChange,
  filtre,
}: {
  niveau: Niveau;
  matiere: MatiereId | null;
  onChange: (m: MatiereId) => void;
  filtre?: (m: Matiere) => boolean;
}) {
  const matieres = matieresDuNiveau(niveau).filter((m) => !filtre || filtre(m));
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Matière">
      {matieres.map((m) => (
        <button
          key={m.id}
          type="button"
          className="puce"
          aria-pressed={matiere === m.id}
          onClick={() => onChange(m.id)}
          style={couleur(m)}
        >
          <span className="pastille" />
          {m.nom}
        </button>
      ))}
    </div>
  );
}

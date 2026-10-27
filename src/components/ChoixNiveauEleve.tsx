"use client";
import { IDS_NIVEAU_ELEVE, NIVEAUX_ELEVE, niveauDepuisMoyenne, type NiveauEleve } from "@/lib/competences";
import type { MatiereId } from "@/lib/programmes";
import { moyenneNotes, useHistorique, useProfil } from "@/lib/stockage";

/** Niveau de l'élève dans une matière : choisi par lui, ou estimé d'après ses notes. */
export function useNiveauEleve(matiere: MatiereId | null): [NiveauEleve | undefined, (n: NiveauEleve) => void, string | null] {
  const [profil, setProfil] = useProfil();
  const [historique] = useHistorique();
  if (!matiere) return [undefined, () => {}, null];
  const choisi = profil[matiere];
  const stats = moyenneNotes(historique, matiere);
  const estime = stats ? niveauDepuisMoyenne(stats.moyenne) : undefined;
  const source = choisi
    ? null
    : stats
      ? `estimé d'après ta moyenne de ${stats.moyenne.toFixed(1).replace(".", ",")}/20 sur ${stats.nombre} copie${stats.nombre > 1 ? "s" : ""}`
      : null;
  return [choisi ?? estime, (n) => setProfil({ ...profil, [matiere]: n }), source];
}

export default function ChoixNiveauEleve({ matiere }: { matiere: MatiereId | null }) {
  const [niveau, setNiveau, source] = useNiveauEleve(matiere);
  if (!matiere) return null;
  return (
    <div>
      <span className="etiquette">Ton niveau dans cette matière</span>
      <div className="flex flex-wrap gap-2">
        {IDS_NIVEAU_ELEVE.map((id) => (
          <button
            key={id}
            type="button"
            className="puce"
            aria-pressed={niveau === id}
            onClick={() => setNiveau(id)}
            title={NIVEAUX_ELEVE[id].detail}
          >
            {NIVEAUX_ELEVE[id].nom}
            <span className="text-xs font-normal opacity-70">{NIVEAUX_ELEVE[id].detail}</span>
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-encre-douce">
        {source
          ? `Niveau ${source}. Tu peux le changer.`
          : niveau
            ? "Les explications et les exercices sont adaptés à ce niveau."
            : "Facultatif : indique ton niveau pour recevoir des conseils adaptés."}
      </p>
    </div>
  );
}

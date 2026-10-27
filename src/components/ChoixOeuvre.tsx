"use client";
import { ANNEE_OEUVRES, OEUVRES, libelleOeuvre } from "@/lib/oeuvres";

/** Choix d'une œuvre au programme du bac de français (ou saisie libre). */
export default function ChoixOeuvre({
  valeur,
  onChange,
  facultatif = true,
}: {
  valeur: string;
  onChange: (v: string) => void;
  facultatif?: boolean;
}) {
  const objets = [...new Set(OEUVRES.map((o) => o.objet))];
  const libre = valeur !== "" && !OEUVRES.some((o) => libelleOeuvre(o) === valeur);
  return (
    <div className="space-y-2">
      <label className="etiquette" htmlFor="oeuvre">
        Œuvre au programme {facultatif && <span className="normal-case">(facultatif)</span>}
      </label>
      <select
        id="oeuvre"
        className="champ"
        value={libre ? "__libre" : valeur}
        onChange={(e) => onChange(e.target.value === "__libre" ? " " : e.target.value)}
      >
        <option value="">{facultatif ? "— Aucune en particulier —" : "— Choisis une œuvre —"}</option>
        {objets.map((objet) => (
          <optgroup key={objet} label={objet}>
            {OEUVRES.filter((o) => o.objet === objet).map((o) => (
              <option key={o.titre} value={libelleOeuvre(o)}>
                {o.auteur}, {o.titre}
              </option>
            ))}
          </optgroup>
        ))}
        <option value="__libre">Autre œuvre (je l&apos;écris)…</option>
      </select>
      {libre && (
        <input
          className="champ"
          value={valeur.trimStart()}
          onChange={(e) => onChange(e.target.value || " ")}
          placeholder="Auteur, titre de l'œuvre et parcours"
          aria-label="Œuvre (saisie libre)"
        />
      )}
      {OEUVRES.length > 0 && (
        <p className="text-xs text-encre-douce">Programme officiel {ANNEE_OEUVRES} (épreuves de juin {ANNEE_OEUVRES.slice(-4)}).</p>
      )}
    </div>
  );
}

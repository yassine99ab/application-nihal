"use client";
import { useId, useRef, useState } from "react";
import { preparerFichier, urlApercu } from "@/lib/fichiers";
import type { Fichier } from "@/lib/requetes";
import { IconeAppareil, IconeCroix, IconeTrombone } from "./Icones";

const FICHIERS_MAX = 8;

export default function ZoneDepot({
  fichiers,
  onChange,
  libelle = "Ajoute une photo ou un PDF du sujet",
}: {
  fichiers: Fichier[];
  onChange: (f: Fichier[]) => void;
  libelle?: string;
}) {
  const idEntree = useId();
  const entreeFichier = useRef<HTMLInputElement>(null);
  const entreePhoto = useRef<HTMLInputElement>(null);
  const [survol, setSurvol] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function ajouter(liste: FileList | null) {
    if (!liste?.length) return;
    setErreur(null);
    setChargement(true);
    const prets: Fichier[] = [];
    for (const f of Array.from(liste).slice(0, FICHIERS_MAX - fichiers.length)) {
      try {
        prets.push(await preparerFichier(f));
      } catch (e) {
        setErreur(e instanceof Error ? e.message : "Fichier illisible.");
      }
    }
    if (liste.length > FICHIERS_MAX - fichiers.length) {
      setErreur(`${FICHIERS_MAX} fichiers au maximum.`);
    }
    setChargement(false);
    onChange([...fichiers, ...prets]);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setSurvol(true);
        }}
        onDragLeave={() => setSurvol(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSurvol(false);
          void ajouter(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-5 text-center transition-colors sm:flex-row sm:justify-between sm:text-left ${
          survol ? "border-bleu bg-carte-2" : "border-ligne"
        }`}
      >
        <p className="text-sm text-encre-douce">
          {chargement ? "Préparation des fichiers…" : libelle}
          <span className="hidden sm:inline"> — ou glisse-les ici.</span>
        </p>
        <div className="flex gap-2">
          <button type="button" className="bouton-second text-sm" onClick={() => entreePhoto.current?.click()}>
            <IconeAppareil width={18} height={18} /> Photo
          </button>
          <button type="button" className="bouton-second text-sm" onClick={() => entreeFichier.current?.click()}>
            <IconeTrombone width={18} height={18} /> Fichier
          </button>
        </div>
        <input
          id={idEntree}
          ref={entreeFichier}
          type="file"
          accept="image/*,application/pdf,.heic,.heif"
          multiple
          hidden
          onChange={(e) => {
            void ajouter(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={entreePhoto}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            void ajouter(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {erreur && <p className="mt-2 text-sm font-semibold text-rouge">{erreur}</p>}

      {fichiers.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-3">
          {fichiers.map((f, i) => {
            const apercu = urlApercu(f);
            return (
              <li key={`${f.nom}-${i}`} className="relative">
                {apercu ? (
                  // eslint-disable-next-line @next/next/no-img-element -- aperçu local en base64
                  <img src={apercu} alt={f.nom} className="h-20 w-20 rounded-xl border border-ligne object-cover" />
                ) : (
                  <div className="flex h-20 w-28 flex-col items-center justify-center rounded-xl border border-ligne bg-carte-2 px-2 text-center">
                    <span className="text-xs font-black text-rouge">PDF</span>
                    <span className="line-clamp-2 text-[0.7rem] text-encre-douce">{f.nom}</span>
                  </div>
                )}
                <button
                  type="button"
                  aria-label={`Retirer ${f.nom}`}
                  className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-encre text-papier"
                  onClick={() => onChange(fichiers.filter((_, j) => j !== i))}
                >
                  <IconeCroix width={14} height={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

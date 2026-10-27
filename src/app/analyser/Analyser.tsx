"use client";
import { useRef, useState } from "react";
import { ChoixNiveau } from "@/components/ChoixMatiere";
import ChoixNiveauEleve, { useNiveauEleve } from "@/components/ChoixNiveauEleve";
import ChoixOeuvre from "@/components/ChoixOeuvre";
import FilConversation, { lireNote } from "@/components/FilConversation";
import { IconeLivre, IconeStylo } from "@/components/Icones";
import ZoneDepot from "@/components/ZoneDepot";
import type { Fichier, TypeAnalyse } from "@/lib/requetes";
import { enregistrerHistorique, nouvelId, useNiveau } from "@/lib/stockage";
import { useConversation } from "@/lib/useConversation";

const TYPES: { id: TypeAnalyse; nom: string; aide: string }[] = [
  {
    id: "oral",
    nom: "Explication linéaire (oral)",
    aide: "Introduction complète, mouvements, analyse phrase par phrase, conclusion, ouverture et question de grammaire.",
  },
  {
    id: "ecrit",
    nom: "Commentaire (écrit)",
    aide: "Analyse au brouillon phrase par phrase, problématique, plan détaillé et commentaire entièrement rédigé.",
  },
];

export default function Analyser() {
  const [niveau, setNiveau] = useNiveau();
  const [type, setType] = useState<TypeAnalyse>("oral");
  const [oeuvre, setOeuvre] = useState("");
  const [infos, setInfos] = useState("");
  const [texte, setTexte] = useState("");
  const [fichiers, setFichiers] = useState<Fichier[]>([]);
  const [grammaire, setGrammaire] = useState(true);
  const [maVersion, setMaVersion] = useState("");
  const [fichiersVersion, setFichiersVersion] = useState<Fichier[]>([]);
  const [alerte, setAlerte] = useState<string | null>(null);
  const [niveauEleve] = useNiveauEleve("francais");
  const resultat = useRef<HTMLDivElement>(null);
  const zoneCorrection = useRef<HTMLDivElement>(null);
  const entree = useRef({ id: "", titre: "" });
  const idCorrection = useRef("");

  const analyse = useConversation((cfg, messages) =>
    enregistrerHistorique({
      id: entree.current.id,
      date: Date.now(),
      mode: cfg.mode,
      matiere: cfg.matiere,
      niveau: cfg.niveau,
      options: cfg.options,
      titre: entree.current.titre,
      messages,
    }),
  );

  const correction = useConversation((cfg, messages) => {
    const derniere = messages.findLast((m) => m.role === "assistant");
    enregistrerHistorique({
      id: idCorrection.current,
      date: Date.now(),
      mode: cfg.mode,
      matiere: cfg.matiere,
      niveau: cfg.niveau,
      options: cfg.options,
      titre: `Mon ${type === "oral" ? "explication" : "commentaire"} — ${entree.current.titre}`,
      note: (derniere && lireNote(derniere.texte)) ?? undefined,
      messages,
    });
  });

  function verifierTexte() {
    setAlerte(null);
    if (!texte.trim() && !fichiers.length) {
      setAlerte("Colle l'extrait ou ajoute une photo / un PDF du texte.");
      return false;
    }
    if (!entree.current.id) {
      const debut = texte.trim().split("\n")[0]?.slice(0, 60);
      entree.current = {
        id: nouvelId(),
        titre: infos.trim() || oeuvre.trim().split(" — ")[0] || (debut ? `« ${debut}… »` : fichiers[0]?.nom ?? "Extrait"),
      };
    }
    return true;
  }

  function demandeTexte() {
    const parties = [
      infos.trim() && `Auteur, œuvre, date : ${infos.trim()}`,
      texte.trim() ? `EXTRAIT :\n${texte.trim()}` : "L'extrait est dans les fichiers joints.",
    ];
    return parties.filter(Boolean).join("\n\n");
  }

  function analyser() {
    entree.current.id = "";
    if (!verifierTexte()) return;
    void analyse.demarrer(
      {
        mode: "analyse",
        matiere: "francais",
        niveau,
        options: {
          typeAnalyse: type,
          grammaire: type === "oral" ? grammaire : undefined,
          ...(oeuvre.trim() ? { oeuvre: oeuvre.trim() } : {}),
          ...(niveauEleve ? { niveauEleve } : {}),
        },
      },
      demandeTexte(),
      fichiers,
    );
    setTimeout(() => resultat.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function corrigerMaVersion() {
    if (!verifierTexte()) return;
    if (!maVersion.trim() && !fichiersVersion.length) {
      setAlerte(`Écris ton ${type === "oral" ? "explication" : "commentaire"} ou ajoute-en des photos.`);
      return;
    }
    const parties = [
      `SUJET : ${type === "oral" ? "explication linéaire de l'extrait suivant (oral du bac de français, partie 1)" : "commentaire de l'extrait suivant (écrit du bac de français)"}.`,
      demandeTexte(),
      `MA COPIE :\n${maVersion.trim() || "(voir les photos de ma copie)"}`,
      fichiers.length && fichiersVersion.length
        ? `Fichiers joints : les ${fichiers.length} premiers sont l'extrait, les ${fichiersVersion.length} suivants sont ma copie.`
        : "",
    ];
    idCorrection.current = nouvelId();
    void correction.demarrer(
      {
        mode: "copie",
        matiere: "francais",
        niveau,
        options: {
          bareme: type === "oral" ? "francais-oral" : "francais-commentaire",
          ...(oeuvre.trim() ? { oeuvre: oeuvre.trim() } : {}),
          ...(niveauEleve ? { niveauEleve } : {}),
        },
      },
      parties.filter(Boolean).join("\n\n"),
      [...fichiers, ...fichiersVersion],
    );
    setTimeout(() => zoneCorrection.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  return (
    <div className="space-y-8">
      <form
        className="no-print carte apparait space-y-6 p-5 sm:p-7"
        onSubmit={(e) => {
          e.preventDefault();
          analyser();
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="etiquette mb-0">Pour quelle épreuve ?</span>
          <ChoixNiveau niveau={niveau} onChange={setNiveau} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={type === t.id}
              onClick={() => setType(t.id)}
              className={`rounded-2xl border-[1.5px] p-4 text-left transition-colors ${
                type === t.id ? "border-encre bg-carte-2" : "border-ligne hover:border-encre-douce"
              }`}
            >
              <span className="block font-bold">{t.nom}</span>
              <span className="mt-0.5 block text-sm text-encre-douce">{t.aide}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <ChoixOeuvre valeur={oeuvre} onChange={setOeuvre} />
          <div>
            <label className="etiquette" htmlFor="infos">
              Auteur, œuvre, date <span className="normal-case">(si ce n&apos;est pas une œuvre au programme)</span>
            </label>
            <input
              id="infos"
              className="champ"
              value={infos}
              onChange={(e) => setInfos(e.target.value)}
              placeholder="Ex. : Victor Hugo, Les Contemplations, « Demain, dès l'aube », 1856"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="etiquette" htmlFor="extrait">
            L&apos;extrait
          </label>
          <textarea
            id="extrait"
            className="champ min-h-52 font-display text-[1.05rem] leading-relaxed"
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder="Colle ici le texte à analyser, en gardant les retours à la ligne (vers, paragraphes)…"
          />
          <ZoneDepot fichiers={fichiers} onChange={setFichiers} libelle="Ou photographie la page du texte" />
        </div>

        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <ChoixNiveauEleve matiere="francais" />
          {type === "oral" && (
            <label className="flex items-center gap-2 font-semibold">
              <input
                type="checkbox"
                checked={grammaire}
                onChange={(e) => setGrammaire(e.target.checked)}
                className="h-5 w-5 accent-[var(--bleu)]"
              />
              Ajouter la question de grammaire
            </label>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="bouton text-lg" disabled={analyse.enCours}>
            <IconeLivre width={20} height={20} /> Analyser le texte
          </button>
          {alerte && <p className="font-semibold text-rouge">{alerte}</p>}
        </div>
      </form>

      <div ref={resultat} className="scroll-mt-24">
        <FilConversation
          conversation={analyse}
          placeholderSuivi="Une question ? Ex. : « Explique-moi encore le vers 5 » ou « Propose une autre ouverture »"
        />
      </div>

      <section className="no-print carte space-y-4 p-5 sm:p-7" aria-labelledby="titre-ma-version">
        <h2 id="titre-ma-version" className="titre text-3xl font-semibold">
          Corriger <span className="stabilo">mon {type === "oral" ? "explication" : "commentaire"}</span>
        </h2>
        <p className="text-encre-douce">
          Tu as préparé ton propre travail sur cet extrait ? Il est noté avec la grille officielle du bac{" "}
          {type === "oral" ? "(oral : lecture, explication, grammaire)" : "(commentaire)"}, puis amélioré en gardant tes
          idées.
        </p>
        <textarea
          className="champ min-h-44"
          value={maVersion}
          onChange={(e) => setMaVersion(e.target.value)}
          placeholder={type === "oral" ? "Ton introduction, ton explication et ta conclusion…" : "Ton commentaire…"}
          aria-label="Ton travail"
        />
        <ZoneDepot fichiers={fichiersVersion} onChange={setFichiersVersion} libelle="Ou ajoute les photos de ta copie" />
        <button type="button" className="bouton" onClick={corrigerMaVersion} disabled={correction.enCours}>
          <IconeStylo width={18} height={18} /> Corriger et noter mon travail
        </button>
      </section>

      <div ref={zoneCorrection} className="scroll-mt-24">
        <FilConversation conversation={correction} />
      </div>
    </div>
  );
}

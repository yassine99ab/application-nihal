"use client";
import { useRef, useState } from "react";
import { ChoixMatiere, ChoixNiveau } from "@/components/ChoixMatiere";
import ChoixNiveauEleve, { useNiveauEleve } from "@/components/ChoixNiveauEleve";
import ChoixOeuvre from "@/components/ChoixOeuvre";
import FilConversation, { lireNote } from "@/components/FilConversation";
import RevelationProgressive from "@/components/RevelationProgressive";
import ZoneDepot from "@/components/ZoneDepot";
import { IconeStylo } from "@/components/Icones";
import { baremesDe } from "@/lib/baremes";
import { matieresDuNiveau, type MatiereId } from "@/lib/programmes";
import type { Fichier, Mode, TypeRedaction } from "@/lib/requetes";
import { enregistrerHistorique, nouvelId, useNiveau } from "@/lib/stockage";
import { useConversation, type ConfigConversation } from "@/lib/useConversation";

type ModeCorrection = Extract<Mode, "correction" | "indices" | "copie" | "redaction">;

const MODES: { id: ModeCorrection; nom: string; aide: string; lettresSeulement?: boolean }[] = [
  { id: "correction", nom: "Correction complète", aide: "Le corrigé détaillé, étape par étape, avec les rappels de cours." },
  { id: "indices", nom: "Indices seulement", aide: "Des coups de pouce progressifs pour trouver par toi-même, sans la solution." },
  { id: "copie", nom: "Vérifier ma copie", aide: "Ta copie annotée, notée sur 20 avec la grille officielle, puis améliorée." },
  { id: "redaction", nom: "Rédaction / résumé", aide: "Dissertation, commentaire, plan, fiche résumé… rédigés comme un modèle.", lettresSeulement: true },
];

const REDACTIONS: { id: TypeRedaction; nom: string; francaisSeulement?: boolean }[] = [
  { id: "dissertation", nom: "Dissertation" },
  { id: "commentaire", nom: "Commentaire de texte" },
  { id: "explication-lineaire", nom: "Explication linéaire (oral)", francaisSeulement: true },
  { id: "plan", nom: "Plan détaillé" },
  { id: "resume", nom: "Résumé / fiche d'œuvre" },
  { id: "redaction-libre", nom: "Rédaction libre (essai, invention…)" },
];

export default function Corriger() {
  const [niveau, setNiveau] = useNiveau();
  const [matiereChoisie, setMatiere] = useState<MatiereId | null>(null);
  const [modeChoisi, setMode] = useState<ModeCorrection>("correction");
  const [sujet, setSujet] = useState("");
  const [fichiersSujet, setFichiersSujet] = useState<Fichier[]>([]);
  const [copie, setCopie] = useState("");
  const [fichiersCopie, setFichiersCopie] = useState<Fichier[]>([]);
  const [typeRedaction, setTypeRedaction] = useState<TypeRedaction>("dissertation");
  const [oeuvre, setOeuvre] = useState("");
  const [baremeChoisi, setBareme] = useState<string | null>(null);
  const [alerte, setAlerte] = useState<string | null>(null);
  const resultat = useRef<HTMLDivElement>(null);
  const entree = useRef({ id: "", titre: "" });

  const conversation = useConversation((cfg, messages) => {
    const derniere = messages.findLast((m) => m.role === "assistant");
    enregistrerHistorique({
      id: entree.current.id,
      date: Date.now(),
      mode: cfg.mode,
      matiere: cfg.matiere,
      niveau: cfg.niveau,
      options: cfg.options,
      titre: entree.current.titre,
      note: (derniere && lireNote(derniere.texte)) ?? undefined,
      messages,
    });
  });

  const matiere = matieresDuNiveau(niveau).find((m) => m.id === matiereChoisie) ?? null;
  const modes = MODES.filter((m) => !m.lettresSeulement || (matiere && !matiere.scientifique));
  const mode = modes.some((m) => m.id === modeChoisi) ? modeChoisi : "correction";
  const redactions = REDACTIONS.filter((r) => !r.francaisSeulement || matiere?.id === "francais");
  const baremes = matiere ? baremesDe(matiere.id) : [];
  const bareme = baremes.find((b) => b.id === baremeChoisi) ?? baremes[0];
  const [niveauEleve] = useNiveauEleve(matiere?.id ?? null);

  function lancer(modeLance: ModeCorrection) {
    setAlerte(null);
    if (!matiere) return setAlerte("Choisis d'abord la matière.");
    if (!sujet.trim() && !fichiersSujet.length) {
      return setAlerte("Écris le sujet ou ajoute une photo / un PDF.");
    }
    if (modeLance === "copie" && !copie.trim() && !fichiersCopie.length) {
      return setAlerte("Ajoute ta copie (texte ou photo) pour qu'elle soit corrigée.");
    }

    let texte = sujet.trim() || "Voici le sujet (fichiers joints).";
    let fichiers = fichiersSujet;
    if (modeLance === "copie") {
      const parties = [
        `SUJET :\n${sujet.trim() || "(voir les fichiers joints)"}`,
        `MA COPIE :\n${copie.trim() || "(voir les photos de ma copie)"}`,
      ];
      if (fichiersSujet.length && fichiersCopie.length) {
        parties.push(
          `Fichiers joints : les ${fichiersSujet.length} premiers sont le sujet, les ${fichiersCopie.length} suivants sont ma copie.`,
        );
      } else if (fichiersCopie.length) {
        parties.push("Les fichiers joints sont ma copie.");
      }
      texte = parties.join("\n\n");
      fichiers = [...fichiersSujet, ...fichiersCopie];
    }

    const cfg: ConfigConversation = {
      mode: modeLance,
      matiere: matiere.id,
      niveau,
      options: {
        ...(modeLance === "redaction" ? { typeRedaction } : {}),
        ...(modeLance === "copie" && bareme ? { bareme: bareme.id } : {}),
        ...(oeuvre.trim() ? { oeuvre: oeuvre.trim() } : {}),
        ...(niveauEleve ? { niveauEleve } : {}),
      },
    };
    entree.current = {
      id: nouvelId(),
      titre: (sujet.trim().split("\n")[0] || fichiersSujet[0]?.nom || "Sujet").slice(0, 120),
    };
    void conversation.demarrer(cfg, texte, fichiers);
    setTimeout(() => resultat.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  const modeConversation = conversation.config?.mode;

  return (
    <div className="space-y-8">
      <form
        className="no-print carte apparait space-y-6 p-5 sm:p-7"
        onSubmit={(e) => {
          e.preventDefault();
          lancer(mode);
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="etiquette mb-0">Niveau</span>
          <ChoixNiveau niveau={niveau} onChange={setNiveau} />
        </div>

        <div>
          <span className="etiquette">Matière</span>
          <ChoixMatiere niveau={niveau} matiere={matiere?.id ?? null} onChange={setMatiere} />
        </div>

        <div>
          <span className="etiquette">Ce que tu veux</span>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={mode === m.id}
                onClick={() => setMode(m.id)}
                className={`rounded-2xl border-[1.5px] p-3 text-left transition-colors ${
                  mode === m.id ? "border-encre bg-carte-2" : "border-ligne hover:border-encre-douce"
                }`}
              >
                <span className="block font-bold">{m.nom}</span>
                <span className="mt-0.5 block text-sm text-encre-douce">{m.aide}</span>
              </button>
            ))}
          </div>
        </div>

        {mode === "redaction" && (
          <div>
            <span className="etiquette">Type de rédaction</span>
            <div className="flex flex-wrap gap-2">
              {redactions.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="puce"
                  aria-pressed={typeRedaction === r.id}
                  onClick={() => setTypeRedaction(r.id)}
                >
                  {r.nom}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === "copie" && !matiere?.scientifique && baremes.length > 0 && (
          <div>
            <span className="etiquette">Type de copie (grille de notation du bac)</span>
            <div className="flex flex-wrap gap-2">
              {baremes.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className="puce"
                  aria-pressed={bareme?.id === b.id}
                  onClick={() => setBareme(b.id)}
                >
                  {b.nom}
                </button>
              ))}
            </div>
          </div>
        )}

        {matiere?.id === "francais" && <ChoixOeuvre valeur={oeuvre} onChange={setOeuvre} />}

        {matiere && <ChoixNiveauEleve matiere={matiere.id} />}

        <div className="space-y-3">
          <label className="etiquette" htmlFor="sujet">
            {mode === "redaction" ? "Sujet, consigne ou texte à étudier" : "Le sujet"}
          </label>
          <textarea
            id="sujet"
            className="champ min-h-36"
            value={sujet}
            onChange={(e) => setSujet(e.target.value)}
            placeholder={
              matiere?.scientifique === false
                ? "Ex. : « La poésie sert-elle seulement à exprimer des émotions ? » ou colle le texte à commenter…"
                : "Colle ou tape l'énoncé ici (écris les formules simplement : x^2, racine(x), 3,5 × 10^-2…)"
            }
          />
          <ZoneDepot fichiers={fichiersSujet} onChange={setFichiersSujet} />
        </div>

        {mode === "copie" && (
          <div className="space-y-3">
            <label className="etiquette" htmlFor="copie">
              Ta copie
            </label>
            <textarea
              id="copie"
              className="champ min-h-36"
              value={copie}
              onChange={(e) => setCopie(e.target.value)}
              placeholder="Tape ta réponse, ou prends ta copie en photo ci-dessous."
            />
            <ZoneDepot fichiers={fichiersCopie} onChange={setFichiersCopie} libelle="Ajoute les photos de ta copie" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="bouton text-lg" disabled={conversation.enCours}>
            <IconeStylo width={20} height={20} />
            {mode === "copie" ? "Corriger ma copie" : mode === "indices" ? "Me donner des indices" : mode === "redaction" ? "Rédiger" : "Corriger"}
          </button>
          {alerte && <p className="font-semibold text-rouge">{alerte}</p>}
        </div>
      </form>

      <div ref={resultat} className="scroll-mt-24">
        <FilConversation
          conversation={conversation}
          premiereReponse={
            modeConversation === "indices"
              ? (texte, enCours) => (
                  <RevelationProgressive
                    texte={texte}
                    enCours={enCours}
                    libelles={["Niveau 2 : la méthode", "Niveau 3 : un coup de pouce"]}
                  />
                )
              : undefined
          }
        />
        {modeConversation === "indices" && !conversation.enCours && conversation.messages.length > 1 && (
          <div className="no-print mt-4">
            <button type="button" className="bouton-second" onClick={() => lancer("correction")}>
              J&apos;ai cherché : montre-moi la correction complète
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

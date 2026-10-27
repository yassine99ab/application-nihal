"use client";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { ChoixMatiere, ChoixNiveau } from "@/components/ChoixMatiere";
import ChoixNiveauEleve, { useNiveauEleve } from "@/components/ChoixNiveauEleve";
import FilConversation, { Reflexion } from "@/components/FilConversation";
import { IconeCible } from "@/components/Icones";
import Quiz from "@/components/Quiz";
import RevelationProgressive from "@/components/RevelationProgressive";
import ZoneDepot from "@/components/ZoneDepot";
import { COMPETENCES } from "@/lib/competences";
import { NIVEAUX, getMatiere, matieresDuNiveau, type MatiereId, type Niveau } from "@/lib/programmes";
import { DIFFICULTES, type Difficulte, type Fichier, type Mode, type Qcm, type RequeteQcm } from "@/lib/requetes";
import { enregistrerHistorique, enregistrerScore, nouvelId, useNiveau } from "@/lib/stockage";
import { useConversation, type ConfigConversation } from "@/lib/useConversation";

const ONGLETS = [
  { id: "qcm", nom: "QCM", aide: "Vérifier tes connaissances sur un chapitre." },
  { id: "exercice", nom: "Exercice", aide: "Un exercice inédit avec indices puis correction." },
  { id: "approfondir", nom: "Approfondir", aide: "Travailler un critère de réussite précis, en trois paliers." },
  { id: "methode", nom: "Méthode", aide: "Une fiche méthode adaptée à ton niveau, avec diagnostic de ton travail." },
] as const;
type Onglet = (typeof ONGLETS)[number]["id"];

const NOMS_DIFFICULTE: Record<Difficulte, string> = {
  facile: "Facile",
  moyen: "Niveau bac",
  difficile: "Difficile",
};

const METHODE_GENERALE = "";

export default function Entrainement() {
  const params = useSearchParams();
  const [niveauStocke, setNiveauStocke] = useNiveau();
  const niveauUrl = params.get("niveau");
  const [niveauLocal, setNiveauLocal] = useState<Niveau | null>(
    niveauUrl && niveauUrl in NIVEAUX ? (niveauUrl as Niveau) : null,
  );
  const niveau = niveauLocal ?? niveauStocke;
  const ongletUrl = ONGLETS.find((o) => o.id === params.get("onglet"))?.id;
  const [onglet, setOnglet] = useState<Onglet>(ongletUrl ?? "qcm");
  const [matiereChoisie, setMatiere] = useState<MatiereId | null>(
    (getMatiere(params.get("matiere") ?? "")?.id as MatiereId | undefined) ?? null,
  );
  const [chapitreChoisi, setChapitre] = useState<string>(params.get("chapitre") ?? "");
  const [difficulte, setDifficulte] = useState<Difficulte>("moyen");
  const [nombre, setNombre] = useState(10);
  const [competenceChoisie, setCompetence] = useState<string | null>(null);
  const [lierChapitre, setLierChapitre] = useState(false);
  const [travail, setTravail] = useState("");
  const [fichiersTravail, setFichiersTravail] = useState<Fichier[]>([]);

  const [qcm, setQcm] = useState<Qcm | null>(null);
  const [chargementQcm, setChargementQcm] = useState(false);
  const [erreurQcm, setErreurQcm] = useState<string | null>(null);
  const [cleQuiz, setCleQuiz] = useState(0);
  const requeteQcm = useRef<{ ctrl: AbortController; demande: RequeteQcm } | null>(null);
  const resultat = useRef<HTMLDivElement>(null);
  // Une entrée d'historique par type de conversation (plusieurs peuvent tourner en même temps).
  const entrees = useRef<Partial<Record<Mode, { id: string; titre: string }>>>({});

  const matieres = matieresDuNiveau(niveau);
  const matiere = matieres.find((m) => m.id === matiereChoisie) ?? matieres[0];
  const chapitres = matiere.niveaux[niveau] ?? [];
  const chapitre = chapitres.find((c) => c.id === chapitreChoisi) ?? chapitres[0];
  const themes = [...new Set(chapitres.map((c) => c.theme))];
  const competences = COMPETENCES[matiere.id] ?? [];
  const competence =
    onglet === "methode" && competenceChoisie === METHODE_GENERALE
      ? null
      : (competences.find((c) => c.nom === competenceChoisie) ?? competences[0]);
  const [niveauEleve] = useNiveauEleve(matiere.id);

  const enregistrer = (cfg: ConfigConversation, messages: Parameters<typeof enregistrerHistorique>[0]["messages"]) =>
    enregistrerHistorique({
      id: entrees.current[cfg.mode]?.id ?? nouvelId(),
      date: Date.now(),
      mode: cfg.mode,
      matiere: cfg.matiere,
      niveau: cfg.niveau,
      options: cfg.options,
      titre: entrees.current[cfg.mode]?.titre ?? "Entraînement",
      messages,
    });
  const exercice = useConversation(enregistrer);
  const approfondissement = useConversation(enregistrer);
  const methode = useConversation(enregistrer);

  function changerNiveau(n: Niveau) {
    setNiveauLocal(null);
    setNiveauStocke(n);
  }

  function defiler() {
    setTimeout(() => resultat.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  async function lancerQcm() {
    requeteQcm.current?.ctrl.abort();
    const demande: RequeteQcm = { matiere: matiere.id, niveau, chapitre: chapitre.titre, difficulte, nombre };
    const ctrl = new AbortController();
    requeteQcm.current = { ctrl, demande };
    setQcm(null);
    setErreurQcm(null);
    setChargementQcm(true);
    defiler();
    try {
      const rep = await fetch("/api/qcm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demande),
        signal: ctrl.signal,
      });
      const corps = (await rep.json()) as Qcm & { erreur?: string };
      if (!rep.ok || corps.erreur) throw new Error(corps.erreur ?? `Erreur ${rep.status}`);
      setQcm(corps);
      setCleQuiz((k) => k + 1);
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setErreurQcm(e instanceof Error ? e.message : "Le QCM n'a pas pu être créé.");
    } finally {
      if (requeteQcm.current?.ctrl === ctrl) setChargementQcm(false);
    }
  }

  function lancerExercice() {
    entrees.current.exercice = { id: nouvelId(), titre: `Exercice : ${chapitre.titre}` };
    void exercice.demarrer(
      {
        mode: "exercice",
        matiere: matiere.id,
        niveau,
        options: { chapitre: chapitre.titre, difficulte, ...(niveauEleve ? { niveauEleve } : {}) },
      },
      `Exercice d'entraînement : ${chapitre.titre} (${NOMS_DIFFICULTE[difficulte].toLowerCase()})`,
    );
    defiler();
  }

  function lancerApprofondissement() {
    if (!competence) return;
    const theme = lierChapitre ? chapitre.titre : undefined;
    entrees.current.approfondissement = { id: nouvelId(), titre: `Approfondir : ${competence.nom}${theme ? ` — ${theme}` : ""}` };
    void approfondissement.demarrer(
      {
        mode: "approfondissement",
        matiere: matiere.id,
        niveau,
        options: {
          competence: competence.nom,
          ...(theme ? { chapitre: theme } : {}),
          ...(niveauEleve ? { niveauEleve } : {}),
        },
      },
      `Exercice d'approfondissement : ${competence.nom}${theme ? ` (thème : ${theme})` : ""}`,
    );
    defiler();
  }

  function lancerMethode() {
    const sujet = competence?.nom ?? "méthode générale de la matière";
    entrees.current.methode = { id: nouvelId(), titre: `Méthode : ${sujet}` };
    const texte = [
      `Fiche méthode : ${sujet}.`,
      travail.trim() ? `EXTRAIT DE MON TRAVAIL À DIAGNOSTIQUER :\n${travail.trim()}` : "",
      !travail.trim() && fichiersTravail.length ? "Mon travail à diagnostiquer est dans les fichiers joints." : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    void methode.demarrer(
      {
        mode: "methode",
        matiere: matiere.id,
        niveau,
        options: { ...(competence ? { competence: competence.nom } : {}), ...(niveauEleve ? { niveauEleve } : {}) },
      },
      texte,
      fichiersTravail,
    );
    defiler();
  }

  const conversations = { exercice, approfondir: approfondissement, methode } as const;
  const occupe = onglet === "qcm" ? chargementQcm : conversations[onglet].enCours;
  const lancer = { qcm: () => void lancerQcm(), exercice: lancerExercice, approfondir: lancerApprofondissement, methode: lancerMethode }[onglet];
  const libelleBouton = {
    qcm: "Lancer le QCM",
    exercice: "Me donner un exercice",
    approfondir: "Lancer l'exercice d'approfondissement",
    methode: "Créer ma fiche méthode",
  }[onglet];
  const avecChapitre = onglet === "qcm" || onglet === "exercice" || (onglet === "approfondir" && lierChapitre);

  return (
    <div className="space-y-8">
      <div className="no-print carte apparait space-y-6 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1 rounded-2xl bg-carte-2 p-1" role="tablist" aria-label="Type d'entraînement">
            {ONGLETS.map((o) => (
              <button
                key={o.id}
                type="button"
                role="tab"
                aria-selected={onglet === o.id}
                onClick={() => setOnglet(o.id)}
                className={`rounded-xl px-3.5 py-2 text-sm font-bold transition-colors sm:px-5 sm:text-base ${
                  onglet === o.id ? "bg-encre text-papier" : "text-encre-douce"
                }`}
              >
                {o.nom}
              </button>
            ))}
          </div>
          <ChoixNiveau niveau={niveau} onChange={changerNiveau} />
        </div>
        <p className="-mt-2 text-sm text-encre-douce">{ONGLETS.find((o) => o.id === onglet)?.aide}</p>

        <div>
          <span className="etiquette">Matière</span>
          <ChoixMatiere
            niveau={niveau}
            matiere={matiere.id}
            onChange={(m) => {
              setMatiere(m);
              setChapitre("");
              setCompetence(null);
            }}
          />
        </div>

        {(onglet === "approfondir" || onglet === "methode") && (
          <div>
            <span className="etiquette">Critère de réussite à travailler</span>
            <div className="flex flex-wrap gap-2">
              {onglet === "methode" && (
                <button
                  type="button"
                  className="puce"
                  aria-pressed={competence === null}
                  onClick={() => setCompetence(METHODE_GENERALE)}
                >
                  Méthode générale
                </button>
              )}
              {competences.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="puce"
                  aria-pressed={competence?.id === c.id}
                  onClick={() => setCompetence(c.nom)}
                  title={c.description}
                >
                  {c.nom}
                </button>
              ))}
            </div>
            {competence && <p className="mt-2 text-sm text-encre-douce">{competence.description}</p>}
          </div>
        )}

        {onglet === "approfondir" && (
          <label className="flex items-center gap-2 font-semibold">
            <input
              type="checkbox"
              checked={lierChapitre}
              onChange={(e) => setLierChapitre(e.target.checked)}
              className="h-5 w-5 accent-[var(--bleu)]"
            />
            Travailler ce critère sur un chapitre précis
          </label>
        )}

        {avecChapitre && (
          <div className="grid gap-5 md:grid-cols-[1fr_auto]">
            <div>
              <label className="etiquette" htmlFor="chapitre">
                Chapitre
              </label>
              <select id="chapitre" className="champ" value={chapitre.id} onChange={(e) => setChapitre(e.target.value)}>
                {themes.map((t) => (
                  <optgroup key={t} label={t}>
                    {chapitres
                      .filter((c) => c.theme === t)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.titre}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
            {(onglet === "qcm" || onglet === "exercice") && (
              <div>
                <span className="etiquette">Difficulté</span>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className="puce"
                      aria-pressed={difficulte === d}
                      onClick={() => setDifficulte(d)}
                    >
                      {NOMS_DIFFICULTE[d]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {onglet === "qcm" && (
          <div>
            <span className="etiquette">Nombre de questions</span>
            <div className="flex gap-2">
              {[5, 10, 15].map((n) => (
                <button key={n} type="button" className="puce" aria-pressed={nombre === n} onClick={() => setNombre(n)}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {onglet !== "qcm" && <ChoixNiveauEleve matiere={matiere.id} />}

        {onglet === "methode" && (
          <div className="space-y-3">
            <label className="etiquette" htmlFor="travail">
              Un extrait de ton travail <span className="normal-case">(facultatif, pour un diagnostic précis)</span>
            </label>
            <textarea
              id="travail"
              className="champ min-h-32"
              value={travail}
              onChange={(e) => setTravail(e.target.value)}
              placeholder="Colle une introduction, un paragraphe, une réponse rédigée… ou prends ta copie en photo."
            />
            <ZoneDepot fichiers={fichiersTravail} onChange={setFichiersTravail} libelle="Ajoute une photo de ta copie" />
          </div>
        )}

        <button type="button" className="bouton text-lg" disabled={occupe} onClick={lancer}>
          <IconeCible width={20} height={20} />
          {libelleBouton}
        </button>
      </div>

      <div ref={resultat} className="scroll-mt-24">
        {onglet === "qcm" && (
          <>
            {chargementQcm && (
              <div className="space-y-2">
                <Reflexion texte="Prof Bac prépare ton QCM" />
                <p className="text-sm text-encre-douce">Cela prend généralement 20 à 60 secondes.</p>
              </div>
            )}
            {erreurQcm && (
              <div className="carte flex flex-wrap items-center justify-between gap-3 p-4" role="alert">
                <p className="font-semibold text-rouge">{erreurQcm}</p>
                <button type="button" className="bouton-second" onClick={() => void lancerQcm()}>
                  Réessayer
                </button>
              </div>
            )}
            {qcm && !chargementQcm && (
              <Quiz
                key={cleQuiz}
                qcm={qcm}
                onFini={(bonnes, total) => {
                  const d = requeteQcm.current?.demande;
                  if (d) enregistrerScore({ matiere: d.matiere, niveau: d.niveau, chapitre: d.chapitre, dernier: bonnes, total });
                }}
                onRecommencer={() => void lancerQcm()}
              />
            )}
          </>
        )}
        {onglet === "exercice" && (
          <FilConversation
            conversation={exercice}
            placeholderSuivi="Propose ta réponse pour qu'elle soit vérifiée, ou pose une question…"
            premiereReponse={(texte, enCours) => (
              <RevelationProgressive
                texte={texte}
                enCours={enCours}
                libelles={["Voir l'indice 1", "Voir l'indice 2", "Voir la correction"]}
              />
            )}
          />
        )}
        {onglet === "approfondir" && (
          <FilConversation
            conversation={approfondissement}
            placeholderSuivi="Envoie ta réponse pour qu'elle soit évaluée critère par critère…"
            premiereReponse={(texte, enCours) => (
              <RevelationProgressive
                texte={texte}
                enCours={enCours}
                libelles={["Voir les coups de pouce", "Voir le corrigé et la grille"]}
              />
            )}
          />
        )}
        {onglet === "methode" && (
          <FilConversation conversation={methode} placeholderSuivi="Une question sur la méthode ? Envoie aussi un essai pour qu'il soit corrigé…" />
        )}
      </div>
    </div>
  );
}

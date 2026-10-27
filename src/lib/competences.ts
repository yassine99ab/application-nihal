// Critères de réussite à travailler, par matière, pour les fiches méthode et les exercices d'approfondissement.
import type { MatiereId } from "./programmes";

export interface Competence {
  id: string;
  nom: string;
  description: string;
}

export const NIVEAUX_ELEVE = {
  difficulte: { nom: "En difficulté", detail: "moins de 8/20" },
  fragile: { nom: "Fragile", detail: "8 à 11/20" },
  correct: { nom: "Correct", detail: "12 à 14/20" },
  bon: { nom: "Bon", detail: "15 à 17/20" },
  excellent: { nom: "Excellent", detail: "18/20 et plus" },
} as const;
export type NiveauEleve = keyof typeof NIVEAUX_ELEVE;
export const IDS_NIVEAU_ELEVE = Object.keys(NIVEAUX_ELEVE) as NiveauEleve[];

/** Niveau estimé à partir d'une moyenne sur 20. */
export function niveauDepuisMoyenne(moyenne: number): NiveauEleve {
  if (moyenne < 8) return "difficulte";
  if (moyenne < 12) return "fragile";
  if (moyenne < 15) return "correct";
  if (moyenne < 18) return "bon";
  return "excellent";
}

const c = (nom: string, description: string): Competence => ({
  id: nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
  nom,
  description,
});

// Maths : les six compétences du programme. Physique-chimie : les compétences de la démarche scientifique.
const MATHS = [
  c("Chercher", "Analyser un problème, expérimenter, émettre une conjecture, prendre des initiatives."),
  c("Modéliser", "Traduire une situation en langage mathématique (fonction, suite, probabilité, géométrie)."),
  c("Représenter", "Choisir et passer d'un registre à l'autre : graphique, tableau, arbre, figure, formule."),
  c("Raisonner", "Démontrer, raisonner par récurrence, par l'absurde, par contre-exemple ; enchaîner les implications."),
  c("Calculer", "Mener des calculs exacts et sûrs, sans calculatrice quand il le faut (automatismes)."),
  c("Communiquer", "Rédiger une solution claire et justifiée, avec le vocabulaire et les notations exacts."),
];

export const COMPETENCES: Record<MatiereId, Competence[]> = {
  maths: MATHS,
  "maths-es": MATHS,
  "physique-chimie": [
    c("S'approprier", "Extraire les informations utiles des documents et de l'énoncé, reformuler le problème."),
    c("Analyser et raisonner", "Formuler une hypothèse, choisir un modèle ou une loi, élaborer une démarche."),
    c("Réaliser", "Mener les calculs littéraux puis numériques, utiliser un modèle, tracer et exploiter un graphique."),
    c("Valider", "Contrôler la vraisemblance, l'homogénéité, l'ordre de grandeur ; exploiter une incertitude."),
    c("Communiquer", "Rédiger une réponse argumentée, avec unités, chiffres significatifs et vocabulaire précis."),
    c("Résolution de problème", "Répondre à une question ouverte en construisant soi-même la démarche complète."),
  ],
  svt: [
    c("Texte argumenté (exercice 1)", "Mobiliser ses connaissances dans un texte structuré : introduction, développement, schéma, conclusion."),
    c("Exploiter un document", "Saisir les informations pertinentes d'un graphique, d'un tableau ou d'une image et les interpréter."),
    c("Raisonnement scientifique (exercice 2)", "Mettre en relation plusieurs documents et ses connaissances pour résoudre un problème."),
    c("Réaliser un schéma", "Construire un schéma bilan clair, légendé et titré."),
    c("Vocabulaire scientifique", "Employer les termes exacts du programme et définir les notions."),
  ],
  francais: [
    c("Rédiger une introduction", "Amorce, présentation de l'auteur et de l'œuvre, contexte, situation, problématique ou projet de lecture, annonce du plan."),
    c("Formuler une problématique", "Transformer un sujet ou un texte en question qui guide toute l'analyse."),
    c("Analyser un procédé", "Citer, nommer le procédé, décrire son effet, l'interpréter au service de la problématique."),
    c("Construire une explication linéaire", "Découper le texte en mouvements et l'analyser phrase par phrase sans paraphraser."),
    c("Construire un plan de dissertation", "Organiser une réflexion progressive en parties et sous-parties liées au sujet et au parcours."),
    c("Rédiger un paragraphe argumentatif", "Idée directrice, argument, exemple précis analysé, lien avec le sujet."),
    c("Transitions, conclusion et ouverture", "Relier les parties, conclure en répondant à la problématique, ouvrir avec pertinence."),
    c("Mobiliser l'œuvre et le parcours", "Choisir des passages signifiants et des références précises."),
    c("Question de grammaire", "Faire l'analyse syntaxique d'une phrase : propositions, fonctions, natures."),
    c("Maîtrise de la langue", "Orthographe, syntaxe, ponctuation et lexique de l'analyse littéraire."),
  ],
  philosophie: [
    c("Analyser le sujet", "Définir les termes, repérer les présupposés et les sens possibles de la question."),
    c("Problématiser", "Faire apparaître la tension ou le paradoxe qui rend la question difficile."),
    c("Définir et distinguer les notions", "Utiliser les distinctions conceptuelles du programme (en fait / en droit, etc.)."),
    c("Construire un plan progressif", "Avancer d'une réponse à une autre en les discutant, sans juxtaposer."),
    c("Utiliser une référence philosophique", "Expliquer la thèse d'un auteur et la mettre au service de l'argument."),
    c("Analyser un exemple", "Choisir un exemple précis et en tirer une idée, au lieu de l'illustrer seulement."),
    c("Expliquer un texte", "Dégager la thèse, le problème, la structure logique, et expliquer chaque moment."),
    c("Introduction et conclusion", "Amener le sujet, poser le problème, annoncer le parcours ; conclure en répondant."),
  ],
  "histoire-geo": [
    c("Question problématisée", "Introduction (termes, bornes, problématique), plan organisé, conclusion."),
    c("Analyse de document(s)", "Présenter, contextualiser, prélever, expliquer et critiquer un document."),
    c("Connaissances précises", "Mobiliser dates, acteurs, lieux, chiffres et notions au bon moment."),
    c("Croquis et schéma", "Construire une légende organisée et un croquis lisible qui répond au sujet."),
    c("Rédiger un paragraphe argumenté", "Idée, explication, exemple développé, lien avec la problématique."),
  ],
};

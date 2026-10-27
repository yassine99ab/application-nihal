// Critères et barèmes de correction, résumés des échelles descriptives officielles
// (notes de service du 11 septembre 2026, BO spécial n° 4 du 17 septembre 2026).
import type { MatiereId } from "./programmes";

export interface Bareme {
  id: string;
  matiere: MatiereId;
  nom: string;
  /** Résumé des critères officiels, transmis à l'IA pour noter. */
  criteres: string;
}

const NIVEAUX_FRANCAIS =
  "Barème indicatif selon le niveau global : très insuffisant 1 à 6 points, insuffisant 7 à 9, satisfaisant 10 à 15, très satisfaisant 16 à 20 (une copie aux niveaux disparates selon les compétences appelle une évaluation adaptée). Une copie défaillante sur l'ensemble de la maîtrise de la langue ne peut pas avoir la moyenne.";

const LANGUE_FRANCAIS =
  "Maîtrise de la langue et de l'expression écrite : orthographe (accords, conjugaison, homophones), syntaxe et construction des phrases, organisation de la réflexion avec un fil conducteur, lexique de la discipline riche et juste.";

const LANGUE_SCIENCES =
  "Maîtrise de la langue (2 points sur 20) : orthographe, syntaxe et ponctuation, lexique scientifique juste, raisonnement formulé et organisé avec un fil conducteur.";

export const BAREMES: Bareme[] = [
  {
    id: "francais-commentaire",
    matiere: "francais",
    nom: "Commentaire de texte (bac de français)",
    criteres: `Grille officielle du commentaire, évaluée par niveau (très insuffisant, insuffisant, satisfaisant, très satisfaisant) :
1. Comprendre le texte : rendre compte de son sens, percevoir son mouvement et sa composition.
2. Analyser et interpréter : identifier et analyser les éléments saillants, percevoir les implicites et les résistances du texte, proposer une réception sensible, interroger sa portée (morale, esthétique, historique) ; construire un discours interprétatif de qualité.
3. Mobiliser une culture littéraire (cours, connaissances, lectures personnelles) pour situer le texte et faire émerger sa singularité.
4. Construire une réflexion organisée : lecture rendue de manière organisée, cheminement étayé, remarques reliées, hiérarchisées et catégorisées.
5. ${LANGUE_FRANCAIS}
${NIVEAUX_FRANCAIS}`,
  },
  {
    id: "francais-dissertation",
    matiere: "francais",
    nom: "Dissertation sur œuvre (bac de français)",
    criteres: `Grille officielle de la dissertation, évaluée par niveau (très insuffisant, insuffisant, satisfaisant, très satisfaisant) :
1. Comprendre et interpréter l'œuvre : lecture effective et informée, repérage précis dans l'œuvre, réception sensible, portée de l'œuvre.
2. Mobiliser une culture littéraire pour éclairer la spécificité de l'œuvre.
3. Comprendre les enjeux du sujet et du parcours : sujet compris et traité, enjeux du parcours maîtrisés.
4. Construire une réflexion : explorer les enjeux du sujet, mobiliser des passages signifiants de l'œuvre, citer et analyser des éléments saillants, organiser et hiérarchiser, étayer son cheminement.
5. ${LANGUE_FRANCAIS}
${NIVEAUX_FRANCAIS}`,
  },
  {
    id: "francais-oral",
    matiere: "francais",
    nom: "Oral de français (explication linéaire)",
    criteres: `Grille officielle de l'oral de français (sur 20) :
Partie 1 (12 points)
- Situer brièvement le texte dans l'œuvre ou le parcours et le lire à voix haute de façon fluide, au service d'une interprétation : 2 points.
- Explication linéaire : 8 points. Comprendre le sens littéral ; identifier et commenter avec pertinence les éléments littéraires et stylistiques qui nourrissent l'interprétation ; construire un discours interprétatif justifié par l'analyse ; mobiliser la connaissance de l'œuvre et du parcours ; organiser son propos dans le temps imparti ; respecter les normes de l'oral scolaire (langue claire, lexique riche) ; s'adresser à l'auditeur pour le convaincre. Repères : 1-2, 3-4, 5-7 ou 8 points.
- Question de grammaire : 2 points. Analyser un fait de langue de façon pertinente avec les notions du programme.
Partie 2 (8 points) : présenter l'œuvre choisie en justifiant son choix ; défendre une interprétation personnelle appuyée sur une connaissance précise de l'œuvre ; dialoguer avec l'examinateur et faire progresser l'échange. Repères : 1-2, 3-4, 5-7 ou 8 points.
Si l'élève n'a préparé que la partie 1, note-la sur 12 et ramène-la sur 20 en le disant.`,
  },
  {
    id: "philo-dissertation",
    matiere: "philosophie",
    nom: "Dissertation de philosophie",
    criteres: `Échelle officielle de la dissertation de philosophie (évaluation globale de 0 à 20). Sont attendus et valorisés : la problématisation du sujet, une argumentation cohérente et progressive, l'analyse de concepts (notions, distinctions) et d'exemples précisément étudiés, des éléments de culture philosophique au service du sujet, une réflexion qui dialogue avec elle-même, une expression claire et une langue maîtrisée.
Repères : 0 à 5, copie inintelligible, non organisée ou excessivement brève ; 6 à 9, propos trop général ou sans rapport avec la question, lieux communs, récitation de cours, exemples sommaires ; au moins 10, réel effort de réflexion et de traitement du sujet (effort de problématisation, de définition des notions, examen de réponses possibles, cohérence globale, langue correcte dans l'ensemble) ; au moins 12, en plus des références et exemples pertinents ; au moins 14, en plus un raisonnement cohérent et progressif aux affirmations rigoureusement justifiées ; au moins 16, bonne problématisation, organisation très cohérente, concepts maîtrisés, souci des enjeux, culture précise, langue nuancée. Une copie défaillante sur la langue ne peut pas avoir la moyenne.`,
  },
  {
    id: "philo-explication",
    matiere: "philosophie",
    nom: "Explication de texte de philosophie",
    criteres: `Échelle officielle de l'explication de texte de philosophie (évaluation globale de 0 à 20). Sont attendus et valorisés : la détermination du problème du texte, l'explication de ses éléments signifiants, l'explicitation de ses articulations, la caractérisation de la position de l'auteur et du questionnement auquel elle répond, une expression claire et une langue maîtrisée.
Repères : 0 à 5, copie inintelligible ou excessivement brève ; 6 à 9, paraphrase plate ou répétition du texte, propos trop général, récitation de cours ; au moins 10, explication commençante sans contresens majeur, propos globalement cohérent ; au moins 12, en plus une attention au détail du propos et à sa structure logique ; au moins 14, en plus une mise en perspective raisonnée avec des connaissances qui permettent d'examiner le problème ; au-delà, explication précise et maîtrisée qui fait apparaître les enjeux. Une copie défaillante sur la langue ne peut pas avoir la moyenne.`,
  },
  {
    id: "hg-question-problematisee",
    matiere: "histoire-geo",
    nom: "Réponse à une question problématisée (histoire-géo)",
    criteres:
      "Attendus de la réponse à une question problématisée : introduction (accroche, définition des termes et des bornes, contexte, problématique, annonce du plan) ; développement organisé en parties qui répondent à la problématique ; connaissances précises (dates, acteurs, lieux, chiffres, notions) ; exemples développés ; conclusion qui répond à la problématique et peut ouvrir ; langue correcte et vocabulaire de la discipline. Note sur 20 selon la qualité de ces éléments.",
  },
  {
    id: "hg-analyse-document",
    matiere: "histoire-geo",
    nom: "Analyse de document(s) (histoire-géo)",
    criteres:
      "Attendus de l'analyse de document(s) : présentation du document (nature, auteur, date, contexte, destinataire) ; réponse organisée à la consigne ; prélèvement et explication d'informations précises citées ; mise en relation avec les connaissances du cours ; regard critique (point de vue, limites, portée) ; conclusion ; langue correcte. Note sur 20.",
  },
  {
    id: "sciences",
    matiere: "maths",
    nom: "Copie scientifique (maths, physique-chimie, SVT)",
    criteres: `Critères scientifiques : exactitude des résultats, rigueur et justification du raisonnement (propriétés citées, étapes explicites), notations et unités correctes, chiffres significatifs, présentation claire ; en SVT, exploitation précise des documents mis en relation avec les connaissances, et texte argumenté structuré (introduction, développement, schéma légendé, conclusion).
${LANGUE_SCIENCES}`,
  },
];

export function getBareme(id: string | undefined): Bareme | undefined {
  return id ? BAREMES.find((b) => b.id === id) : undefined;
}

export function baremesDe(matiere: MatiereId): Bareme[] {
  return BAREMES.filter((b) => b.matiere === matiere);
}

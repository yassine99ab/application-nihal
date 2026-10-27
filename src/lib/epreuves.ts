// Format des épreuves du bac général, utilisé pour les sujets type et le mode examen.
// Source : notes de service du 11 septembre 2026, BO spécial n° 4 du 17 septembre 2026
// (épreuves de juin 2027 : spécialités et philosophie de la session 2027, épreuves anticipées de la session 2028).
import type { MatiereId, Niveau } from "./programmes";

export interface Epreuve {
  id: string;
  matiere: MatiereId;
  niveau: Niveau;
  nom: string;
  dureeMinutes: number;
  coefficient: number;
  calculatrice: string;
  /** Description du format officiel, montrée à l'élève et transmise à l'IA. */
  structure: string;
  /** L'épreuve porte sur les œuvres au programme (bac de français). */
  avecOeuvre?: boolean;
  /** Épreuve orale : le chrono sert au temps de préparation. */
  oral?: boolean;
}

export const EPREUVES: Epreuve[] = [
  {
    id: "maths-terminale",
    matiere: "maths",
    niveau: "terminale",
    nom: "Spécialité mathématiques",
    dureeMinutes: 240,
    coefficient: 16,
    calculatrice: "Précisée par le sujet (calculatrice en mode examen autorisée en 2026)",
    structure:
      "4 exercices indépendants, chacun noté de 4 à 8 points, sur 20 points au total, dont 2 points pour la maîtrise de la langue (rédaction et justifications). Les exercices couvrent plusieurs parties du programme de Terminale (suites, fonctions, logarithme, intégration ou équations différentielles, géométrie dans l'espace, probabilités) ; l'un d'eux peut être un « vrai ou faux » à justifier.",
  },
  {
    id: "maths-premiere",
    matiere: "maths",
    niveau: "premiere",
    nom: "Épreuve anticipée de mathématiques (spécialité)",
    dureeMinutes: 120,
    coefficient: 2,
    calculatrice: "Calculatrice interdite",
    structure:
      "Partie 1 (6 points) : automatismes, sous forme de questions à réponses courtes (calcul numérique et algébrique, évolutions et variations, fonctions et représentations, statistiques, probabilités conditionnelles). Partie 2 (14 points) : 2 ou 3 exercices indépendants sur le programme de Première. 2 points sur 20 récompensent la maîtrise de la langue.",
  },
  {
    id: "maths-premiere-es",
    matiere: "maths-es",
    niveau: "premiere",
    nom: "Épreuve anticipée de mathématiques (sans spécialité)",
    dureeMinutes: 120,
    coefficient: 2,
    calculatrice: "Calculatrice interdite",
    structure:
      "Sujet propre aux élèves sans spécialité mathématiques. Partie 1 (6 points) : automatismes, sous forme de questions à réponses courtes. Partie 2 (14 points) : 2 ou 3 exercices indépendants sur le programme de mathématiques de l'enseignement scientifique (information chiffrée, phénomènes aléatoires, phénomènes d'évolution). 2 points sur 20 récompensent la maîtrise de la langue.",
  },
  {
    id: "pc-terminale",
    matiere: "physique-chimie",
    niveau: "terminale",
    nom: "Spécialité physique-chimie",
    dureeMinutes: 210,
    coefficient: 16,
    calculatrice: "Précisée par le sujet",
    structure:
      "3 exercices indépendants, notés sur 20 points au total dont 2 points pour la maîtrise de la langue, mêlant physique et chimie, avec documents, données et questions de difficulté progressive (dont des questions ouvertes de résolution de problème). La note finale vaut 0,8 × écrit + 0,2 × épreuve pratique (ECE d'1 heure).",
  },
  {
    id: "svt-terminale",
    matiere: "svt",
    niveau: "terminale",
    nom: "Spécialité SVT",
    dureeMinutes: 210,
    coefficient: 16,
    calculatrice: "Non mentionnée (en 2026 : ni calculatrice ni dictionnaire)",
    structure:
      "Écrit noté sur 15 : exercice 1 (6 points), texte argumenté qui mobilise les connaissances pour répondre à une question scientifique (introduction, développement structuré, schéma, conclusion) ; exercice 2 (7 points), raisonnement scientifique à partir d'un dossier de documents ; 2 points d'orthographe et de syntaxe. L'épreuve pratique (ECE d'1 heure) complète la note sur 5 points.",
  },
  {
    id: "francais-ecrit",
    matiere: "francais",
    niveau: "premiere",
    nom: "Bac de français — écrit",
    dureeMinutes: 240,
    coefficient: 5,
    calculatrice: "Aucune",
    avecOeuvre: true,
    structure:
      "Au choix : (1) commentaire d'un texte littéraire qui n'est pas extrait des œuvres au programme ; ou (2) dissertation : un sujet à choisir parmi trois, chacun lié à une œuvre au programme et à son parcours. Noté sur 20 ; une copie défaillante en maîtrise de la langue ne peut pas avoir la moyenne.",
  },
  {
    id: "francais-oral",
    matiere: "francais",
    niveau: "premiere",
    nom: "Bac de français — oral",
    dureeMinutes: 30,
    coefficient: 5,
    calculatrice: "Aucune",
    oral: true,
    avecOeuvre: true,
    structure:
      "30 minutes de préparation puis 20 minutes d'oral. Partie 1 (12 minutes, 12 points) sur un texte du récapitulatif : le situer et le lire à voix haute (2 points), explication linéaire d'un passage d'environ 20 lignes (8 points), question de grammaire, c'est-à-dire l'analyse syntaxique d'une courte phrase du passage (2 points). Partie 2 (8 minutes, 8 points) : présentation de l'œuvre choisie par l'élève puis entretien avec l'examinateur.",
  },
  {
    id: "philo-terminale",
    matiere: "philosophie",
    niveau: "terminale",
    nom: "Philosophie",
    dureeMinutes: 240,
    coefficient: 8,
    calculatrice: "Aucune",
    structure:
      "Un sujet à choisir parmi trois : deux sujets de dissertation (une question chacun) et l'explication d'un texte d'un auteur au programme. Noté sur 20 ; une copie défaillante en maîtrise de la langue ne peut pas avoir la moyenne.",
  },
];

export function getEpreuve(id: string): Epreuve | undefined {
  return EPREUVES.find((e) => e.id === id);
}

export function formatDuree(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

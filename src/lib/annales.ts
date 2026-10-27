// Liens vers les annales officielles ou reconnues. Chaque lien a été ouvert et vérifié en octobre 2026.
import type { MatiereId } from "./programmes";

export interface LienAnnales {
  matiere: MatiereId | "toutes";
  nom: string;
  url: string;
  description: string;
}

export const ANNALES: LienAnnales[] = [
  {
    matiere: "toutes",
    nom: "Éduscol — annales du bac général et technologique",
    url: "https://eduscol.education.gouv.fr/5199/annales-des-epreuves-du-baccalaureat-des-voies-generale-et-technologique",
    description:
      "Tous les sujets officiels depuis 2021 (français, philosophie, maths, physique-chimie, SVT…), avec filtres. Sujets seuls, sans corrigés.",
  },
  {
    matiere: "toutes",
    nom: "Ministère — sujets des examens 2026",
    url: "https://www.education.gouv.fr/brevet-bac-et-cap-les-sujets-des-examens-2026-504911",
    description: "Les sujets de juin 2026 en PDF : français, épreuve anticipée de maths, philosophie et spécialités.",
  },
  {
    matiere: "maths",
    nom: "APMEP — annales de Terminale générale",
    url: "https://www.apmep.fr/Annales-Terminale-Generale",
    description: "Tous les sujets de spécialité maths, chaque année, avec corrigés gratuits (PDF).",
  },
  {
    matiere: "maths",
    nom: "APMEP — épreuve anticipée de mathématiques",
    url: "https://www.apmep.fr/Epreuve-anticipee-2026",
    description: "Sujets 2026 (avec et sans spécialité) et sujets zéro, avec corrigés.",
  },
  {
    matiere: "maths",
    nom: "Éduscol — épreuve anticipée de mathématiques",
    url: "https://eduscol.education.gouv.fr/5688/epreuve-anticipee-de-mathematiques-aux-baccalaureats-general-et-technologique",
    description: "Présentation officielle de l'épreuve et sujets zéro.",
  },
  {
    matiere: "physique-chimie",
    nom: "Labolycée — sujets de physique-chimie",
    url: "https://www.labolycee.org/sujets",
    description: "Les exercices des sujets de bac classés par année, avec corrigés gratuits.",
  },
  {
    matiere: "svt",
    nom: "Académie de Besançon — sujets de spécialité SVT",
    url: "https://svt.ac-besancon.fr/sujets-spe-svt/",
    description: "Les sujets de spécialité SVT de 2021 à 2026 et les sujets zéro (sans corrigés).",
  },
  {
    matiere: "francais",
    nom: "L'Étudiant — sujets corrigés du bac de français 2026",
    url: "https://www.letudiant.fr/bac/corriges-du-bac/article/sujets-corriges-du-bac-de-francais-2026.html",
    description: "Le commentaire et les dissertations de juin 2026, avec des propositions de corrigés (site commercial).",
  },
  {
    matiere: "philosophie",
    nom: "L'Étudiant — sujets corrigés de philosophie 2026",
    url: "https://www.letudiant.fr/bac/corriges-du-bac/article/sujets-et-corriges-bac-philosophie-2026-serie-generale-et-technologique.html",
    description: "Les sujets de juin 2026 avec des propositions de corrigés (site commercial).",
  },
];

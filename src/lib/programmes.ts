// Matières, niveaux et chapitres des programmes du lycée général (voie générale).
// Ce fichier est partagé entre le serveur (consignes de l'IA) et le navigateur (menus).
import { OEUVRES } from "./oeuvres";

export type Niveau = "premiere" | "terminale";

export type MatiereId =
  | "maths"
  | "maths-es"
  | "physique-chimie"
  | "svt"
  | "francais"
  | "philosophie"
  | "histoire-geo";

export interface Chapitre {
  id: string;
  titre: string;
  theme: string;
}

export interface Matiere {
  id: MatiereId;
  nom: string;
  /** Nom court pour les étiquettes. */
  court: string;
  /** Sciences : LaTeX, calculs vérifiés, résultat encadré. */
  scientifique: boolean;
  /** Nom de la variable CSS de couleur (voir globals.css). */
  couleur: string;
  /** Programme officiel suivi, rappelé à l'IA. */
  programme: Partial<Record<Niveau, string>>;
  niveaux: Partial<Record<Niveau, Chapitre[]>>;
}

export const NIVEAUX: Record<Niveau, string> = {
  premiere: "Première",
  terminale: "Terminale",
};

export function slug(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

type Themes = Record<string, string[]>;

function chapitres(themes: Themes): Chapitre[] {
  return Object.entries(themes).flatMap(([theme, titres]) =>
    titres.map((titre) => ({ id: slug(titre), titre, theme })),
  );
}

export const MATIERES: Matiere[] = [
  {
    id: "maths",
    nom: "Mathématiques",
    court: "Maths",
    scientifique: true,
    couleur: "--maths",
    programme: {
      premiere:
        "nouveau programme de spécialité mathématiques de Première (arrêté du 26 février 2026, en vigueur depuis la rentrée 2026)",
      terminale:
        "programme de spécialité mathématiques de Terminale de 2019 (le nouveau programme de Terminale ne s'appliquera qu'en 2027-2028)",
    },
    niveaux: {
      premiere: chapitres({
        "Automatismes": [
          "Automatismes : évolutions et variations",
          "Automatismes : calcul numérique et algébrique",
          "Automatismes : fonctions et représentations",
          "Automatismes : statistiques",
          "Automatismes : probabilités conditionnelles",
        ],
        "Algèbre": [
          "Suites numériques, modèles discrets",
          "Équations, fonctions polynômes du second degré",
        ],
        "Analyse": [
          "Dérivation : nombre dérivé et tangente",
          "Dérivation : fonctions dérivées et opérations",
          "Variations et courbes représentatives des fonctions",
          "Fonction exponentielle",
          "Trigonométrie : cercle trigonométrique, cosinus et sinus d'un réel",
        ],
        "Géométrie": [
          "Calcul vectoriel et produit scalaire",
          "Géométrie repérée : vecteur normal, projeté orthogonal, équation de cercle",
        ],
        "Probabilités et statistiques": [
          "Probabilités conditionnelles et indépendance",
          "Variables aléatoires réelles : loi, espérance, variance",
          "Expérimentations : simulation d'échantillons",
        ],
        "Parties transversales": [
          "Vocabulaire ensembliste et logique",
          "Algorithmique et programmation : notion de liste",
        ],
      }),
      terminale: chapitres({
        "Algèbre et géométrie": [
          "Combinatoire et dénombrement",
          "Vecteurs, droites et plans de l'espace",
          "Orthogonalité et distances dans l'espace",
          "Représentations paramétriques et équations cartésiennes",
        ],
        "Analyse": [
          "Raisonnement par récurrence",
          "Limites de suites",
          "Limites de fonctions",
          "Continuité et théorème des valeurs intermédiaires",
          "Compléments sur la dérivation et convexité",
          "Fonction logarithme népérien",
          "Fonctions sinus et cosinus",
          "Primitives et équations différentielles",
          "Calcul intégral",
        ],
        "Probabilités": [
          "Loi binomiale et schéma de Bernoulli",
          "Sommes de variables aléatoires",
          "Concentration et loi des grands nombres",
        ],
        "Algorithmique": ["Algorithmique et programmation en Python (listes)"],
      }),
    },
  },
  {
    id: "maths-es",
    nom: "Maths (sans spécialité)",
    court: "Maths ES",
    scientifique: true,
    couleur: "--maths",
    programme: {
      premiere:
        "programme de mathématiques intégrées à l'enseignement scientifique de Première (arrêté du 26 février 2026, en vigueur depuis la rentrée 2026), pour les élèves qui n'ont pas la spécialité mathématiques",
    },
    niveaux: {
      premiere: chapitres({
        "Automatismes": [
          "Automatismes : évolutions et variations",
          "Automatismes : calcul numérique et algébrique",
          "Automatismes : fonctions et représentations",
          "Automatismes : statistiques",
          "Automatismes : probabilités conditionnelles",
        ],
        "Analyse de l'information chiffrée": [
          "Tableaux croisés d'effectifs et de fréquences",
          "Nuages de points et ajustement affine",
        ],
        "Phénomènes aléatoires": [
          "Probabilités conditionnelles et indépendance",
          "Répétition d'épreuves indépendantes",
        ],
        "Phénomènes d'évolution": [
          "Variation linéaire : suites arithmétiques et fonctions affines",
          "Modélisation quadratique : fonctions du second degré",
          "Variation exponentielle : suites géométriques et fonctions exponentielles",
        ],
      }),
    },
  },
  {
    id: "physique-chimie",
    nom: "Physique-chimie",
    court: "PC",
    scientifique: true,
    couleur: "--pc",
    programme: {
      premiere: "programme de spécialité physique-chimie de Première de 2019",
      terminale: "programme de spécialité physique-chimie de Terminale de 2019",
    },
    niveaux: {
      premiere: chapitres({
        "Constitution et transformations de la matière": [
          "Suivi de l'évolution d'un système : quantité de matière et avancement",
          "Réactions d'oxydo-réduction",
          "Titrage colorimétrique",
          "Structure des entités : schéma de Lewis, géométrie et polarité",
          "Cohésion de la matière et solubilité",
          "Molécules organiques, groupes caractéristiques et spectroscopie IR",
          "Synthèses organiques",
          "Combustions et conversions d'énergie",
        ],
        "Mouvement et interactions": [
          "Interactions fondamentales et notion de champ",
          "Fluide au repos : pression et loi fondamentale de la statique des fluides",
          "Mouvement d'un système et deuxième loi de Newton",
        ],
        "L'énergie : conversions et transferts": [
          "Aspects énergétiques des phénomènes électriques",
          "Aspects énergétiques des phénomènes mécaniques",
        ],
        "Ondes et signaux": [
          "Ondes mécaniques progressives",
          "Lentilles minces, images et couleurs",
          "Modèle ondulatoire et particulaire de la lumière",
        ],
      }),
      terminale: chapitres({
        "Constitution et transformations de la matière": [
          "Transformations acide-base et pH",
          "Méthodes physiques d'analyse : spectrophotométrie et conductimétrie",
          "Titrages pH-métriques et conductimétriques",
          "Cinétique chimique : vitesse et temps de demi-réaction",
          "Mécanismes réactionnels",
          "Prévoir l'état final : quotient de réaction et constante d'équilibre",
          "Piles et électrolyse",
          "Force des acides et des bases : Ka, pKa et diagrammes de prédominance",
          "Stratégies de synthèse organique",
        ],
        "Mouvement et interactions": [
          "Décrire un mouvement : position, vitesse, accélération",
          "Deuxième loi de Newton et mouvement dans un champ uniforme",
          "Mouvement dans un champ de gravitation et lois de Kepler",
          "Mécanique des fluides : poussée d'Archimède, débit et relation de Bernoulli",
        ],
        "L'énergie : conversions et transferts": [
          "Modèle du gaz parfait",
          "Premier principe de la thermodynamique et transferts thermiques",
        ],
        "Ondes et signaux": [
          "Intensité sonore, diffraction et interférences",
          "Effet Doppler",
          "Lunette astronomique",
          "Effet photoélectrique et dualité onde-particule",
          "Dynamique d'un système électrique : condensateur et circuit RC",
        ],
      }),
    },
  },
  {
    id: "svt",
    nom: "Sciences de la vie et de la Terre",
    court: "SVT",
    scientifique: true,
    couleur: "--svt",
    programme: {
      premiere: "programme de spécialité SVT de Première de 2019",
      terminale: "programme de spécialité SVT de Terminale de 2019",
    },
    niveaux: {
      premiere: chapitres({
        "Transmission, variation et expression du patrimoine génétique": [
          "Divisions cellulaires des eucaryotes et des bactéries",
          "Réplication de l'ADN",
          "Mutations de l'ADN et variabilité génétique",
          "Expression du patrimoine génétique : transcription et traduction",
          "Les enzymes, biomolécules aux propriétés catalytiques",
        ],
        "La dynamique interne de la Terre": [
          "Structure du globe terrestre",
          "Dynamique de la lithosphère",
        ],
        "Écosystèmes et services environnementaux": [
          "Écosystèmes : interactions dynamiques entre êtres vivants et milieu",
          "L'humanité et les écosystèmes : services écosystémiques",
        ],
        "Corps humain et santé": [
          "Variation génétique et santé : maladies génétiques et cancers",
          "Résistance des bactéries aux antibiotiques",
          "Le système immunitaire : immunité innée et adaptative",
          "Vaccination et mémoire immunitaire",
        ],
      }),
      terminale: chapitres({
        "Génétique et évolution": [
          "Origine du génotype : méiose, brassages et fécondation",
          "Complexification des génomes : transferts horizontaux et endosymbiose",
          "Évolution des génomes dans les populations : Hardy-Weinberg, dérive et sélection",
          "Autres mécanismes de diversification du vivant",
        ],
        "À la recherche du passé géologique": [
          "Le temps et les roches : chronologies relative et absolue",
          "Traces d'un passé mouvementé : chaînes de montagnes",
        ],
        "De la plante sauvage à la plante domestiquée": [
          "Organisation fonctionnelle des plantes à fleurs",
          "La plante, productrice de matière organique",
          "Reproduction de la plante entre vie fixée et mobilité",
          "La domestication des plantes",
        ],
        "Les climats de la Terre": [
          "Reconstituer et comprendre les climats passés",
          "Effet de serre et réchauffement climatique actuel",
          "Conséquences du réchauffement et possibilités d'action",
        ],
        "Corps humain et santé": [
          "Réflexe myotatique et commande nerveuse du mouvement",
          "Cerveau et mouvement volontaire, plasticité cérébrale",
          "Contraction musculaire et apport d'énergie",
          "Comportements et stress : système nerveux et cortisol",
        ],
      }),
    },
  },
  {
    id: "francais",
    nom: "Français",
    court: "Français",
    scientifique: false,
    couleur: "--francais",
    programme: {
      premiere: "programme de français de Première et œuvres au programme de l'année 2026-2027",
    },
    niveaux: {
      premiere: chapitres({
        "Objets d'étude": [
          "La poésie du XIXe au XXIe siècle",
          "La littérature d'idées du XVIe au XVIIIe siècle",
          "Le roman et le récit du Moyen Âge au XXIe siècle",
          "Le théâtre du XVIIe au XXIe siècle",
        ],
        "Méthodes du bac": [
          "Méthode du commentaire de texte",
          "Méthode de la dissertation sur œuvre",
          "Méthode de l'explication linéaire (oral)",
          "Préparer l'entretien de l'oral sur l'œuvre choisie",
        ],
        "Œuvres au programme": OEUVRES.map((o) => `${o.auteur}, ${o.titre} — ${o.parcours}`),
        "Grammaire": [
          "L'analyse syntaxique de la phrase (question de grammaire de l'oral)",
          "Les propositions subordonnées relatives",
          "Les propositions subordonnées conjonctives",
          "L'interrogation",
          "La négation",
          "Les accords et le participe passé",
        ],
        "Outils d'analyse": [
          "Figures de style",
          "Versification et analyse du poème",
          "Registres et tonalités",
          "Histoire littéraire : grands mouvements",
        ],
      }),
    },
  },
  {
    id: "philosophie",
    nom: "Philosophie",
    court: "Philo",
    scientifique: false,
    couleur: "--philo",
    programme: { terminale: "programme de philosophie de Terminale générale (17 notions)" },
    niveaux: {
      terminale: chapitres({
        "Notions": [
          "L'art",
          "Le bonheur",
          "La conscience",
          "Le devoir",
          "L'État",
          "L'inconscient",
          "La justice",
          "Le langage",
          "La liberté",
          "La nature",
          "La raison",
          "La religion",
          "La science",
          "La technique",
          "Le temps",
          "Le travail",
          "La vérité",
        ],
        "Méthodes": [
          "Méthode de la dissertation de philosophie",
          "Méthode de l'explication de texte",
        ],
      }),
    },
  },
  {
    id: "histoire-geo",
    nom: "Histoire-géographie",
    court: "HG",
    scientifique: false,
    couleur: "--hg",
    programme: {
      premiere: "programme d'histoire-géographie de Première générale",
      terminale: "programme d'histoire-géographie de Terminale générale",
    },
    niveaux: {
      premiere: chapitres({
        "Histoire": [
          "L'Europe face aux révolutions (1789-1848)",
          "La France dans l'Europe des nationalités (1848-1871)",
          "La Troisième République avant 1914 : régime politique et empire colonial",
          "La Première Guerre mondiale : le « suicide de l'Europe » et la fin des empires",
        ],
        "Géographie": [
          "La métropolisation : un processus mondial différencié",
          "Diversification des espaces et des acteurs de la production",
          "Les espaces ruraux : multifonctionnalité ou fragmentation ?",
          "La Chine : des recompositions spatiales multiples",
        ],
        "Méthodes": [
          "Méthode de la réponse à une question problématisée",
          "Méthode de l'analyse de document(s)",
          "Méthode du croquis et du schéma",
        ],
      }),
      terminale: chapitres({
        "Histoire": [
          "Fragilités des démocraties, totalitarismes et Seconde Guerre mondiale (1929-1945)",
          "Un monde bipolaire : la guerre froide et la décolonisation (1945-années 1970)",
          "Les remises en cause des années 1970 à 1991",
          "Le monde, l'Europe et la France depuis les années 1990",
        ],
        "Géographie": [
          "Mers et océans : au cœur de la mondialisation",
          "Dynamiques territoriales, coopérations et tensions dans la mondialisation",
          "L'Union européenne dans la mondialisation",
          "La France et ses régions dans l'Union européenne et la mondialisation",
        ],
        "Méthodes": [
          "Méthode de la réponse à une question problématisée",
          "Méthode de l'analyse de document(s)",
          "Méthode du croquis et du schéma",
        ],
      }),
    },
  },
];

export function getMatiere(id: string): Matiere | undefined {
  return MATIERES.find((m) => m.id === id);
}

export function matieresDuNiveau(niveau: Niveau): Matiere[] {
  return MATIERES.filter((m) => m.niveaux[niveau]?.length);
}

export function getChapitre(
  matiere: MatiereId,
  niveau: Niveau,
  chapitreId: string,
): Chapitre | undefined {
  return getMatiere(matiere)?.niveaux[niveau]?.find((c) => c.id === chapitreId);
}

/** Année des épreuves de juin pour l'année scolaire en cours (de septembre à décembre : l'année suivante). */
export function anneeExamens(date = new Date()): number {
  return date.getMonth() >= 8 ? date.getFullYear() + 1 : date.getFullYear();
}

/** Numéro de session officiel : les épreuves anticipées de Première comptent pour la session suivante. */
export function sessionOfficielle(niveau: Niveau, date = new Date()): number {
  return anneeExamens(date) + (niveau === "premiere" ? 1 : 0);
}

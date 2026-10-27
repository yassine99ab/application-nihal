// Œuvres au programme du bac de français, voie générale, pour l'année scolaire 2026-2027
// (épreuves anticipées de juin 2027, « session 2028 » dans les textes officiels).
// Source : note de service du 4 juillet 2025, BO n° 30 du 24 juillet 2025 (NOR MENE2518792N).
// À mettre à jour chaque année : il suffit de modifier ce tableau.

export interface Oeuvre {
  objet: string;
  auteur: string;
  titre: string;
  parcours: string;
}

export const ANNEE_OEUVRES = "2026-2027";

export const OEUVRES: Oeuvre[] = [
  {
    objet: "La poésie du XIXe au XXIe siècle",
    auteur: "Arthur Rimbaud",
    titre: "Cahier de Douai",
    parcours: "émancipations créatrices",
  },
  {
    objet: "La poésie du XIXe au XXIe siècle",
    auteur: "Francis Ponge",
    titre: "La rage de l'expression",
    parcours: "dans l'atelier du poète",
  },
  {
    objet: "La poésie du XIXe au XXIe siècle",
    auteur: "Hélène Dorion",
    titre: "Mes forêts",
    parcours: "la poésie, la nature, l'intime",
  },
  {
    objet: "La littérature d'idées du XVIe au XVIIIe siècle",
    auteur: "Étienne de La Boétie",
    titre: "Discours de la servitude volontaire",
    parcours: "« Défendre » et « entretenir » la liberté",
  },
  {
    objet: "La littérature d'idées du XVIe au XVIIIe siècle",
    auteur: "Fontenelle",
    titre: "Entretiens sur la pluralité des mondes",
    parcours: "le gout de la science",
  },
  {
    objet: "La littérature d'idées du XVIe au XVIIIe siècle",
    auteur: "Françoise de Graffigny",
    titre: "Lettres d'une Péruvienne",
    parcours: "« un nouvel univers s'est offert à mes yeux »",
  },
  {
    objet: "Le roman et le récit du Moyen Âge au XXIe siècle",
    auteur: "Chrétien de Troyes",
    titre: "Le Chevalier de la charrette",
    parcours: "le roman et l'invention de l'amour",
  },
  {
    objet: "Le roman et le récit du Moyen Âge au XXIe siècle",
    auteur: "Émile Zola",
    titre: "Pot-Bouille",
    parcours: "dévoiler les rouages de la société",
  },
  {
    objet: "Le roman et le récit du Moyen Âge au XXIe siècle",
    auteur: "Simone Schwarz-Bart",
    titre: "Pluie et vent sur Télumée Miracle",
    parcours: "tisser les mémoires, habiter le monde",
  },
  {
    objet: "Le théâtre du XVIIe au XXIe siècle",
    auteur: "Pierre Corneille",
    titre: "Le Menteur",
    parcours: "mensonge et comédie",
  },
  {
    objet: "Le théâtre du XVIIe au XXIe siècle",
    auteur: "Alfred de Musset",
    titre: "On ne badine pas avec l'amour",
    parcours: "les jeux du cœur et de la parole",
  },
  {
    objet: "Le théâtre du XVIIe au XXIe siècle",
    auteur: "Nathalie Sarraute",
    titre: "Pour un oui ou pour un non",
    parcours: "théâtre et dispute",
  },
];

export function libelleOeuvre(o: Oeuvre): string {
  return `${o.auteur}, ${o.titre} — parcours : ${o.parcours}`;
}

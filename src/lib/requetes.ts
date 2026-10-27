// Format des requêtes envoyées par le navigateur aux routes /api/*.
// Le navigateur n'importe que les types ; les schémas zod sont vérifiés côté serveur.
import { z } from "zod";

export const MODES = [
  "correction",
  "indices",
  "copie",
  "redaction",
  "cours",
  "exercice",
  "sujet-bac",
  "question",
  "analyse",
  "methode",
  "approfondissement",
] as const;
export type Mode = (typeof MODES)[number];

export const TYPES_FICHIER = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const;

export const TYPES_REDACTION = [
  "dissertation",
  "commentaire",
  "explication-lineaire",
  "plan",
  "resume",
  "redaction-libre",
] as const;
export type TypeRedaction = (typeof TYPES_REDACTION)[number];

export const DIFFICULTES = ["facile", "moyen", "difficile"] as const;

export const TYPES_ANALYSE = ["oral", "ecrit"] as const;
export type TypeAnalyse = (typeof TYPES_ANALYSE)[number];

export const NIVEAUX_ELEVE_IDS = ["difficulte", "fragile", "correct", "bon", "excellent"] as const;
export type Difficulte = (typeof DIFFICULTES)[number];

const matiere = z.enum([
  "maths",
  "maths-es",
  "physique-chimie",
  "svt",
  "francais",
  "philosophie",
  "histoire-geo",
]);
const niveau = z.enum(["premiere", "terminale"]);

export const fichierSchema = z.object({
  nom: z.string().max(200),
  type: z.enum(TYPES_FICHIER),
  /** Contenu en base64, sans préfixe data:. */
  data: z.string().min(1),
});
export type Fichier = z.infer<typeof fichierSchema>;

export const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  texte: z.string().max(200_000),
  fichiers: z.array(fichierSchema).max(10).optional(),
});
export type MessageEleve = z.infer<typeof messageSchema>;

export const optionsSchema = z.object({
  difficulte: z.enum(DIFFICULTES).optional(),
  typeRedaction: z.enum(TYPES_REDACTION).optional(),
  epreuve: z.string().max(60).optional(),
  oeuvre: z.string().max(300).optional(),
  chapitre: z.string().max(300).optional(),
  /** Analyse de texte : explication linéaire (oral) ou commentaire (écrit). */
  typeAnalyse: z.enum(TYPES_ANALYSE).optional(),
  grammaire: z.boolean().optional(),
  /** Grille de correction (voir baremes.ts). */
  bareme: z.string().max(60).optional(),
  /** Critère de réussite travaillé (voir competences.ts). */
  competence: z.string().max(200).optional(),
  niveauEleve: z.enum(NIVEAUX_ELEVE_IDS).optional(),
});
export type OptionsGeneration = z.infer<typeof optionsSchema>;

export const genererSchema = z.object({
  mode: z.enum(MODES),
  matiere,
  niveau,
  options: optionsSchema.default({}),
  messages: z.array(messageSchema).min(1).max(40),
});
export type RequeteGenerer = z.input<typeof genererSchema>;

export const qcmSchema = z.object({
  matiere,
  niveau,
  chapitre: z.string().min(1).max(300),
  difficulte: z.enum(DIFFICULTES),
  nombre: z.number().int().min(3).max(15),
});
export type RequeteQcm = z.infer<typeof qcmSchema>;

/** Événements du flux NDJSON renvoyé par /api/generer. */
export type EvenementFlux =
  | { t: "reflexion" }
  | { t: "texte"; v: string }
  | { t: "fin"; arret: string | null }
  | { t: "erreur"; v: string };

export interface QuestionQcm {
  enonce: string;
  choix: string[];
  bonneReponse: number;
  explication: string;
}

export interface Qcm {
  titre: string;
  questions: QuestionQcm[];
}

/** Marqueurs que l'IA place dans ses réponses (découpés côté navigateur). */
export const MARQUEUR_ETAPE = "@@ETAPE@@";
export const MARQUEUR_CORRIGE = "@@CORRIGE@@";
export const REGEX_NOTE = /@@NOTE:\s*([0-9]+(?:[.,][0-9]+)?)\s*\/\s*20\s*@@/;

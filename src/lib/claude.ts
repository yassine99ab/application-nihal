import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { MessageEleve } from "./requetes";

export const MODELE = "claude-opus-5-5";

// Si le modèle refuse une demande, l'API la relance d'elle-même sur le modèle de secours recommandé.
const BETAS: Anthropic.Beta.AnthropicBeta[] = ["server-side-fallback-2026-07-01"];

export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

let client: { cle: string | undefined; instance: Anthropic } | undefined;

function getClient(): Anthropic {
  // Lit ANTHROPIC_API_KEY dans l'environnement (fichier .env), uniquement côté serveur.
  // Le client est recréé si la clé change, pour qu'une clé ajoutée au .env serve sans redémarrer.
  const cle = process.env.ANTHROPIC_API_KEY;
  if (!client || client.cle !== cle) client = { cle, instance: new Anthropic() };
  return client.instance;
}

interface Appel {
  system: string;
  messages: Anthropic.Beta.BetaMessageParam[];
  effort: Effort;
  maxTokens?: number;
  format?: Anthropic.Beta.BetaJSONOutputFormat;
}

export function lancerFlux({ system, messages, effort, maxTokens = 64000, format }: Appel) {
  return getClient().beta.messages.stream({
    model: MODELE,
    max_tokens: maxTokens,
    betas: BETAS,
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: format ? { effort, format } : { effort },
    // Met en cache le début de la conversation (consignes, sujet, fichiers) pour les questions de suivi.
    cache_control: { type: "ephemeral" },
    system,
    messages,
  });
}

/** Convertit l'historique envoyé par le navigateur au format de l'API (fichiers avant le texte). */
export function versMessagesApi(messages: MessageEleve[]): Anthropic.Beta.BetaMessageParam[] {
  return messages.map((m) => {
    if (m.role === "assistant") {
      return { role: "assistant", content: m.texte.trim() || "(réponse vide)" };
    }
    const blocs: Anthropic.Beta.BetaContentBlockParam[] = [];
    for (const f of m.fichiers ?? []) {
      if (f.type === "application/pdf") {
        blocs.push({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: f.data },
          title: f.nom,
        });
      } else {
        blocs.push({
          type: "image",
          source: { type: "base64", media_type: f.type, data: f.data },
        });
      }
    }
    blocs.push({ type: "text", text: m.texte.trim() || "Voici le sujet." });
    return { role: "user", content: blocs };
  });
}

export function texteFinal(message: Anthropic.Beta.BetaMessage): string {
  return message.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

export const MESSAGE_REFUS =
  "L'IA a refusé de répondre à cette demande. Reformule-la en restant sur le travail scolaire, ou essaie avec un autre sujet.";

/** Traduit une erreur de l'API en message compréhensible pour l'élève. */
export function messageErreur(err: unknown): string {
  const cleAbsente = !process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN;
  if (err instanceof Anthropic.AuthenticationError || (cleAbsente && !(err instanceof Anthropic.APIError))) {
    return "Clé API manquante ou invalide. Ajoute ANTHROPIC_API_KEY=ta_clé dans le fichier .env à la racine du projet, enregistre-le, puis recharge la page.";
  }
  if (err instanceof Anthropic.PermissionDeniedError) {
    return "Ta clé API n'a pas accès à ce modèle. Vérifie ton compte sur console.anthropic.com.";
  }
  if (err instanceof Anthropic.RateLimitError) {
    return "Trop de demandes d'un coup pour ton compte API. Attends une minute puis réessaie.";
  }
  if (err instanceof Anthropic.BadRequestError) {
    return `La demande n'a pas pu être traitée (fichier trop lourd, illisible, ou crédit API épuisé ?). Détail : ${err.message}`;
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return "Impossible de joindre l'API Anthropic. Vérifie ta connexion internet.";
  }
  if (err instanceof Anthropic.APIError) {
    if (err.status === 529 || (err.status ?? 0) >= 500) {
      return "Le service est momentanément surchargé. Réessaie dans quelques instants.";
    }
    return `Erreur de l'API (${err.status}) : ${err.message}`;
  }
  return "Une erreur inattendue est survenue. Réessaie.";
}

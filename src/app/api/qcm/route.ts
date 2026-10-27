import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { MESSAGE_REFUS, lancerFlux, messageErreur, texteFinal } from "@/lib/claude";
import { consignesQcm } from "@/lib/prompts";
import { qcmSchema, type Qcm } from "@/lib/requetes";

const sortieQcm = z.object({
  titre: z.string(),
  questions: z.array(
    z.object({
      enonce: z.string(),
      choix: z.array(z.string()),
      bonneReponse: z.number().int(),
      explication: z.string(),
    }),
  ),
});

export async function POST(request: Request) {
  const corps = qcmSchema.safeParse(await request.json().catch(() => null));
  if (!corps.success) {
    return Response.json({ erreur: "Requête invalide." }, { status: 400 });
  }
  const { matiere, niveau, chapitre, difficulte, nombre } = corps.data;

  try {
    const flux = lancerFlux({
      system: consignesQcm(matiere, niveau, chapitre, difficulte, nombre),
      effort: "medium",
      maxTokens: 32000,
      format: betaZodOutputFormat(sortieQcm),
      messages: [{ role: "user", content: `QCM de ${nombre} questions : ${chapitre}` }],
    });
    request.signal.addEventListener("abort", () => flux.abort());
    const message = await flux.finalMessage();
    if (message.stop_reason === "refusal") {
      return Response.json({ erreur: MESSAGE_REFUS }, { status: 422 });
    }
    if (message.stop_reason === "max_tokens") {
      return Response.json({ erreur: "QCM trop long : réessaie avec moins de questions." }, { status: 422 });
    }

    const qcm: Qcm = sortieQcm.parse(JSON.parse(texteFinal(message)));
    // Une question mal formée gâcherait le quiz : on ne garde que les questions valides.
    qcm.questions = qcm.questions.filter(
      (q) => q.choix.length >= 2 && q.bonneReponse >= 0 && q.bonneReponse < q.choix.length,
    );
    if (!qcm.questions.length) {
      return Response.json({ erreur: "Le QCM généré était incomplet. Réessaie." }, { status: 502 });
    }
    return Response.json(qcm);
  } catch (err) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    console.error("[api/qcm]", err);
    const message =
      err instanceof SyntaxError || err instanceof z.ZodError
        ? "Le QCM généré était mal formé. Réessaie."
        : messageErreur(err);
    return Response.json({ erreur: message }, { status: 502 });
  }
}

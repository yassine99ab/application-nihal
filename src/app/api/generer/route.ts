import { MESSAGE_REFUS, lancerFlux, messageErreur, versMessagesApi } from "@/lib/claude";
import { construireConsignes } from "@/lib/prompts";
import { genererSchema, type EvenementFlux } from "@/lib/requetes";

// L'API accepte 32 Mo par requête ; on garde une marge pour le texte et l'encodage.
const TAILLE_MAX_FICHIERS = 28 * 1024 * 1024;

export async function POST(request: Request) {
  const corps = genererSchema.safeParse(await request.json().catch(() => null));
  if (!corps.success) {
    return Response.json({ erreur: "Requête invalide." }, { status: 400 });
  }
  const { mode, matiere, niveau, options, messages } = corps.data;

  const tailleFichiers = messages
    .flatMap((m) => m.fichiers ?? [])
    .reduce((total, f) => total + f.data.length, 0);
  if (tailleFichiers > TAILLE_MAX_FICHIERS) {
    return Response.json(
      { erreur: "Fichiers trop lourds (28 Mo maximum au total). Réduis le nombre de pages ou de photos." },
      { status: 413 },
    );
  }

  const { system, effort } = construireConsignes(mode, matiere, niveau, options);
  const encodeur = new TextEncoder();
  let flux: ReturnType<typeof lancerFlux> | undefined;

  const corpsReponse = new ReadableStream<Uint8Array>({
    async start(controller) {
      const envoyer = (e: EvenementFlux) =>
        controller.enqueue(encodeur.encode(JSON.stringify(e) + "\n"));
      try {
        flux = lancerFlux({ system, effort, messages: versMessagesApi(messages) });
        let reflexionSignalee = false;
        for await (const evenement of flux) {
          if (
            evenement.type === "content_block_start" &&
            evenement.content_block.type === "thinking" &&
            !reflexionSignalee
          ) {
            reflexionSignalee = true;
            envoyer({ t: "reflexion" });
          } else if (
            evenement.type === "content_block_delta" &&
            evenement.delta.type === "text_delta"
          ) {
            envoyer({ t: "texte", v: evenement.delta.text });
          }
        }
        const final = await flux.finalMessage();
        if (final.stop_reason === "refusal") envoyer({ t: "erreur", v: MESSAGE_REFUS });
        envoyer({ t: "fin", arret: final.stop_reason });
      } catch (err) {
        if (request.signal.aborted) return;
        console.error("[api/generer]", err);
        envoyer({ t: "erreur", v: messageErreur(err) });
      } finally {
        try {
          controller.close();
        } catch {
          // Flux déjà fermé par le navigateur.
        }
      }
    },
    cancel() {
      flux?.abort();
    },
  });

  return new Response(corpsReponse, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

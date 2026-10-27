// Côté navigateur : appelle /api/generer et lit le flux NDJSON événement par événement.
import type { EvenementFlux, RequeteGenerer } from "./requetes";

export async function* lireFlux(
  requete: RequeteGenerer,
  signal?: AbortSignal,
): AsyncGenerator<EvenementFlux> {
  let reponse: Response;
  try {
    reponse = await fetch("/api/generer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requete),
      signal,
    });
  } catch (err) {
    if (signal?.aborted) return;
    yield { t: "erreur", v: "Impossible de contacter le serveur de l'application. Est-il bien lancé ?" };
    console.error(err);
    return;
  }

  if (!reponse.ok || !reponse.body) {
    const corps = (await reponse.json().catch(() => null)) as { erreur?: string } | null;
    yield { t: "erreur", v: corps?.erreur ?? `Erreur du serveur (${reponse.status}).` };
    return;
  }

  const lecteur = reponse.body.pipeThrough(new TextDecoderStream()).getReader();
  let tampon = "";
  try {
    while (true) {
      const { value, done } = await lecteur.read();
      if (done) break;
      tampon += value;
      let fin = tampon.indexOf("\n");
      while (fin >= 0) {
        const ligne = tampon.slice(0, fin).trim();
        tampon = tampon.slice(fin + 1);
        if (ligne) yield JSON.parse(ligne) as EvenementFlux;
        fin = tampon.indexOf("\n");
      }
    }
  } catch (err) {
    if (signal?.aborted) return;
    console.error(err);
    yield { t: "erreur", v: "La connexion a été interrompue pendant la réponse." };
  }
}

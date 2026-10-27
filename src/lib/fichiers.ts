// Côté navigateur : prépare les photos et PDF avant l'envoi à l'API.
import type { Fichier } from "./requetes";

const COTE_MAX = 1600;
const PDF_MAX_OCTETS = 20 * 1024 * 1024;

function lireEnBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader();
    lecteur.onload = () => {
      const url = String(lecteur.result);
      resolve(url.slice(url.indexOf(",") + 1));
    };
    lecteur.onerror = () => reject(lecteur.error);
    lecteur.readAsDataURL(blob);
  });
}

async function compresserImage(fichier: File): Promise<Blob> {
  let image: ImageBitmap;
  try {
    image = await createImageBitmap(fichier);
  } catch {
    throw new Error(
      `Impossible de lire l'image « ${fichier.name} ». Utilise une photo JPEG ou PNG (sur iPhone : Réglages > Appareil photo > Formats > Le plus compatible).`,
    );
  }
  const echelle = Math.min(1, COTE_MAX / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * echelle);
  canvas.height = Math.round(image.height * echelle);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Ton navigateur ne permet pas de traiter l'image.");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Compression de l'image impossible."))),
      "image/jpeg",
      0.85,
    ),
  );
}

export async function preparerFichier(fichier: File): Promise<Fichier> {
  if (fichier.type === "application/pdf") {
    if (fichier.size > PDF_MAX_OCTETS) {
      throw new Error(`« ${fichier.name} » dépasse 20 Mo. Envoie seulement les pages utiles.`);
    }
    return { nom: fichier.name, type: "application/pdf", data: await lireEnBase64(fichier) };
  }
  if (fichier.type.startsWith("image/") || /\.(heic|heif)$/i.test(fichier.name)) {
    const blob = await compresserImage(fichier);
    return { nom: fichier.name, type: "image/jpeg", data: await lireEnBase64(blob) };
  }
  throw new Error(`Format non pris en charge : « ${fichier.name} ». Utilise une photo ou un PDF.`);
}

export function urlApercu(f: Fichier): string | null {
  return f.type.startsWith("image/") ? `data:${f.type};base64,${f.data}` : null;
}

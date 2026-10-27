"use client";
import { useEffect, useState, type ReactNode } from "react";
import type { Conversation } from "@/lib/useConversation";
import { MARQUEUR_CORRIGE, MARQUEUR_ETAPE, REGEX_NOTE, type MessageEleve } from "@/lib/requetes";
import MathMarkdown from "./MathMarkdown";
import { IconeEnvoyer, IconeImprimer, IconeRecommencer, IconeStop } from "./Icones";

/** Retire les marqueurs techniques (@@ETAPE@@, @@NOTE@@…) pour un affichage simple. */
export function nettoyer(texte: string): string {
  return texte
    .replace(REGEX_NOTE, "")
    .replaceAll(MARQUEUR_ETAPE, "\n\n---\n\n")
    .replaceAll(MARQUEUR_CORRIGE, "\n\n---\n\n## Corrigé\n\n")
    .trim();
}

export function lireNote(texte: string): number | null {
  const m = texte.match(REGEX_NOTE);
  return m ? Number(m[1].replace(",", ".")) : null;
}

export function Reflexion({ texte = "Prof Bac réfléchit" }: { texte?: string }) {
  // Les réponses détaillées commencent parfois après plus d'une minute : on affiche le temps écoulé.
  const [secondes, setSecondes] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setSecondes((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="py-2 text-encre-douce" role="status">
      <div className="flex items-center gap-3">
        <span className="crayon text-2xl" aria-hidden="true">
          ✏️
        </span>
        <span className="manuscrit text-2xl text-encre-douce">
          {texte}
          <span className="points" aria-hidden="true">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </span>
        {secondes >= 5 && <span className="font-mono text-sm tabular-nums">{secondes} s</span>}
      </div>
      {secondes >= 15 && (
        <p className="mt-1 text-sm">
          Pour une réponse détaillée, la réflexion dure souvent 1 à 2 minutes avant que le texte s&apos;affiche.
          Reste sur cette page (tu peux utiliser une autre application en attendant).
        </p>
      )}
    </div>
  );
}

export function NoteRouge({ note }: { note: number }) {
  return (
    <div
      className="manuscrit inline-flex -rotate-6 items-baseline gap-1 rounded-[50%] border-[2.5px] border-rouge px-5 py-2 text-4xl"
      aria-label={`Note estimée : ${note} sur 20`}
    >
      {String(note).replace(".", ",")}
      <span className="text-2xl">/20</span>
    </div>
  );
}

function MessageUtilisateur({ message }: { message: MessageEleve }) {
  const [ouvert, setOuvert] = useState(false);
  const long = message.texte.length > 320;
  return (
    <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-carte-2 px-4 py-3 text-[0.97rem]">
      <p className="whitespace-pre-wrap">
        {long && !ouvert ? `${message.texte.slice(0, 320)}…` : message.texte}
      </p>
      {long && (
        <button type="button" className="mt-1 text-sm font-bold text-bleu" onClick={() => setOuvert(!ouvert)}>
          {ouvert ? "Réduire" : "Tout afficher"}
        </button>
      )}
      {!!message.fichiers?.length && (
        <p className="mt-1 text-xs font-semibold text-encre-douce">
          📎 {message.fichiers.map((f) => f.nom).join(", ")}
        </p>
      )}
    </div>
  );
}

interface Props {
  conversation: Conversation;
  /** Affichage personnalisé de la première réponse (indices progressifs, sujet + corrigé…). */
  premiereReponse?: (texte: string, enCours: boolean) => ReactNode;
  /** Masquer la première demande (déjà visible dans le formulaire). */
  masquerPremiereDemande?: boolean;
  placeholderSuivi?: string;
  sansSuivi?: boolean;
}

export default function FilConversation({
  conversation,
  premiereReponse,
  masquerPremiereDemande = true,
  placeholderSuivi = "Une question sur cette réponse ? Ex. : « Je n'ai pas compris l'étape 2 »",
  sansSuivi = false,
}: Props) {
  const { messages, enCours, reflexion, erreur, tronque, envoyer, relancer, arreter } = conversation;
  const [suivi, setSuivi] = useState("");
  if (!messages.length) return null;

  const indexPremiereReponse = messages.findIndex((m) => m.role === "assistant");
  const derniere = messages.at(-1);
  const attendReponse = enCours && derniere?.role === "assistant" && !derniere.texte;

  function envoyerSuivi() {
    const texte = suivi.trim();
    if (!texte || enCours) return;
    setSuivi("");
    void envoyer(texte);
  }

  return (
    <section className="space-y-5" aria-live="polite">
      {messages.map((m, i) => {
        if (m.role === "user") {
          if (i === 0 && masquerPremiereDemande) return null;
          return <MessageUtilisateur key={i} message={m} />;
        }
        if (!m.texte) return null;
        const enCoursIci = enCours && i === messages.length - 1;
        const note = lireNote(m.texte);
        return (
          <article key={i} className={i === indexPremiereReponse ? "copie apparait" : "carte apparait p-5"}>
            {note !== null && !enCoursIci && (
              <div className="mb-4 flex justify-end">
                <NoteRouge note={note} />
              </div>
            )}
            {i === indexPremiereReponse && premiereReponse ? (
              premiereReponse(m.texte, enCoursIci)
            ) : (
              <MathMarkdown texte={nettoyer(m.texte)} />
            )}
          </article>
        );
      })}

      {(attendReponse || reflexion) && <Reflexion />}

      {erreur && (
        <div className="carte flex flex-col gap-3 border-rouge p-4 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <p className="font-semibold text-rouge">{erreur}</p>
          {!enCours && (
            <button type="button" className="bouton-second shrink-0" onClick={() => void relancer()}>
              <IconeRecommencer width={18} height={18} /> Réessayer
            </button>
          )}
        </div>
      )}

      {tronque && !enCours && (
        <p className="text-sm font-semibold text-rouge">
          La réponse a été coupée car elle était très longue. Demande « continue » pour la suite.
        </p>
      )}

      <div className="no-print flex flex-wrap items-center gap-2">
        {enCours ? (
          <button type="button" className="bouton-second" onClick={arreter}>
            <IconeStop width={18} height={18} /> Arrêter
          </button>
        ) : (
          indexPremiereReponse >= 0 && (
            <button type="button" className="bouton-second" onClick={() => window.print()}>
              <IconeImprimer width={18} height={18} /> Imprimer / PDF
            </button>
          )
        )}
        <p className="text-xs text-encre-douce">
          Réponse générée par une IA : vérifie avec ton professeur en cas de doute.
        </p>
      </div>

      {!sansSuivi && indexPremiereReponse >= 0 && (
        <form
          className="no-print carte flex items-end gap-2 p-2"
          onSubmit={(e) => {
            e.preventDefault();
            envoyerSuivi();
          }}
        >
          <textarea
            value={suivi}
            onChange={(e) => setSuivi(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                envoyerSuivi();
              }
            }}
            rows={1}
            placeholder={placeholderSuivi}
            className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 outline-none placeholder:text-encre-douce/80"
            aria-label="Question de suivi"
          />
          <button type="submit" className="bouton h-11 w-11 shrink-0 p-0" disabled={!suivi.trim() || enCours} aria-label="Envoyer">
            <IconeEnvoyer width={20} height={20} />
          </button>
        </form>
      )}
    </section>
  );
}

"use client";
import Link from "next/link";
import FilConversation from "@/components/FilConversation";
import { IconeCible, IconeLivre, IconeRecommencer } from "@/components/Icones";
import type { MatiereId, Niveau } from "@/lib/programmes";
import { cleFiche, ecrire, lire } from "@/lib/stockage";
import { useConversation, type ConfigConversation } from "@/lib/useConversation";

interface Props {
  matiere: MatiereId;
  niveau: Niveau;
  chapitreId: string;
  chapitre: string;
}

export default function FicheCours({ matiere, niveau, chapitreId, chapitre }: Props) {
  const cle = cleFiche(matiere, niveau, chapitreId);
  const config: ConfigConversation = { mode: "cours", matiere, niveau, options: { chapitre } };
  const demande = `Fiche de cours : ${chapitre}`;

  const conversation = useConversation(
    (_, messages) => {
      // On garde seulement la fiche elle-même (pas les questions de suivi).
      const fiche = messages[1];
      if (fiche?.role === "assistant") ecrire(cle, fiche.texte);
    },
    () => {
      const fiche = lire<string | null>(cle, null);
      return fiche
        ? {
            config,
            messages: [
              { role: "user", texte: demande },
              { role: "assistant", texte: fiche },
            ],
          }
        : null;
    },
  );

  const aFiche = conversation.messages.length > 0;
  const parametres = new URLSearchParams({ niveau, matiere, chapitre: chapitreId });

  return (
    <div className="space-y-6">
      {!aFiche && (
        <div className="copie apparait flex flex-col items-start gap-4">
          <p className="max-w-xl text-lg">
            Ta fiche n&apos;existe pas encore. Elle contiendra les définitions, les propriétés, les méthodes avec
            exemples corrigés, les erreurs fréquentes et ce qui tombe au bac.
          </p>
          <button type="button" className="bouton text-lg" onClick={() => void conversation.demarrer(config, demande)}>
            <IconeLivre width={20} height={20} /> Générer ma fiche de cours
          </button>
          <p className="text-sm text-encre-douce">Environ 30 secondes à 1 minute. Elle sera gardée sur cet appareil.</p>
        </div>
      )}

      <FilConversation conversation={conversation} placeholderSuivi="Pose une question sur ce chapitre…" />

      {aFiche && !conversation.enCours && (
        <div className="no-print flex flex-wrap gap-2">
          <Link href={`/entrainement?${parametres}&onglet=qcm`} className="bouton">
            <IconeCible width={18} height={18} /> QCM sur ce chapitre
          </Link>
          <Link href={`/entrainement?${parametres}&onglet=exercice`} className="bouton-second">
            Un exercice d&apos;entraînement
          </Link>
          <button
            type="button"
            className="bouton-second"
            onClick={() => {
              if (window.confirm("Remplacer ta fiche actuelle par une nouvelle version ?")) {
                void conversation.demarrer(config, demande);
              }
            }}
          >
            <IconeRecommencer width={18} height={18} /> Régénérer la fiche
          </button>
        </div>
      )}
    </div>
  );
}

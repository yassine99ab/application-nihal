import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ClientSeulement from "@/components/ClientSeulement";
import { couleur } from "@/lib/style";
import { MATIERES, NIVEAUX, getChapitre, getMatiere, type Niveau } from "@/lib/programmes";
import FicheCours from "./FicheCours";

type Props = PageProps<"/cours/[niveau]/[matiere]/[chapitre]">;

export function generateStaticParams() {
  return MATIERES.flatMap((m) =>
    Object.entries(m.niveaux).flatMap(([niveau, chapitres]) =>
      chapitres.map((c) => ({ niveau, matiere: m.id, chapitre: c.id })),
    ),
  );
}

function trouver(niveau: string, matiere: string, chapitre: string) {
  const m = getMatiere(matiere);
  if (!m || !(niveau in NIVEAUX)) return null;
  const c = getChapitre(m.id, niveau as Niveau, chapitre);
  return c ? { matiere: m, niveau: niveau as Niveau, chapitre: c } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { niveau, matiere, chapitre } = await params;
  const trouve = trouver(niveau, matiere, chapitre);
  return { title: trouve ? `${trouve.chapitre.titre} — ${trouve.matiere.court}` : "Cours" };
}

export default function Page({ params }: Props) {
  return (
    <Suspense fallback={<div className="copie h-64 animate-pulse" />}>
      <Contenu params={params} />
    </Suspense>
  );
}

async function Contenu({ params }: { params: Props["params"] }) {
  const { niveau, matiere, chapitre } = await params;
  const trouve = trouver(niveau, matiere, chapitre);
  if (!trouve) notFound();
  const { matiere: m, chapitre: c } = trouve;

  return (
    <div style={couleur(m)}>
      <nav className="no-print mb-4 text-sm font-semibold text-encre-douce" aria-label="Fil d'Ariane">
        <Link href="/cours" className="hover:text-encre">
          Cours
        </Link>{" "}
        / {m.nom} · {NIVEAUX[trouve.niveau]} / {c.theme}
      </nav>
      <header className="apparait mb-8">
        <p className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-encre-douce">
          <span className="pastille" /> {m.nom} — {NIVEAUX[trouve.niveau]}
        </p>
        <h1 className="titre max-w-3xl text-4xl font-semibold sm:text-5xl">{c.titre}</h1>
      </header>
      <ClientSeulement attente={<div className="copie h-64 animate-pulse" />}>
        <FicheCours matiere={m.id} niveau={trouve.niveau} chapitreId={c.id} chapitre={c.titre} />
      </ClientSeulement>
    </div>
  );
}

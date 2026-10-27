import type { Metadata } from "next";
import ClientSeulement from "@/components/ClientSeulement";
import EnTete from "@/components/EnTete";
import { IconeLien } from "@/components/Icones";
import { ANNALES } from "@/lib/annales";
import { EPREUVES, formatDuree } from "@/lib/epreuves";
import { MATIERES, NIVEAUX, getMatiere } from "@/lib/programmes";
import { couleur } from "@/lib/style";
import SujetType from "./SujetType";

export const metadata: Metadata = { title: "Bac" };

export default function Page() {
  const groupes = [
    { id: "toutes", nom: "Toutes matières", liens: ANNALES.filter((a) => a.matiere === "toutes") },
    ...MATIERES.map((m) => ({ id: m.id, nom: m.nom, liens: ANNALES.filter((a) => a.matiere === m.id) })),
  ].filter((g) => g.liens.length);

  return (
    <>
      <EnTete titre={<>Objectif <span className="stabilo">bac</span></>} annotation="comme le jour J">
        Des sujets type inédits au format officiel, un chrono pour te mettre en condition, ta copie notée sur
        20, et les annales officielles.
      </EnTete>

      <section aria-labelledby="titre-sujets" className="space-y-4">
        <h2 id="titre-sujets" className="titre no-print text-3xl font-semibold">
          Sujets type et mode examen
        </h2>
        <ClientSeulement attente={<div className="carte h-80 animate-pulse" />}>
          <SujetType />
        </ClientSeulement>
      </section>

      <section aria-labelledby="titre-annales" className="no-print mt-14 space-y-4">
        <h2 id="titre-annales" className="titre text-3xl font-semibold">
          Annales officielles
        </h2>
        <p className="max-w-2xl text-encre-douce">
          Les vrais sujets des sessions précédentes. Télécharge le PDF d&apos;un sujet, puis dépose-le dans{" "}
          <a href="/corriger" className="font-bold text-bleu underline underline-offset-4">
            Corriger
          </a>{" "}
          pour obtenir la correction détaillée ou faire noter ta copie.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {groupes.map((g) => {
            const m = getMatiere(g.id);
            return (
              <div key={g.id} className="carte p-5" style={m ? couleur(m) : undefined}>
                <h3 className="mb-3 flex items-center gap-2 font-bold">
                  <span className="pastille" /> {g.nom}
                </h3>
                <ul className="space-y-3">
                  {g.liens.map((l) => (
                    <li key={l.url}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-2 font-semibold text-bleu"
                      >
                        <IconeLien width={18} height={18} className="mt-0.5 shrink-0" />
                        <span className="group-hover:underline group-hover:underline-offset-4">{l.nom}</span>
                      </a>
                      <p className="ml-6 text-sm text-encre-douce">{l.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="titre-formats" className="no-print mt-14 space-y-4">
        <h2 id="titre-formats" className="titre text-3xl font-semibold">
          Le format des épreuves
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {EPREUVES.map((e) => {
            const m = getMatiere(e.matiere);
            return (
              <article key={e.id} className="carte p-5" style={m ? couleur(m) : undefined}>
                <h3 className="flex items-center gap-2 font-bold">
                  <span className="pastille" /> {e.nom}
                </h3>
                <p className="mt-1 text-sm font-semibold text-encre-douce">
                  {NIVEAUX[e.niveau]} · {formatDuree(e.dureeMinutes)} · coefficient {e.coefficient} · {e.calculatrice}
                </p>
                <p className="mt-2 text-[0.95rem]">{e.structure}</p>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}

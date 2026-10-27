import Link from "next/link";
import { IconeCible, IconeEchelle, IconeLivre, IconeLoupe, IconeStylo, IconeToque } from "@/components/Icones";
import MathMarkdown from "@/components/MathMarkdown";
import { MATIERES } from "@/lib/programmes";
import { couleur } from "@/lib/style";
import Reprendre from "./Reprendre";

const ACTIONS = [
  {
    href: "/corriger",
    titre: "Corriger un sujet",
    texte: "Photo ou texte : la correction détaillée, des indices, ou ta copie notée sur 20.",
    Icone: IconeStylo,
    accent: "var(--rouge)",
  },
  {
    href: "/analyser",
    titre: "Analyser un texte",
    texte: "Explication linéaire ou commentaire de n'importe quel extrait, phrase par phrase.",
    Icone: IconeLoupe,
    accent: "var(--francais)",
  },
  {
    href: "/cours",
    titre: "Comprendre le cours",
    texte: "Une fiche complète par chapitre du programme, et toutes tes questions.",
    Icone: IconeLivre,
    accent: "var(--bleu)",
  },
  {
    href: "/entrainement",
    titre: "S'entraîner",
    texte: "QCM corrigés et exercices inédits avec indices progressifs.",
    Icone: IconeCible,
    accent: "var(--vert)",
  },
  {
    href: "/entrainement?onglet=methode",
    titre: "Progresser à ton niveau",
    texte: "Fiches méthode personnalisées et exercices d'approfondissement par critère de réussite.",
    Icone: IconeEchelle,
    accent: "var(--pc)",
  },
  {
    href: "/bac",
    titre: "Objectif bac",
    texte: "Sujets type au format officiel, chrono, annales et bac de français.",
    Icone: IconeToque,
    accent: "var(--philo)",
  },
];

const EXEMPLE = `**Exercice.** Résoudre dans $\\mathbb{R}$ : $e^{2x} - 3e^{x} + 2 = 0$.

On pose $X = e^{x}$ (avec $X > 0$) : l'équation devient $X^2 - 3X + 2 = 0$.

$\\Delta = 9 - 8 = 1$, donc $X_1 = 1$ et $X_2 = 2$.

$e^{x} = 1 \\iff x = 0$ et $e^{x} = 2 \\iff x = \\ln 2$.

$$\\boxed{S = \\{0\\,;\\ \\ln 2\\}}$$`;

export default function Accueil() {
  return (
    <>
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="apparait">
          <p className="manuscrit mb-2 -rotate-2 text-3xl">Première &amp; Terminale</p>
          <h1 className="titre text-5xl font-semibold sm:text-6xl">
            Ton bac, <span className="italic">corrigé</span> et <span className="stabilo">expliqué</span>.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-encre-douce">
            Maths, physique-chimie, SVT, français, philo, histoire-géo : envoie n&apos;importe quel sujet et
            obtiens une correction pas à pas, des fiches de cours, des QCM et des sujets type bac.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/corriger" className="bouton text-lg">
              <IconeStylo width={20} height={20} /> Corriger un sujet
            </Link>
            <Link href="/bac" className="bouton-second text-lg">
              Faire un sujet type
            </Link>
          </div>
        </div>

        <div className="apparait relative" style={{ animationDelay: "120ms" }} aria-label="Exemple de correction">
          <div className="copie rotate-1">
            <MathMarkdown texte={EXEMPLE} />
          </div>
          <p className="manuscrit absolute -top-5 right-4 rotate-3 text-3xl">Très bien !</p>
          <div className="manuscrit absolute -bottom-6 -left-2 -rotate-6 rounded-[50%] border-[2.5px] border-rouge bg-carte px-4 py-1.5 text-3xl">
            20<span className="text-xl">/20</span>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Que veux-tu faire ?">
        {ACTIONS.map(({ href, titre, texte, Icone, accent }, i) => (
          <Link
            key={href}
            href={href}
            className="carte apparait group relative overflow-hidden p-5 transition-transform hover:-translate-y-1"
            style={{ animationDelay: `${200 + i * 70}ms` }}
          >
            <span
              className="mb-4 grid h-11 w-11 place-items-center rounded-xl text-white"
              style={{ background: accent }}
            >
              <Icone width={22} height={22} />
            </span>
            <h2 className="titre text-2xl font-semibold">{titre}</h2>
            <p className="mt-1.5 text-encre-douce">{texte}</p>
            <span className="mt-3 inline-block font-bold transition-transform group-hover:translate-x-1" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </section>

      <Reprendre />

      <section className="mt-14" aria-labelledby="titre-matieres">
        <h2 id="titre-matieres" className="etiquette">
          Réviser par matière
        </h2>
        <div className="flex flex-wrap gap-2">
          {MATIERES.map((m) => (
            <Link key={m.id} href={`/cours?matiere=${m.id}`} className="puce" style={couleur(m)}>
              <span className="pastille" /> {m.nom}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

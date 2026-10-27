"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconeAccueil,
  IconeCible,
  IconeHorloge,
  IconeLivre,
  IconeLoupe,
  IconeStylo,
  IconeToque,
} from "./Icones";

const LIENS = [
  { href: "/", nom: "Accueil", Icone: IconeAccueil },
  { href: "/corriger", nom: "Corriger", Icone: IconeStylo },
  { href: "/analyser", nom: "Analyser", Icone: IconeLoupe },
  { href: "/cours", nom: "Cours", Icone: IconeLivre },
  { href: "/entrainement", nom: "S'entraîner", Icone: IconeCible },
  { href: "/bac", nom: "Bac", Icone: IconeToque },
  { href: "/historique", nom: "Historique", Icone: IconeHorloge },
];

function estActif(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Logo() {
  return (
    <Link href="/" className="titre flex items-baseline gap-1 text-[1.6rem] font-semibold">
      <span className="italic">Prof</span>
      <span className="stabilo">Bac</span>
    </Link>
  );
}

export default function Nav() {
  const pathname = usePathname();
  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-ligne bg-papier/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
            {LIENS.slice(1).map(({ href, nom }) => {
              const actif = estActif(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={actif ? "page" : undefined}
                  className={`rounded-full px-3.5 py-1.5 font-semibold transition-colors ${
                    actif ? "bg-encre text-papier" : "text-encre-douce hover:text-encre"
                  }`}
                >
                  {nom}
                </Link>
              );
            })}
          </nav>
          <span className="manuscrit hidden text-xl lg:inline">ton cahier de révision</span>
        </div>
      </header>

      {/* Barre d'onglets en bas de l'écran sur téléphone. */}
      <nav
        className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-ligne bg-papier/95 backdrop-blur-md md:hidden"
        aria-label="Navigation"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-6">
          {/* Sur téléphone, le logo ramène à l'accueil : la barre garde six onglets. */}
          {LIENS.slice(1).map(({ href, nom, Icone }) => {
            const actif = estActif(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={actif ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[0.66rem] font-bold ${
                  actif ? "text-encre" : "text-encre-douce"
                }`}
              >
                <span className={`rounded-full px-3 py-0.5 ${actif ? "bg-stabilo text-[#1d2440]" : ""}`}>
                  <Icone width={20} height={20} />
                </span>
                {nom}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

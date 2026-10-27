// Petites icônes au trait, dessinées pour l'appli (pas de dépendance externe).
import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

function Icone({ children, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconeAccueil = (p: Props) => (
  <Icone {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20h5v-6h4v6h5V9.5" />
  </Icone>
);

export const IconeStylo = (p: Props) => (
  <Icone {...p}>
    <path d="M14.5 4.5 19.5 9.5 9 20H4v-5L14.5 4.5Z" />
    <path d="m12.5 6.5 5 5" />
  </Icone>
);

export const IconeLivre = (p: Props) => (
  <Icone {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
    <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5" />
    <path d="M9 7.5h7M9 11h5" />
  </Icone>
);

export const IconeCible = (p: Props) => (
  <Icone {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
  </Icone>
);

export const IconeToque = (p: Props) => (
  <Icone {...p}>
    <path d="m2.5 9 9.5-4.5L21.5 9 12 13.5 2.5 9Z" />
    <path d="M6.5 11v4.5c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3V11" />
    <path d="M21.5 9v5.5" />
  </Icone>
);

export const IconeHorloge = (p: Props) => (
  <Icone {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icone>
);

export const IconeTrombone = (p: Props) => (
  <Icone {...p}>
    <path d="M20 11.5 12.2 19.3a5 5 0 0 1-7.1-7.1l8-8a3.4 3.4 0 0 1 4.8 4.8l-8 8a1.7 1.7 0 0 1-2.4-2.4l7.4-7.4" />
  </Icone>
);

export const IconeAppareil = (p: Props) => (
  <Icone {...p}>
    <path d="M4 8h3l1.5-2.5h7L17 8h3v11H4V8Z" />
    <circle cx="12" cy="13.5" r="3.5" />
  </Icone>
);

export const IconeImprimer = (p: Props) => (
  <Icone {...p}>
    <path d="M7 9V3.5h10V9" />
    <rect x="3.5" y="9" width="17" height="7.5" rx="2" />
    <path d="M7 14h10v6.5H7z" />
  </Icone>
);

export const IconeEnvoyer = (p: Props) => (
  <Icone {...p}>
    <path d="M4 12 20 4l-5 16-3.5-6.5L4 12Z" />
    <path d="m11.5 13.5 3-3" />
  </Icone>
);

export const IconeCroix = (p: Props) => (
  <Icone {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icone>
);

export const IconeStop = (p: Props) => (
  <Icone {...p}>
    <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
  </Icone>
);

export const IconeRecommencer = (p: Props) => (
  <Icone {...p}>
    <path d="M4 12a8 8 0 1 0 2.4-5.7" />
    <path d="M4 4v4h4" />
  </Icone>
);

export const IconeLien = (p: Props) => (
  <Icone {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4 11 13" />
    <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
  </Icone>
);

export const IconeOeil = (p: Props) => (
  <Icone {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icone>
);

export const IconeCorbeille = (p: Props) => (
  <Icone {...p}>
    <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" />
  </Icone>
);

export const IconeLoupe = (p: Props) => (
  <Icone {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
    <path d="M8 9h5M8 12h3.5" />
  </Icone>
);

export const IconeEchelle = (p: Props) => (
  <Icone {...p}>
    <path d="M4 20h4v-5H4zM10 20h4V10h-4zM16 20h4V4h-4z" />
  </Icone>
);

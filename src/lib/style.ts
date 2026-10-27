import type { CSSProperties } from "react";
import type { Matiere } from "./programmes";

/** Couleur de la matière, exposée en variable CSS --c (pastilles, bordures). */
export function couleur(m: Pick<Matiere, "couleur">): CSSProperties {
  return { "--c": `var(${m.couleur})` } as CSSProperties;
}

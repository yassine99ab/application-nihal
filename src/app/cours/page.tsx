import type { Metadata } from "next";
import { Suspense } from "react";
import EnTete from "@/components/EnTete";
import ListeCours from "./ListeCours";

export const metadata: Metadata = { title: "Cours" };

export default function Page() {
  return (
    <>
      <EnTete titre={<>Le <span className="stabilo">cours</span>, chapitre par chapitre</>} annotation="programmes officiels">
        Choisis un chapitre : tu obtiens une fiche détaillée (définitions, méthodes, exemples corrigés, pièges)
        et tu peux poser toutes tes questions.
      </EnTete>
      <Suspense fallback={<div className="carte h-80 animate-pulse" />}>
        <ListeCours />
      </Suspense>
    </>
  );
}

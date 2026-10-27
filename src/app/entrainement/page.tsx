import type { Metadata } from "next";
import { Suspense } from "react";
import EnTete from "@/components/EnTete";
import Entrainement from "./Entrainement";

export const metadata: Metadata = { title: "S'entraîner" };

export default function Page() {
  return (
    <>
      <EnTete titre={<>S&apos;<span className="stabilo">entraîner</span></>} annotation="QCM et exercices inédits">
        Des QCM corrigés pour vérifier tes connaissances, et des exercices avec indices progressifs puis
        correction détaillée.
      </EnTete>
      <Suspense fallback={<div className="carte h-80 animate-pulse" />}>
        <Entrainement />
      </Suspense>
    </>
  );
}

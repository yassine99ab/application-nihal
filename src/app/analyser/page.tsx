import type { Metadata } from "next";
import ClientSeulement from "@/components/ClientSeulement";
import EnTete from "@/components/EnTete";
import Analyser from "./Analyser";

export const metadata: Metadata = { title: "Analyser un texte" };

export default function Page() {
  return (
    <>
      <EnTete titre={<>Analyser un <span className="stabilo">texte</span></>} annotation="bac de français, écrit et oral">
        N&apos;importe quel extrait, expliqué phrase par phrase : introduction avec amorce, contexte et problématique,
        mouvements, procédés et interprétations, conclusion et ouverture.
      </EnTete>
      <ClientSeulement attente={<div className="carte h-96 animate-pulse" />}>
        <Analyser />
      </ClientSeulement>
    </>
  );
}

import type { Metadata } from "next";
import EnTete from "@/components/EnTete";
import Corriger from "./Corriger";

export const metadata: Metadata = { title: "Corriger un sujet" };

export default function Page() {
  return (
    <>
      <EnTete titre={<>Corriger un <span className="stabilo">sujet</span></>} annotation="n'importe quel exercice !">
        Écris ou photographie ton sujet : tu obtiens la correction détaillée, des indices pour chercher seul,
        ou la note de ta copie.
      </EnTete>
      <Corriger />
    </>
  );
}

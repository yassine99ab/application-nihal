import type { Metadata } from "next";
import ClientSeulement from "@/components/ClientSeulement";
import EnTete from "@/components/EnTete";
import Historique from "./Historique";

export const metadata: Metadata = { title: "Historique" };

export default function Page() {
  return (
    <>
      <EnTete titre={<>Mon <span className="stabilo">historique</span></>} annotation="tout est gardé ici">
        Retrouve tes corrections, tes exercices et tes sujets, et suis tes progrès aux QCM. Tout reste sur cet
        appareil.
      </EnTete>
      <ClientSeulement attente={<div className="carte h-60 animate-pulse" />}>
        <Historique />
      </ClientSeulement>
    </>
  );
}

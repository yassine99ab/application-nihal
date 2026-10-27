"use client";
import type { ReactNode } from "react";
import { useMonte } from "@/lib/stockage";

/** N'affiche son contenu qu'une fois dans le navigateur (quand il dépend du stockage local). */
export default function ClientSeulement({ children, attente = null }: { children: ReactNode; attente?: ReactNode }) {
  return useMonte() ? children : attente;
}

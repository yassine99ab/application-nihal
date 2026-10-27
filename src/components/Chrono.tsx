"use client";
import { useEffect, useState } from "react";
import { formatDuree } from "@/lib/epreuves";

function formater(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/** Compte à rebours de l'épreuve, avec pause. */
export default function Chrono({ dureeMinutes, libelle = "Épreuve" }: { dureeMinutes: number; libelle?: string }) {
  const total = dureeMinutes * 60_000;
  const [demarre, setDemarre] = useState<number | null>(null);
  const [ecouleAvantPause, setEcouleAvantPause] = useState(0);
  const [maintenant, setMaintenant] = useState(0);

  useEffect(() => {
    if (demarre === null) return;
    const id = window.setInterval(() => setMaintenant(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [demarre]);

  const ecoule = ecouleAvantPause + (demarre !== null ? Math.max(0, maintenant - demarre) : 0);
  const restant = total - ecoule;
  const fini = restant <= 0;
  const lance = demarre !== null || ecouleAvantPause > 0;

  function demarrer() {
    const t = Date.now();
    setMaintenant(t);
    setDemarre(t);
  }

  function pause() {
    if (demarre === null) return;
    setEcouleAvantPause(ecoule);
    setDemarre(null);
  }

  return (
    <div className="no-print sticky top-[4.5rem] z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-[1.5px] border-encre bg-carte px-4 py-3 shadow-lg">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-encre-douce">
          {libelle} · {formatDuree(dureeMinutes)}
        </p>
        <p
          className={`font-mono text-3xl font-bold tabular-nums ${fini || restant < 10 * 60_000 ? "text-rouge" : ""}`}
          role="timer"
          aria-live="off"
        >
          {fini ? "Temps écoulé !" : formater(restant)}
        </p>
      </div>
      <div className="flex gap-2">
        {!lance && (
          <button type="button" className="bouton" onClick={demarrer}>
            Démarrer le chrono
          </button>
        )}
        {lance && !fini && (
          <button type="button" className="bouton-second" onClick={demarre === null ? demarrer : pause}>
            {demarre === null ? "Reprendre" : "Pause"}
          </button>
        )}
        {lance && (
          <button
            type="button"
            className="bouton-second"
            onClick={() => {
              setDemarre(null);
              setEcouleAvantPause(0);
            }}
          >
            Remettre à zéro
          </button>
        )}
      </div>
    </div>
  );
}

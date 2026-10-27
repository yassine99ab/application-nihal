import type { ReactNode } from "react";

export default function EnTete({
  titre,
  annotation,
  children,
}: {
  titre: ReactNode;
  /** Petite note manuscrite au stylo rouge. */
  annotation?: string;
  children?: ReactNode;
}) {
  return (
    <header className="no-print apparait mb-8">
      {annotation && <p className="manuscrit mb-1 -rotate-2 text-2xl">{annotation}</p>}
      <h1 className="titre text-4xl font-semibold sm:text-5xl">{titre}</h1>
      {children && <div className="mt-3 max-w-2xl text-lg text-encre-douce">{children}</div>}
    </header>
  );
}

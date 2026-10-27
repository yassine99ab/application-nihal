"use client";
import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/contrib/mhchem";

const remarkPlugins = [remarkGfm, remarkMath];
const rehypePlugins: Parameters<typeof ReactMarkdown>[0]["rehypePlugins"] = [
  [rehypeKatex, { throwOnError: false, strict: false, trust: false, errorColor: "var(--rouge)" }],
];

/** Découpe le Markdown en blocs indépendants (hors code et formules centrées) pour ne re-rendre que le dernier pendant le streaming. */
function decouperBlocs(texte: string): string[] {
  const blocs: string[] = [];
  let courant: string[] = [];
  let dansCode = false;
  let dansFormule = false;
  let apresLigneVide = false;
  for (const ligne of texte.split("\n")) {
    const l = ligne.trim();
    // On coupe après une ligne vide, sauf si la ligne suivante est indentée (suite d'un élément de liste).
    if (l && apresLigneVide && !/^\s/.test(ligne) && courant.length) {
      blocs.push(courant.join("\n"));
      courant = [];
    }
    if (l) apresLigneVide = false;
    if (l.startsWith("```")) dansCode = !dansCode;
    else if (!dansCode && (l.match(/\$\$/g)?.length ?? 0) % 2 === 1) dansFormule = !dansFormule;
    if (!l && !dansCode && !dansFormule) apresLigneVide = true;
    courant.push(ligne);
  }
  if (courant.length) blocs.push(courant.join("\n"));
  return blocs;
}

/**
 * Prépare le texte pour remark-math : \( \) et \[ \] deviennent $ et $$, et une formule
 * « $$...$$ » seule sur sa ligne est mise sur trois lignes pour être affichée centrée.
 */
function normaliser(texte: string): string {
  return texte
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, f) => `\n$$\n${f.trim()}\n$$\n`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, f) => `$${f}$`)
    .replace(/^[ \t]*\$\$([^\n]+?)\$\$[ \t]*$/gm, (_, f) => `$$\n${f.trim()}\n$$`);
}

const Bloc = memo(function Bloc({ source }: { source: string }) {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
      {source}
    </ReactMarkdown>
  );
});

export default function MathMarkdown({ texte, className = "" }: { texte: string; className?: string }) {
  const blocs = useMemo(() => decouperBlocs(normaliser(texte)), [texte]);
  return (
    <div className={`prose-bac ${className}`}>
      {blocs.map((b, i) => (
        <Bloc key={i} source={b} />
      ))}
    </div>
  );
}

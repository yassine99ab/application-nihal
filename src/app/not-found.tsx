import Link from "next/link";

export default function NotFound() {
  return (
    <div className="copie mx-auto max-w-xl text-center">
      <p className="manuscrit -rotate-3 text-6xl">Hors sujet !</p>
      <h1 className="titre mt-4 text-3xl font-semibold">Cette page n&apos;existe pas.</h1>
      <p className="mt-2 text-encre-douce">Le lien est peut-être incomplet ou le chapitre a changé de nom.</p>
      <Link href="/" className="bouton mt-6">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}

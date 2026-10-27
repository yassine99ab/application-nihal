import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Caveat, Fraunces, JetBrains_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import "katex/dist/katex.min.css";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  axes: ["SOFT", "WONK", "opsz"],
});

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin", "latin-ext"],
  adjustFontFallback: false,
  fallback: ["system-ui", "sans-serif"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "latin-ext"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Prof Bac — ton cahier de révision", template: "%s · Prof Bac" },
  description:
    "Corrections détaillées, cours, QCM, exercices et sujets type bac pour la Première et la Terminale : maths, physique-chimie, SVT, français, philosophie, histoire-géo.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f0e4" },
    { media: "(prefers-color-scheme: dark)", color: "#142019" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${atkinson.variable} ${caveat.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Nav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:pb-16 md:pt-10">
          {children}
        </main>
        <footer className="no-print mx-auto hidden w-full max-w-6xl px-4 pb-8 text-sm text-encre-douce md:block">
          Les réponses sont générées par une IA et peuvent contenir des erreurs : en cas de doute, vérifie avec
          ton professeur.
        </footer>
      </body>
    </html>
  );
}

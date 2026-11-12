import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import MotionProvider from "@/components/motion/MotionProvider";

// Polices intégrées au projet (dossier fonts, licence SIL OFL) : l'apparence ne
// dépend pas d'internet, ni en local (démonstration hors ligne) ni au déploiement.
// Texte : Figtree, sans-serif ronde et très lisible, y compris en petit.
const body = localFont({
  src: [
    { path: "./fonts/Figtree-400-latin.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Figtree-500-latin.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Figtree-600-latin.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Figtree-700-latin.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  preload: false,
});

// Titres : Young Serif, serif douce aux formes arrondies, chaleureuse pour un
// salon. Une seule graisse existe : les titres ne sont jamais « faux gras ».
const display = localFont({
  src: "./fonts/YoungSerif-Regular-latin.woff2",
  variable: "--font-display",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nadcel — Salons de beauté à Dakar",
  description: "Réservez votre salon de beauté à Dakar, sans attendre ni appeler.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${body.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}

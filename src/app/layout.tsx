import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import MotionProvider from "@/components/motion/MotionProvider";

// Polices intégrées au projet (dossier fonts, licence SIL OFL) : l'apparence ne
// dépend pas d'internet, ni en local (démonstration hors ligne) ni au déploiement.
const geistSans = localFont({
  src: "./fonts/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  preload: false,
});

// Titres : Playfair Display, serif à fort contraste des magazines de beauté.
const display = localFont({
  src: "./fonts/PlayfairDisplay-Variable-latin.woff2",
  variable: "--font-display",
  weight: "400 900",
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
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}

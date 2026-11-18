"use client";

import Image from "next/image";
import Link from "next/link";
import AccountMenu from "@/components/AccountMenu";
import { useReloadOnAccountChange } from "@/hooks/useReloadOnAccountChange";

// Cadre de l'espace client : volontairement simple, sans barre latérale ni
// tableau de bord (réservés au gérant et à l'administrateur), sans la barre
// de navigation ni le pied de page du site. En haut : le logo (retour au site),
// « Réserver un salon » et l'avatar (Mes rendez-vous, Mon profil, déconnexion).
export default function ClientShell({ children }: { children: React.ReactNode }) {
  useReloadOnAccountChange();

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-beige">
      <header className="sticky top-0 z-30 border-b border-sable/20 bg-beige/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-4xl items-center justify-between gap-4 px-5 sm:px-10">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Nadcel, retour au site">
            <Image src="/images/logo-icon.png" alt="" width={55} height={40} className="h-9 w-auto" />
            <span className="font-heading text-xl font-semibold tracking-tight text-brand">Nadcel</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/salons"
              className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-anthracite/85 transition-colors hover:bg-sable/10 hover:text-brand sm:px-4"
            >
              Réserver un salon
            </Link>
            <AccountMenu
              roleLabel="Cliente"
              dashboardHref="/client/appointments"
              dashboardLabel="Mes rendez-vous"
              profileHref="/client/profil"
              siteLink={false}
              afterLogoutHref="/"
            />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCurrentUser } from "@/hooks/useAuthState";
import { useManagerSalons } from "@/hooks/useManagerSalons";
import { assetUrl } from "@/lib/api";
import { ui } from "@/lib/ui";
import DashboardBanner from "@/components/DashboardBanner";
import type { Salon } from "@/hooks/useSalons";

function summary(upcoming: number | null, toClose: number | null): string {
  const intro = "Gérez vos salons et suivez votre activité.";
  if (upcoming === null || toClose === null) return intro;
  const coming = upcoming === 0 ? "Aucun rendez-vous à venir" : `${upcoming} rendez-vous à venir`;
  if (toClose === 0) return `${intro} ${coming}, tout est à jour.`;
  return `${intro} ${coming}, ${toClose} à clôturer.`;
}

// En-tête du tableau de bord gérant : la photo du salon, un mot d'accueil et le résumé.
// salon : celui choisi dans le sélecteur du tableau de bord (null = tous).
export default function WelcomeBanner({
  upcoming,
  toClose,
  salon: chosen = null,
}: {
  upcoming: number | null;
  toClose: number | null;
  salon?: Salon | null;
}) {
  const user = useCurrentUser();
  const { salons } = useManagerSalons();
  const salon = chosen ?? salons.find((s) => s.is_verified && s.is_active) ?? salons[0];
  const cover = assetUrl(salon?.cover ?? null);
  const firstName = user?.name?.trim().split(/\s+/)[0];
  const eyebrow = chosen ? chosen.name : salons.length > 1 ? `Vos ${salons.length} salons` : salon?.name;

  return (
    <DashboardBanner
      eyebrow={eyebrow}
      title={firstName ? `Bonjour ${firstName},` : "Tableau de bord"}
      summary={summary(upcoming, toClose)}
      image={cover}
      actions={
        <>
          <Link href="/manager/appointments" className={ui.buttonOnDark}>
            Voir les rendez-vous
          </Link>
          <Link href="/manager/salons" className={ui.buttonGhostOnDark}>
            Mes salons
          </Link>
        </>
      }
    />
  );
}

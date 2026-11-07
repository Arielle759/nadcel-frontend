"use client";

import Link from "next/link";
import { useCurrentUser } from "@/hooks/useAuthState";
import { useManagerSalons } from "@/hooks/useManagerSalons";
import { assetUrl } from "@/lib/api";
import { ui } from "@/lib/ui";
import DashboardBanner from "@/components/DashboardBanner";

function summary(upcoming: number | null, toClose: number | null): string {
  if (upcoming === null || toClose === null) return "L'activité de votre salon et ce qui demande votre attention.";
  const coming = upcoming === 0 ? "Aucun rendez-vous à venir" : `${upcoming} rendez-vous à venir`;
  if (toClose === 0) return `${coming}. Tout est à jour.`;
  return `${coming}, ${toClose} à clôturer.`;
}

// En-tête du tableau de bord gérant : la photo du salon, un mot d'accueil et le résumé.
export default function WelcomeBanner({ upcoming, toClose }: { upcoming: number | null; toClose: number | null }) {
  const user = useCurrentUser();
  const { salons } = useManagerSalons();
  const salon = salons.find((s) => s.is_verified && s.is_active) ?? salons[0];
  const cover = assetUrl(salon?.cover ?? null);
  const firstName = user?.name?.trim().split(/\s+/)[0];
  const eyebrow = salons.length > 1 ? `Vos ${salons.length} salons` : salon?.name;

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

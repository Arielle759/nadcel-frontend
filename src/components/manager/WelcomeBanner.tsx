"use client";

import Link from "next/link";
import { useCurrentUser } from "@/hooks/useAuthState";
import { useManagerSalons } from "@/hooks/useManagerSalons";
import { assetUrl } from "@/lib/api";
import { ui } from "@/lib/ui";

function summary(upcoming: number | null, toClose: number | null): string {
  if (upcoming === null || toClose === null) return "L'activité de votre salon et ce qui demande votre attention.";
  const coming = upcoming === 0 ? "Aucun rendez-vous à venir" : `${upcoming} rendez-vous à venir`;
  if (toClose === 0) return `${coming}. Tout est à jour.`;
  return `${coming}, ${toClose} à clôturer.`;
}

// En-tête du tableau de bord gérant : la photo du salon sous un voile chocolat,
// un mot d'accueil et le résumé du jour. Sans photo, le bandeau reste chocolat uni.
export default function WelcomeBanner({ upcoming, toClose }: { upcoming: number | null; toClose: number | null }) {
  const user = useCurrentUser();
  const { salons } = useManagerSalons();
  const salon = salons.find((s) => s.is_verified && s.is_active) ?? salons[0];
  const cover = assetUrl(salon?.cover ?? null);
  const firstName = user?.name?.trim().split(/\s+/)[0];
  const eyebrow = salons.length > 1 ? `Vos ${salons.length} salons` : salon?.name;

  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-brand shadow-[0_6px_16px_rgba(59,42,36,0.18),0_24px_56px_rgba(74,51,40,0.22)]">
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="hero-slide-zoom absolute inset-0 -z-10 h-full w-full object-cover" />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-brand/95 via-brand/85 to-brand/60 lg:via-brand/80 lg:to-brand/20"
      />
      <div className="flex min-h-52 flex-wrap items-end justify-between gap-6 px-6 py-8 sm:px-10 sm:py-9">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-beige/65">{eyebrow}</p>
          )}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-beige sm:text-4xl">
            {firstName ? `Bonjour ${firstName},` : "Tableau de bord"}
          </h1>
          <p className="mt-2 max-w-xl text-beige/80">{summary(upcoming, toClose)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/manager/appointments" className={ui.buttonOnDark}>
            Voir les rendez-vous
          </Link>
          <Link href="/manager/salons" className={ui.buttonGhostOnDark}>
            Mes salons
          </Link>
        </div>
      </div>
    </section>
  );
}

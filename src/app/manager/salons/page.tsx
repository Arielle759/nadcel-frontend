"use client";

import Link from "next/link";
import { useManagerSalons } from "@/hooks/useManagerSalons";
import ManagerPage from "@/components/manager/ManagerPage";
import { assetUrl } from "@/lib/api";
import { salonArea } from "@/lib/salonArea";
import { ui } from "@/lib/ui";
import type { Salon } from "@/hooks/useSalons";

function statusOf(salon: Salon): { label: string; className: string } {
  if (salon.is_verified && salon.is_active && salon.deactivated_at) return { label: "Désactivé", className: "bg-anthracite/10 text-anthracite/80" };
  if (salon.is_verified && salon.is_active) return { label: "En ligne", className: "bg-emerald-100 text-emerald-900" };
  if (salon.is_verified) return { label: "Suspendu", className: "bg-red-100 text-red-900" };
  if (salon.is_active) return { label: "En attente de validation", className: "bg-amber-100 text-amber-900" };
  return { label: "Non retenu", className: "bg-red-100 text-red-900" };
}

export default function ManagerSalonsPage() {
  const { salons, loading, error } = useManagerSalons();

  return (
    <ManagerPage
      title="Mes salons"
      description="La fiche, les services et les employés de chaque salon."
      actions={
        <Link href="/devenir-partenaire" className={ui.buttonSecondary}>
          Ajouter un salon
        </Link>
      }
    >
      {loading && <div className="h-40 animate-pulse rounded-2xl bg-sable/15" />}
      {error && <p className="text-sm text-red-700">{error}</p>}

      {!loading && !error && salons.length === 0 && (
        <div className={`${ui.surface} px-6 py-12 text-center`}>
          <p className="font-heading text-2xl font-semibold text-brand">Aucun salon pour le moment</p>
          <p className="mt-2 text-sm text-anthracite/75">Envoyez une demande de partenariat pour inscrire votre salon.</p>
        </div>
      )}

      <ul className="flex flex-col gap-4">
        {salons.map((salon) => {
          const cover = assetUrl(salon.cover ?? salon.logo);
          const status = statusOf(salon);
          return (
            <li key={salon.id} className={`${ui.surface} flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:p-5`}>
              <div className="h-40 w-full shrink-0 overflow-hidden rounded-xl bg-sable/20 sm:h-24 sm:w-36">
                {cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-brand">{salon.name}</h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                </div>
                <p className="mt-1 text-sm text-anthracite/75">{salonArea(salon.address, salon.city)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/manager/salons/${salon.id}`} className={ui.buttonPrimary}>
                  Consulter
                </Link>
                {salon.is_verified && salon.is_active && !salon.deactivated_at && (
                  <Link href={`/salons/${salon.id}`} className={ui.buttonSecondary}>
                    Page publique
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </ManagerPage>
  );
}

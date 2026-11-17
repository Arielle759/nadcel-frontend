"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useCurrentUser } from "@/hooks/useAuthState";
import { useManagerSalons } from "@/hooks/useManagerSalons";
import HubPage, { HUB_CARD } from "@/components/manager/HubPage";

// Réglages regroupés : le compte du gérant, puis chaque salon (fiche et
// horaires, services, équipe). Chaque lien mène à la page qui existe déjà.
export default function ManagerSettingsPage() {
  const user = useCurrentUser();
  const { salons, loading } = useManagerSalons();
  const own = salons.filter((s) => s.is_verified);

  const row = "flex min-h-12 items-center justify-between gap-3 px-5 text-sm font-medium text-anthracite transition-colors hover:bg-[#f1ece6]";

  return (
    <HubPage title="Paramètres" subtitle="Votre compte et les réglages de chaque salon.">
      <section aria-labelledby="account-title" className={`${HUB_CARD} overflow-hidden`}>
        <div className="p-5 sm:p-6">
          <h2 id="account-title" className="font-sans text-base font-semibold text-anthracite">
            Mon compte
          </h2>
          <p className="mt-0.5 text-sm text-anthracite/60">
            {user?.name} · {user?.email}
          </p>
        </div>
        <Link href="/manager/profil" className={`${row} border-t border-[#ebe4dd]`}>
          Nom, téléphone et mot de passe
          <ChevronRight size={18} aria-hidden="true" className="text-anthracite/50" />
        </Link>
      </section>

      {loading ? (
        <div className="h-40 animate-pulse rounded-xl bg-sable/15" />
      ) : (
        own.map((salon) => (
          <section key={salon.id} aria-labelledby={`salon-${salon.id}`} className={`${HUB_CARD} overflow-hidden`}>
            <div className="flex flex-wrap items-start justify-between gap-2 p-5 sm:p-6">
              <div>
                <h2 id={`salon-${salon.id}`} className="font-sans text-base font-semibold text-anthracite">
                  {salon.name}
                </h2>
                <p className="mt-0.5 text-sm text-anthracite/60">{salon.city}</p>
              </div>
              <span
                className={`rounded-md px-2.5 py-0.5 text-xs font-medium ${
                  salon.is_active ? "bg-accent text-white" : "border border-[#d9cfc5] bg-white text-anthracite/70"
                }`}
              >
                {salon.is_active ? "en ligne" : "retiré du site"}
              </span>
            </div>
            {[
              { href: `/manager/salons/${salon.id}`, label: "Fiche du salon, photo, horaires et publication" },
              { href: `/manager/salons/${salon.id}/services`, label: "Services et tarifs" },
              { href: `/manager/salons/${salon.id}/employees`, label: "Équipe et prestations de chacun" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className={`${row} border-t border-[#ebe4dd]`}>
                {link.label}
                <ChevronRight size={18} aria-hidden="true" className="text-anthracite/50" />
              </Link>
            ))}
          </section>
        ))
      )}
    </HubPage>
  );
}

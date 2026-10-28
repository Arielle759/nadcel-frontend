"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarX, Clock, Mail, ShieldCheck } from "lucide-react";
import { useSalons } from "@/hooks/useSalons";
import { useSalonFilters } from "@/hooks/useSalonFilters";
import SalonFilterBar from "@/components/SalonFilterBar";
import SalonGrid from "@/components/SalonGrid";

const REASSURANCE_ITEMS = [
  { icon: ShieldCheck, label: "Réservation sécurisée" },
  { icon: CalendarX, label: "Annulation facile" },
  { icon: Clock, label: "Créneaux vérifiés en temps réel" },
  { icon: Mail, label: "Confirmation par email" },
];

function PopularSalonsContent() {
  const searchParams = useSearchParams();
  const filters = useSalonFilters(searchParams.get("q") ?? "");

  const hasActiveFilter = Boolean(filters.searchParams.q);

  const { salons, loading, error } = useSalons({
    ...filters.searchParams,
    per_page: hasActiveFilter ? 24 : 4,
  });

  return (
    <section className="border-t border-sage/20 px-6 pt-8 pb-20 sm:px-16">
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-forest">Salons populaires</h2>
        <p className="text-anthracite/75">Découvrez les salons les mieux notés près de chez vous.</p>
        <SalonFilterBar filters={filters} />
      </div>

      <SalonGrid
        salons={salons}
        loading={loading}
        error={error}
        emptyMessage={hasActiveFilter ? "Aucun salon ne correspond à votre recherche." : "Aucun salon disponible pour le moment."}
      />

      <div className="mt-14 grid grid-cols-2 gap-6 border-t border-sage/20 pt-10 md:grid-cols-4">
        {REASSURANCE_ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <Icon size={20} className="text-link-sage" />
            <span className="text-sm text-anthracite/75">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PopularSalons() {
  return (
    <Suspense fallback={null}>
      <PopularSalonsContent />
    </Suspense>
  );
}

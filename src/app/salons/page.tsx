"use client";

import { useSalons } from "@/hooks/useSalons";
import { useSalonFilters } from "@/hooks/useSalonFilters";
import SalonFilterBar from "@/components/SalonFilterBar";
import SalonGrid from "@/components/SalonGrid";

export default function SalonsPage() {
  const filters = useSalonFilters();
  const { salons, loading, error } = useSalons({ ...filters.searchParams, per_page: 50 });

  return (
    <main className="flex flex-1 flex-col gap-8 bg-gradient-to-br from-beige to-sage/20 px-6 py-12 sm:px-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-forest">Tous les salons</h1>
        <p className="text-anthracite/75">
          Parcourez l&apos;ensemble des salons et choisissez celui qui vous convient.
        </p>
      </div>

      <SalonFilterBar filters={filters} />

      <SalonGrid
        salons={salons}
        loading={loading}
        error={error}
        emptyMessage="Aucun salon ne correspond à votre recherche."
      />
    </main>
  );
}

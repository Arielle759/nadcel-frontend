"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSalons } from "@/hooks/useSalons";
import { useSalonFilters } from "@/hooks/useSalonFilters";
import SalonFilterBar from "@/components/SalonFilterBar";
import SalonGrid from "@/components/SalonGrid";

function SalonsContent() {
  const initialQuery = useSearchParams().get("q") ?? "";
  const filters = useSalonFilters(initialQuery);
  const { salons, total, loading, error } = useSalons({ ...filters.searchParams, per_page: 50 });
  const activeQuery = filters.searchParams.q;

  let summary = "";
  if (!loading && total !== null) {
    const noun = total > 1 ? "salons" : "salon";
    summary = activeQuery ? `${total} ${noun} pour « ${activeQuery} »` : `${total} ${noun} vérifiés`;
  }

  return (
    <main className="flex flex-1 flex-col px-6 py-12 sm:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-forest sm:text-4xl">Trouver un salon</h1>
          <p className="text-anthracite/75">Cherchez par prestation, nom de salon, quartier ou ville.</p>
        </div>

        <div className="flex flex-col gap-3">
          <SalonFilterBar filters={filters} />
          <p className="min-h-5 text-sm text-anthracite/75" aria-live="polite">
            {summary}
          </p>
        </div>

        <SalonGrid
          salons={salons}
          loading={loading}
          error={error}
          emptyMessage="Aucun salon ne correspond à votre recherche. Essayez un quartier ou une prestation plus large."
        />
      </div>
    </main>
  );
}

export default function SalonsPage() {
  return (
    <Suspense fallback={null}>
      <SalonsContent />
    </Suspense>
  );
}

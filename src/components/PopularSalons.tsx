"use client";

import Link from "next/link";
import { useSalons } from "@/hooks/useSalons";
import SalonGrid from "@/components/SalonGrid";
import { ui } from "@/lib/ui";

export default function PopularSalons() {
  const { salons, total, loading, error } = useSalons({ per_page: 6 });

  return (
    <section aria-labelledby="salons-title" className="border-y border-sage/20 bg-white/40 px-6 py-20 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="salons-title" className={ui.sectionTitle}>
              Salons à découvrir
            </h2>
            <p className="mt-3 text-anthracite/75">Chaque salon est vérifié par notre équipe avant d&apos;apparaître ici.</p>
          </div>
          {total !== null && total > salons.length && (
            <Link href="/salons" className={ui.buttonSecondary}>
              Voir les {total} salons
            </Link>
          )}
        </div>

        <SalonGrid salons={salons} loading={loading} error={error} emptyMessage="Aucun salon disponible pour le moment." />
      </div>
    </section>
  );
}

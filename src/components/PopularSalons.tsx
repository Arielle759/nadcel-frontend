"use client";

import Link from "next/link";
import { useSalons } from "@/hooks/useSalons";
import SalonGrid from "@/components/SalonGrid";
import SectionHeading from "@/components/SectionHeading";
import { ui } from "@/lib/ui";

export default function PopularSalons() {
  const { salons, total, loading, error } = useSalons({ per_page: 6 });

  return (
    <section aria-labelledby="salons-title" className="px-6 pt-28 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            id="salons-title"
            title="Salons à découvrir"
            description="Chaque salon est vérifié par notre équipe avant d'apparaître ici."
          />
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

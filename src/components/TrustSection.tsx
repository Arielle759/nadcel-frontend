"use client";

import { useSalons } from "@/hooks/useSalons";

function formatRating(value: number): string {
  return value.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// Chiffres réels uniquement : rien n'est affiché tant que les données ne sont
// pas chargées, et aucune valeur par défaut ne remplace une donnée absente.
export default function TrustSection() {
  const { salons, total, loading } = useSalons({ per_page: 50 });

  const reviewCount = salons.reduce((sum, salon) => sum + (salon.reviews_count || 0), 0);
  const weightedSum = salons.reduce(
    (sum, salon) => sum + Number(salon.reviews_avg_rating ?? 0) * (salon.reviews_count || 0),
    0
  );
  const averageRating = reviewCount > 0 ? weightedSum / reviewCount : null;

  const items = [
    {
      value: loading || total === null ? "…" : String(total),
      label: total === 1 ? "salon vérifié par notre équipe" : "salons vérifiés par notre équipe",
    },
    averageRating !== null
      ? { value: `${formatRating(averageRating)} / 5`, label: `note moyenne sur ${reviewCount} avis` }
      : { value: "Avis", label: "laissés uniquement après un rendez-vous terminé" },
    { value: "0 F", label: "de frais de réservation, vous payez au salon" },
    { value: "24 h", label: "avant le rendez-vous, un rappel par e-mail" },
  ];

  return (
    <section
      aria-label="Nadcel en chiffres"
      className="relative z-10 mx-4 -mt-10 rounded-3xl bg-white px-6 py-8 shadow-[0_2px_6px_rgba(45,59,40,0.06),0_24px_56px_rgba(45,59,40,0.14)] sm:mx-8 sm:px-10 lg:mx-auto lg:w-full lg:max-w-6xl"
    >
      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:divide-x md:divide-sage/20">
        {items.map(({ value, label }) => (
          <div key={label} className="flex flex-col gap-1 px-2 md:px-6">
            <dt className="order-2 text-sm leading-5 text-anthracite/75">{label}</dt>
            <dd className="order-1 font-heading text-3xl font-semibold text-forest">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

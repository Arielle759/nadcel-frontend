"use client";

import Link from "next/link";
import { useSalons } from "@/hooks/useSalons";

export default function SalonGrid() {
  const { salons, loading, error } = useSalons();

  if (loading) {
    return <p className="text-anthracite/70">Chargement des salons...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (salons.length === 0) {
    return <p className="text-anthracite/70">Aucun salon disponible.</p>;
  }

  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {salons.map((salon) => (
        <div
          key={salon.id}
          className="flex flex-col gap-3 rounded-lg border border-sage/30 bg-beige p-6"
        >
          <h2 className="text-lg font-semibold text-anthracite">{salon.nom}</h2>
          <p className="flex-1 text-sm text-anthracite/70">
            {salon.description}
          </p>
          <Link
            href={`/salons/${salon.id}`}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-dark-sage px-4 py-2 text-sm font-medium text-beige transition-colors hover:bg-sage"
          >
            Voir détails
          </Link>
        </div>
      ))}
    </div>
  );
}

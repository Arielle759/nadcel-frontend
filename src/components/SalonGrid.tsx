"use client";

import Link from "next/link";
import { useSalons } from "@/hooks/useSalons";

export default function SalonGrid() {
  const { salons, loading, error } = useSalons();

  if (loading) {
    return <p className="text-zinc-600 dark:text-zinc-400">Chargement des salons...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (salons.length === 0) {
    return <p className="text-zinc-600 dark:text-zinc-400">Aucun salon disponible.</p>;
  }

  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {salons.map((salon) => (
        <div
          key={salon.id}
          className="flex flex-col gap-3 rounded-lg border border-black/[.08] p-6 dark:border-white/[.145]"
        >
          <h2 className="text-lg font-semibold">{salon.nom}</h2>
          <p className="flex-1 text-sm text-zinc-600 dark:text-zinc-400">
            {salon.description}
          </p>
          <Link
            href={`/salons/${salon.id}`}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Voir détails
          </Link>
        </div>
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useSalons } from "@/hooks/useSalons";
import { useManager } from "@/hooks/useManager";

export default function ManagerSalonsPage() {
  const { salons, loading, error, refetch } = useSalons();
  const { deleteSalon } = useManager();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    if (!window.confirm("Supprimer ce salon ?")) return;
    setDeletingId(id);
    try {
      await deleteSalon(id);
      refetch();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-12 sm:px-16">
      <h1 className="text-3xl font-semibold tracking-tight">Mes salons</h1>

      {loading && <p className="text-anthracite/70">Chargement des salons...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && salons.length === 0 && (
        <p className="text-anthracite/70">Vous n&apos;avez pas encore de salon.</p>
      )}

      <ul className="flex flex-col gap-4">
        {salons.map((salon) => (
          <li
            key={salon.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-sage/30 bg-beige p-4"
          >
            <div>
              <p className="font-semibold text-anthracite">{salon.nom}</p>
              <p className="text-sm text-anthracite/70">{salon.description}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/manager/salons/${salon.id}`}
                className="rounded-full border border-dark-sage px-4 py-2 text-sm font-medium text-dark-sage transition-colors hover:bg-sage/10"
              >
                Modifier
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(salon.id)}
                disabled={deletingId === salon.id}
                className="rounded-full border border-red-600 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
              >
                {deletingId === salon.id ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

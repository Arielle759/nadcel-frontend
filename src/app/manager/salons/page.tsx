"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2 } from "lucide-react";
import { useManagerSalons } from "@/hooks/useManagerSalons";
import { useManager } from "@/hooks/useManager";
import EmptyState from "@/components/EmptyState";

export default function ManagerSalonsPage() {
  const { salons, loading, error, refetch } = useManagerSalons();
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
    <main className="flex flex-1 flex-col gap-8 bg-gradient-to-br from-beige to-sage/20 px-6 py-12 sm:px-16">
      <h1 className="text-3xl font-semibold tracking-tight text-forest">Mes salons</h1>

      {loading && <p className="text-anthracite/75">Chargement des salons...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && salons.length === 0 && (
        <EmptyState
          message="Vous n'avez pas encore de salon associé à votre compte."
          icon={Building2}
        />
      )}

      <ul className="flex flex-col gap-4 border-t-4 border-t-champagne pt-4">
        {salons.map((salon) => (
          <li
            key={salon.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-sage/30 bg-beige p-4"
          >
            <div>
              <p className="font-semibold text-anthracite">{salon.name}</p>
              <p className="text-sm text-anthracite/75">{salon.description}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/manager/salons/${salon.id}`}
                className="rounded-full border border-dark-sage px-4 py-2 text-sm font-medium text-link-sage transition-colors hover:bg-sage/10"
              >
                Modifier
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(salon.id)}
                disabled={deletingId === salon.id}
                className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-90 disabled:opacity-50"
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

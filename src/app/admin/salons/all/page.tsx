"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { AdminSalon, useAdmin } from "@/hooks/useAdmin";
import SalonStatusBadge from "@/components/SalonStatusBadge";
import EmptyState from "@/components/EmptyState";

export default function AdminAllSalonsPage() {
  const { getAllSalons, suspendSalon, reactivateSalon, deleteSalon } = useAdmin();
  const [salons, setSalons] = useState<AdminSalon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchSalons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllSalons();
      setSalons(data);
    } catch {
      setError("Impossible de charger les salons.");
    } finally {
      setLoading(false);
    }
  }, [getAllSalons]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchSalons();
    });
  }, [fetchSalons]);

  async function handleSuspend(id: number) {
    setUpdatingId(id);
    try {
      const updated = await suspendSalon(id);
      setSalons((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleReactivate(id: number) {
    setUpdatingId(id);
    try {
      const updated = await reactivateSalon(id);
      setSalons((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Supprimer définitivement ce salon ?")) return;
    setUpdatingId(id);
    try {
      await deleteSalon(id);
      setSalons((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-8 bg-gradient-to-br from-beige to-sage/20 px-6 py-12 sm:px-16">
      <Link href="/admin/dashboard" className="self-start text-sm text-link-sage hover:underline">
        ← Retour au tableau de bord
      </Link>

      <h1 className="text-3xl font-semibold tracking-tight text-forest">Tous les salons</h1>

      {loading && <p className="text-anthracite/75">Chargement des salons...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && salons.length === 0 && (
        <EmptyState message="Aucun salon à afficher." icon={Building2} />
      )}

      <ul className="flex flex-col gap-4 border-t-4 border-t-champagne pt-4">
        {salons.map((salon) => {
          const isBusy = updatingId === salon.id;
          return (
            <li
              key={salon.id}
              className="flex flex-col gap-3 rounded-lg border border-sage/30 bg-beige p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-anthracite">{salon.name}</p>
                  <SalonStatusBadge isVerified={salon.is_verified} isActive={salon.is_active} />
                </div>
                <p className="text-sm text-anthracite/75">{salon.city}</p>
                <p className="text-sm text-anthracite/75">Gérant : {salon.manager?.name ?? "—"}</p>
              </div>
              <div className="flex gap-2">
                {salon.is_verified && salon.is_active && (
                  <button
                    type="button"
                    onClick={() => handleSuspend(salon.id)}
                    disabled={isBusy}
                    className="rounded-full border border-terracotta px-4 py-2 text-sm font-medium text-terracotta transition-colors hover:bg-terracotta hover:text-white disabled:opacity-50"
                  >
                    {isBusy ? "..." : "Suspendre"}
                  </button>
                )}
                {salon.is_verified && !salon.is_active && (
                  <button
                    type="button"
                    onClick={() => handleReactivate(salon.id)}
                    disabled={isBusy}
                    className="rounded-full bg-dark-sage px-4 py-2 text-sm font-medium text-beige transition-colors hover:bg-sage disabled:opacity-50"
                  >
                    {isBusy ? "..." : "Réactiver"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(salon.id)}
                  disabled={isBusy}
                  className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-90 disabled:opacity-50"
                >
                  {isBusy ? "..." : "Supprimer"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

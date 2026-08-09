"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { AdminSalon, useAdmin } from "@/hooks/useAdmin";
import EmptyState from "@/components/EmptyState";

export default function AdminSalonsPage() {
  const { getPendingSalons, validateSalon, rejectSalon } = useAdmin();
  const [salons, setSalons] = useState<AdminSalon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchSalons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingSalons();
      setSalons(data.filter((s) => s.is_verified === false && s.is_active === true));
    } catch {
      setError("Impossible de charger les salons en attente.");
    } finally {
      setLoading(false);
    }
  }, [getPendingSalons]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchSalons();
    });
  }, [fetchSalons]);

  async function handleValidate(id: number) {
    setUpdatingId(id);
    try {
      await validateSalon(id);
      setSalons((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleReject(id: number) {
    if (!window.confirm("Rejeter ce salon ?")) return;
    setUpdatingId(id);
    try {
      await rejectSalon(id);
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

      <h1 className="text-3xl font-semibold tracking-tight text-forest">Salons en attente</h1>

      {loading && <p className="text-anthracite/75">Chargement des salons...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && salons.length === 0 && (
        <EmptyState message="Aucun salon en attente de validation." icon={Building2} />
      )}

      <ul className="flex flex-col gap-4 border-t-4 border-t-champagne pt-4">
        {salons.map((salon) => (
          <li
            key={salon.id}
            className="flex flex-col gap-3 rounded-lg border border-sage/30 bg-beige p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-anthracite">{salon.name}</p>
              <p className="text-sm text-anthracite/75">{salon.description}</p>
              <p className="text-sm text-anthracite/75">
                {salon.address}, {salon.city}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleValidate(salon.id)}
                disabled={updatingId === salon.id}
                className="rounded-full bg-dark-sage px-4 py-2 text-sm font-medium text-beige transition-colors hover:bg-sage disabled:opacity-50"
              >
                {updatingId === salon.id ? "..." : "Valider"}
              </button>
              <button
                type="button"
                onClick={() => handleReject(salon.id)}
                disabled={updatingId === salon.id}
                className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-90 disabled:opacity-50"
              >
                {updatingId === salon.id ? "..." : "Rejeter"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

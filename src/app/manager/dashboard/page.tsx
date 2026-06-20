"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useManager, SalonStats } from "@/hooks/useManager";

export default function ManagerDashboardPage() {
  const { getSalonStats } = useManager();
  const [stats, setStats] = useState<SalonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getSalonStats()
      .then((data) => {
        if (isMounted) setStats(data);
      })
      .catch(() => {
        if (isMounted) setError("Impossible de charger les statistiques.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [getSalonStats]);

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-12 sm:px-16">
      <h1 className="text-3xl font-semibold tracking-tight">Tableau de bord</h1>

      {loading && <p className="text-anthracite/70">Chargement...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {stats && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-sage/30 bg-beige p-6">
            <p className="text-sm text-anthracite/60">Salons</p>
            <p className="text-3xl font-semibold">{stats.nombreSalons}</p>
          </div>
          <div className="rounded-lg border border-sage/30 bg-beige p-6">
            <p className="text-sm text-anthracite/60">RDV aujourd&apos;hui</p>
            <p className="text-3xl font-semibold">{stats.rdvAujourdhui}</p>
          </div>
          <div className="rounded-lg border border-sage/30 bg-beige p-6">
            <p className="text-sm text-anthracite/60">Avis</p>
            <p className="text-3xl font-semibold">{stats.avis}</p>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Link
          href="/manager/salons"
          className="rounded-full bg-dark-sage px-5 py-2 text-sm font-medium text-beige transition-colors hover:bg-sage"
        >
          Gérer mes salons
        </Link>
        <Link
          href="/manager/appointments"
          className="rounded-full border border-dark-sage px-5 py-2 text-sm font-medium text-dark-sage transition-colors hover:bg-sage/10"
        >
          Gérer les rendez-vous
        </Link>
      </div>
    </main>
  );
}

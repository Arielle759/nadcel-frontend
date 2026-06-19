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

      {loading && <p className="text-zinc-600 dark:text-zinc-400">Chargement...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {stats && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-black/[.08] p-6 dark:border-white/[.145]">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Salons</p>
            <p className="text-3xl font-semibold">{stats.nombreSalons}</p>
          </div>
          <div className="rounded-lg border border-black/[.08] p-6 dark:border-white/[.145]">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">RDV aujourd&apos;hui</p>
            <p className="text-3xl font-semibold">{stats.rdvAujourdhui}</p>
          </div>
          <div className="rounded-lg border border-black/[.08] p-6 dark:border-white/[.145]">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Avis</p>
            <p className="text-3xl font-semibold">{stats.avis}</p>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Link
          href="/manager/salons"
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Gérer mes salons
        </Link>
        <Link
          href="/manager/appointments"
          className="rounded-full border border-black/[.08] px-5 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
        >
          Gérer les rendez-vous
        </Link>
      </div>
    </main>
  );
}

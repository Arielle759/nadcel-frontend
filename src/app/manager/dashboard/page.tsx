"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, Calendar } from "lucide-react";
import { useManager, ManagerStats } from "@/hooks/useManager";
import ActivitySection from "@/components/manager/ActivitySection";

export default function ManagerDashboardPage() {
  const { getSalonStats } = useManager();
  const [stats, setStats] = useState<ManagerStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getSalonStats()
      .then((data) => {
        if (isMounted) setStats(data);
      })
      .catch(() => {
        if (isMounted) setError("Impossible de charger les rendez-vous en cours.");
      });

    return () => {
      isMounted = false;
    };
  }, [getSalonStats]);

  return (
    <main className="flex flex-1 flex-col gap-6 bg-gradient-to-br from-beige via-beige to-sage/20 px-5 py-6 sm:px-8 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-forest sm:text-3xl">Tableau de bord</h1>
          <p className="mt-1 text-sm text-anthracite/70">L&apos;activité de votre salon et ce qui demande votre attention.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/manager/appointments"
            className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-medium text-beige transition-colors hover:bg-dark-sage"
          >
            <Calendar size={16} aria-hidden="true" />
            Gérer les rendez-vous
          </Link>
          <Link
            href="/manager/salons"
            className="inline-flex items-center gap-2 rounded-full border border-dark-sage/40 px-4 py-2 text-sm font-medium text-link-sage transition-colors hover:bg-sage/10"
          >
            <Building2 size={16} aria-hidden="true" />
            Mes salons
          </Link>
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <ActivitySection upcoming={stats?.upcoming ?? null} toClose={stats?.to_close ?? null} />
    </main>
  );
}

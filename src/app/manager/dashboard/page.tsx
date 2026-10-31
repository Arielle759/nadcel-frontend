"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useManager, ManagerStats } from "@/hooks/useManager";
import ActivitySection from "@/components/manager/ActivitySection";
import RemindersCard from "@/components/manager/RemindersCard";
import ManagerPage from "@/components/manager/ManagerPage";
import { ui } from "@/lib/ui";

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
    <ManagerPage
      title="Tableau de bord"
      description="L'activité de votre salon et ce qui demande votre attention."
      actions={
        <>
          <Link href="/manager/appointments" className={ui.buttonPrimary}>
            Voir les rendez-vous
          </Link>
          <Link href="/manager/salons" className={ui.buttonSecondary}>
            Mes salons
          </Link>
        </>
      }
    >
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-700">
          {error}
        </p>
      )}
      <RemindersCard />
      <ActivitySection upcoming={stats?.upcoming ?? null} toClose={stats?.to_close ?? null} />
    </ManagerPage>
  );
}

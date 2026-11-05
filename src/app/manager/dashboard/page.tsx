"use client";

import { useEffect, useState } from "react";
import { useManager, ManagerStats } from "@/hooks/useManager";
import ActivitySection from "@/components/manager/ActivitySection";
import RemindersCard from "@/components/manager/RemindersCard";
import ManagerPage from "@/components/manager/ManagerPage";
import WelcomeBanner from "@/components/manager/WelcomeBanner";

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
      hero={<WelcomeBanner upcoming={stats?.upcoming ?? null} toClose={stats?.to_close ?? null} />}
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

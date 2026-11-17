"use client";

import { useEffect, useState } from "react";
import { useManager, ManagerStats } from "@/hooks/useManager";
import { useManagerSalons } from "@/hooks/useManagerSalons";
import type { ActivityPeriod } from "@/hooks/useManagerActivity";
import ActivitySection, { PERIODS } from "@/components/manager/ActivitySection";
import RemindersCard from "@/components/manager/RemindersCard";
import ManagerPage from "@/components/manager/ManagerPage";
import WelcomeBanner from "@/components/manager/WelcomeBanner";

// Le salon choisi est gardé dans ce navigateur (confort seulement : sans
// stockage, le tableau de bord revient simplement à « Tous mes salons »).
const SALON_KEY = "nadcel_dashboard_salon";

function readSavedSalon(): number | null {
  try {
    const raw = typeof window === "undefined" ? null : window.localStorage.getItem(SALON_KEY);
    const id = raw ? Number(raw) : NaN;
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

function saveSalon(id: number | null) {
  try {
    if (id) window.localStorage.setItem(SALON_KEY, String(id));
    else window.localStorage.removeItem(SALON_KEY);
  } catch {
    // stockage indisponible : le choix vaut pour cette visite seulement
  }
}

export default function ManagerDashboardPage() {
  const { getSalonStats } = useManager();
  const { salons, loading: salonsLoading } = useManagerSalons();
  const [chosen, setChosen] = useState<number | null>(readSavedSalon);
  const [period, setPeriod] = useState<ActivityPeriod>("month");
  const [stats, setStats] = useState<{ key: string; data: ManagerStats } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ownSalons = salons.filter((salon) => salon.is_verified);
  // Un salon mémorisé qui n'appartient plus au gérant est ignoré.
  const salonId = chosen !== null && (salonsLoading || ownSalons.some((s) => s.id === chosen)) ? chosen : null;
  const statsKey = String(salonId ?? "all");

  useEffect(() => {
    let isMounted = true;
    getSalonStats(salonId)
      .then((data) => {
        if (isMounted) {
          setStats({ key: statsKey, data });
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) setError("Impossible de charger les rendez-vous en cours.");
      });
    return () => {
      isMounted = false;
    };
  }, [getSalonStats, salonId, statsKey]);

  function choose(value: string) {
    const id = value === "all" ? null : Number(value);
    setChosen(id);
    saveSalon(id);
  }

  const current = stats?.key === statsKey ? stats.data : null;
  const selected = ownSalons.find((s) => s.id === salonId) ?? null;

  return (
    <ManagerPage
      title="Tableau de bord"
      description="L'activité de votre salon et ce qui demande votre attention."
      hero={<WelcomeBanner upcoming={current?.upcoming ?? null} toClose={current?.to_close ?? null} salon={selected} />}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {ownSalons.length > 1 ? (
          <label className="flex items-center gap-2 text-sm font-semibold text-anthracite">
            Salon
            <select
              value={salonId ?? "all"}
              onChange={(e) => choose(e.target.value)}
              className="min-h-11 rounded-full border-0 bg-white px-4 pr-9 text-sm font-semibold text-brand shadow-[0_1px_2px_rgba(90,50,35,0.05),0_8px_24px_rgba(90,50,35,0.07)] focus-visible:outline-2 focus-visible:outline-accent"
            >
              <option value="all">Tous mes salons ({ownSalons.length})</option>
              {ownSalons.map((salon) => (
                <option key={salon.id} value={salon.id}>
                  {salon.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span />
        )}
        <div
          role="group"
          aria-label="Période analysée"
          className="flex rounded-full bg-white p-1 shadow-[0_1px_2px_rgba(90,50,35,0.05),0_8px_24px_rgba(90,50,35,0.07)]"
        >
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setPeriod(key)}
              aria-pressed={period === key}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                period === key ? "bg-brand text-beige" : "text-anthracite/70 hover:bg-sable/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-700">
          {error}
        </p>
      )}
      <ActivitySection stats={current} salonId={salonId} period={period} reminders={<RemindersCard />} />
    </ManagerPage>
  );
}

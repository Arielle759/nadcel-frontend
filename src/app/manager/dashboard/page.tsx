"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Plus, Star, UsersRound, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useManager, type ManagerStats, type TodayAppointment } from "@/hooks/useManager";
import { useManagerSalons } from "@/hooks/useManagerSalons";
import { useManagerActivity, type ActivityPeriod } from "@/hooks/useManagerActivity";
import { useCurrentUser } from "@/hooks/useAuthState";
import ActivitySection, { CARD, PERIOD_SHORT } from "@/components/manager/ActivitySection";
import RemindersCard from "@/components/manager/RemindersCard";
import CountUp from "@/components/motion/CountUp";
import { formatCurrency } from "@/lib/currency";
import { serviceWithOption } from "@/lib/serviceOptions";
import { ui } from "@/lib/ui";

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

function dayTrend(today: number, yesterday: number): string | null {
  if (yesterday === 0) return null;
  const pct = Math.round(((today - yesterday) / yesterday) * 100);
  return `${pct >= 0 ? "+" : ""}${pct} %`;
}

export default function ManagerDashboardPage() {
  const { getSalonStats } = useManager();
  const { salons, loading: salonsLoading } = useManagerSalons();
  const user = useCurrentUser();
  const [chosen, setChosen] = useState<number | null>(readSavedSalon);
  const [period, setPeriod] = useState<ActivityPeriod>("month");
  const [stats, setStats] = useState<{ key: string; data: ManagerStats } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ownSalons = salons.filter((salon) => salon.is_verified);
  // Un salon mémorisé qui n'appartient plus au gérant est ignoré.
  const salonId = chosen !== null && (salonsLoading || ownSalons.some((s) => s.id === chosen)) ? chosen : null;
  const statsKey = String(salonId ?? "all");
  const activity = useManagerActivity(period, salonId);

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
        if (isMounted) setError("Impossible de charger les rendez-vous du jour.");
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
  const data = activity.data;
  const firstName = user?.name?.trim().split(/\s+/)[0];
  const trend = current?.today ? dayTrend(current.today.count, current.today.yesterday) : null;

  return (
    <main className="flex flex-1 flex-col px-5 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-sans text-3xl font-bold tracking-tight text-anthracite">Votre espace de gestion</h1>
            <p className="mt-1.5 text-anthracite/70">
              {firstName ? `Bonjour ${firstName}, ` : ""}gérez vos salons et suivez votre activité.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {ownSalons.length > 1 && (
              <label className="flex items-center gap-2 text-sm font-medium text-anthracite/80">
                <span className="sr-only">Salon affiché</span>
                <select
                  value={salonId ?? "all"}
                  onChange={(e) => choose(e.target.value)}
                  className="min-h-11 rounded-lg border border-sable/50 bg-white px-3 pr-8 text-sm font-medium text-anthracite focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <option value="all">Tous mes salons ({ownSalons.length})</option>
                  {ownSalons.map((salon) => (
                    <option key={salon.id} value={salon.id}>
                      {salon.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <Link href="/manager/appointments?nouveau=1" className={`${ui.buttonPrimary} gap-2 rounded-lg`}>
              <Plus size={18} aria-hidden="true" />
              Nouveau rendez-vous
            </Link>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi
            label="Rendez-vous du jour"
            icon={CalendarDays}
            value={current?.today ? <CountUp value={current.today.count} /> : null}
            note={
              current?.today ? (
                trend ? (
                  <>
                    <span className="font-semibold text-accent">{trend}</span> par rapport à hier
                  </>
                ) : (
                  `${current.today.yesterday} hier`
                )
              ) : null
            }
          />
          <Kpi
            label="Clients actifs"
            icon={UsersRound}
            value={data ? <CountUp value={data.loyalty.clients} /> : null}
            note={`sur les ${PERIOD_SHORT[period]}`}
          />
          <Kpi
            label="Chiffre d'affaires"
            icon={Wallet}
            value={data ? <CountUp value={data.totals.revenue} format={(n) => formatCurrency(n)} /> : null}
            note={`encaissé, ${PERIOD_SHORT[period]}`}
          />
          <Kpi
            label="Note moyenne"
            icon={Star}
            value={current ? (current.rating?.average ?? "—") : null}
            note={current?.rating ? `${current.rating.count} avis` : null}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <TodaySchedule list={current?.today?.list ?? null} count={current?.today?.count ?? 0} />
          <StaffPerformance employees={data?.employees ?? null} period={period} />
        </div>

        <RemindersCard />

        <ActivitySection
          data={data}
          loading={activity.loading}
          error={activity.error}
          period={period}
          onPeriodChange={setPeriod}
        />
      </div>
    </main>
  );
}

function Kpi({ label, icon: Icon, value, note }: { label: string; icon: LucideIcon; value: React.ReactNode; note: React.ReactNode }) {
  return (
    <div className={`${CARD} flex flex-col`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-anthracite">{label}</p>
        <Icon size={18} aria-hidden="true" className="shrink-0 text-accent" />
      </div>
      <p className="mt-5 text-2xl font-bold tabular-nums tracking-tight text-anthracite">
        {value ?? <span className="inline-block h-7 w-16 animate-pulse rounded bg-sable/20" />}
      </p>
      <p className="mt-1 min-h-4 text-xs text-anthracite/70">{note}</p>
    </div>
  );
}

const STATUS: Record<TodayAppointment["status"], { label: string; className: string }> = {
  pending: { label: "en attente", className: "border border-sable/70 bg-white text-anthracite/80" },
  confirmed: { label: "confirmé", className: "bg-brand text-beige" },
  in_progress: { label: "en cours", className: "bg-accent text-white" },
  completed: { label: "terminé", className: "bg-sable/40 text-brand" },
  cancelled: { label: "annulé", className: "bg-red-100 text-red-800" },
};

function TodaySchedule({ list, count }: { list: TodayAppointment[] | null; count: number }) {
  return (
    <section aria-labelledby="today-title" className={CARD}>
      <h2 id="today-title" className="font-sans text-base font-semibold text-anthracite">
        Planning du jour
      </h2>
      <p className="text-sm text-anthracite/70">Rendez-vous d&apos;aujourd&apos;hui et personne prévue</p>
      {list === null ? (
        <div className="mt-5 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-sable/15" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="mt-5 rounded-lg bg-white px-4 py-6 text-center text-sm text-anthracite/70">Aucun rendez-vous aujourd&apos;hui.</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {list.map((a) => {
            const status = STATUS[a.status];
            return (
              <li key={a.id} className="flex items-center gap-4 rounded-lg bg-[#f1ece6] px-4 py-3">
                <div className="w-16 shrink-0">
                  <p className="text-sm font-semibold tabular-nums text-anthracite">
                    {new Date(a.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="truncate text-xs text-anthracite/65">{a.employee ?? "—"}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-anthracite">{a.client_name ?? "Client"}</p>
                  <p className="truncate text-xs text-anthracite/65">{serviceWithOption(a.service ?? "Service", a.option_label)}</p>
                </div>
                <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${status.className}`}>{status.label}</span>
              </li>
            );
          })}
        </ul>
      )}
      {list !== null && count > list.length && (
        <Link href="/manager/appointments" className={`${ui.textLink} mt-4 inline-block text-sm`}>
          Voir les {count} rendez-vous du jour
        </Link>
      )}
    </section>
  );
}

function StaffPerformance({ employees, period }: { employees: { employee_id: number; name: string; count: number; revenue: number }[] | null; period: ActivityPeriod }) {
  const top = (employees ?? []).slice(0, 3);
  return (
    <section aria-labelledby="staff-title" className={CARD}>
      <h2 id="staff-title" className="font-sans text-base font-semibold text-anthracite">
        Performance de l&apos;équipe
      </h2>
      <p className="text-sm text-anthracite/70">Employés les plus sollicités, {PERIOD_SHORT[period]}</p>
      {employees === null ? (
        <div className="mt-5 h-32 animate-pulse rounded-lg bg-sable/15" />
      ) : top.length === 0 ? (
        <p className="mt-5 text-sm text-anthracite/70">Aucun rendez-vous réalisé sur cette période.</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-4">
          {top.map((e) => (
            <li key={e.employee_id} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-beige"
              >
                {e.name.trim().charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-anthracite">{e.name}</p>
                <p className="text-xs text-anthracite/65">{e.count} rendez-vous</p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-anthracite">{formatCurrency(e.revenue)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Plus, Star, UsersRound, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useManager, type ManagerStats, type TodayAppointment } from "@/hooks/useManager";
import { useManagerActivity } from "@/hooks/useManagerActivity";
import { useCurrentUser } from "@/hooks/useAuthState";
import { CARD } from "@/components/manager/ActivitySection";
import HubPage, { HUB_BUTTON, SalonPicker, useChosenSalon } from "@/components/manager/HubPage";
import RemindersCard from "@/components/manager/RemindersCard";
import CountUp from "@/components/motion/CountUp";
import { formatCurrency } from "@/lib/currency";
import { ui } from "@/lib/ui";

function dayTrend(today: number, yesterday: number): string | null {
  if (yesterday === 0) return null;
  const pct = Math.round(((today - yesterday) / yesterday) * 100);
  return `${pct >= 0 ? "+" : ""}${pct} %`;
}

// Vue d'ensemble du gérant : la journée en cours. Les analyses détaillées
// sont dans la rubrique Statistiques.
export default function ManagerDashboardPage() {
  const { getSalonStats } = useManager();
  const { salons, salonId, choose } = useChosenSalon();
  const user = useCurrentUser();
  const [stats, setStats] = useState<{ key: string; data: ManagerStats } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const statsKey = String(salonId ?? "all");
  const activity = useManagerActivity("month", salonId);

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

  const current = stats?.key === statsKey ? stats.data : null;
  const data = activity.data;
  const firstName = user?.name?.trim().split(/\s+/)[0];
  const trend = current?.today ? dayTrend(current.today.count, current.today.yesterday) : null;

  return (
    <HubPage
      title="Votre espace de gestion"
      subtitle={`${firstName ? `Bonjour ${firstName}, ` : ""}gérez vos salons et suivez votre activité.`}
      actions={
        <>
          <SalonPicker salons={salons} salonId={salonId} onChange={choose} />
          <Link href="/manager/appointments?nouveau=1" className={HUB_BUTTON}>
            <Plus size={17} aria-hidden="true" />
            Nouveau rendez-vous
          </Link>
        </>
      }
    >
      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          label="Rendez-vous du jour"
          icon={CalendarDays}
          tone="ciel"
          value={current?.today ? <CountUp value={current.today.count} /> : null}
          note={
            current?.today ? (
              trend ? (
                <>
                  <span className="text-accent">{trend}</span> par rapport à hier
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
          tone="lilas"
          value={data ? <CountUp value={data.loyalty.clients} /> : null}
          note="sur les 30 derniers jours"
        />
        <Kpi
          label="Chiffre d'affaires"
          icon={Wallet}
          tone="vert"
          value={data ? <CountUp value={data.totals.revenue} format={(n) => formatCurrency(n)} /> : null}
          note="encaissé, 30 derniers jours"
        />
        <Kpi
          label="Note moyenne"
          icon={Star}
          tone="ambre"
          value={
            current
              ? current.rating?.average != null
                ? Number(current.rating.average).toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                : "—"
              : null
          }
          note={current?.rating ? `${current.rating.count} avis` : null}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <TodaySchedule list={current?.today?.list ?? null} count={current?.today?.count ?? 0} />
        <StaffPerformance employees={data?.employees ?? null} />
      </div>

      <RemindersCard />
    </HubPage>
  );
}

const AVATAR_TONES = ["bg-vif-vert-bg text-vif-vert-ink", "bg-vif-lilas-bg text-vif-lilas-ink", "bg-vif-ciel-bg text-vif-ciel-ink"];

// Pastille d'icône colorée par indicateur (accents vifs de l'application).
const KPI_TONES = {
  vert: "bg-vif-vert-bg text-vif-vert-ink",
  lilas: "bg-vif-lilas-bg text-vif-lilas-ink",
  ciel: "bg-vif-ciel-bg text-vif-ciel-ink",
  ambre: "bg-vif-ambre-bg text-vif-ambre-ink",
} as const;

function Kpi({
  label,
  icon: Icon,
  value,
  note,
  tone,
}: {
  label: string;
  icon: LucideIcon;
  value: React.ReactNode;
  note: React.ReactNode;
  tone: keyof typeof KPI_TONES;
}) {
  return (
    <div className={`${CARD} flex flex-col`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-anthracite">{label}</p>
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${KPI_TONES[tone]}`}>
          <Icon size={17} strokeWidth={1.9} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-7 text-[22px] font-bold leading-none tabular-nums tracking-tight text-anthracite">
        {value ?? <span className="inline-block h-6 w-16 animate-pulse rounded bg-sable/20" />}
      </p>
      <p className="mt-1.5 min-h-4 text-xs text-anthracite/60">{note}</p>
    </div>
  );
}

const STATUS: Record<TodayAppointment["status"], { label: string; className: string }> = {
  pending: { label: "en attente", className: "bg-vif-ambre-bg text-vif-ambre-ink" },
  confirmed: { label: "confirmé", className: "bg-vif-vert-bg text-vif-vert-ink" },
  in_progress: { label: "en cours", className: "bg-vif-ciel-bg text-vif-ciel-ink" },
  completed: { label: "terminé", className: "bg-vif-lilas-bg text-vif-lilas-ink" },
  cancelled: { label: "annulé", className: "bg-vif-corail-bg text-vif-corail-ink" },
  no_show: { label: "absente", className: "bg-red-100 text-red-800" },
};

function TodaySchedule({ list, count }: { list: TodayAppointment[] | null; count: number }) {
  return (
    <section aria-labelledby="today-title" className={CARD}>
      <h2 id="today-title" className="font-sans text-base font-semibold text-anthracite">
        Planning du jour
      </h2>
      <p className="mt-0.5 text-sm text-anthracite/60">Rendez-vous d&apos;aujourd&apos;hui et personne prévue</p>
      {list === null ? (
        <div className="mt-5 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-sable/15" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="mt-5 rounded-lg bg-[#f1ece6] px-4 py-6 text-center text-sm text-anthracite/70">Aucun rendez-vous aujourd&apos;hui.</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {list.map((a) => {
            const status = STATUS[a.status];
            return (
              <li key={a.id} className="flex items-center gap-5 rounded-lg bg-[#f1ece6] px-4 py-3.5">
                <div className="w-28 shrink-0">
                  <p className="text-sm font-medium tabular-nums text-anthracite">
                    {new Date(a.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="truncate text-xs text-anthracite/65">{a.employee ?? "—"}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-anthracite">{a.client_name ?? "Client"}</p>
                  <p className="truncate text-xs text-anthracite/65">{a.service ?? "Service"}</p>
                </div>
                <span className={`shrink-0 rounded-md px-2.5 py-0.5 text-xs font-medium ${status.className}`}>{status.label}</span>
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

function StaffPerformance({ employees }: { employees: { employee_id: number; name: string; count: number; revenue: number }[] | null }) {
  const top = (employees ?? []).slice(0, 3);
  return (
    <section aria-labelledby="staff-title" className={CARD}>
      <h2 id="staff-title" className="font-sans text-base font-semibold text-anthracite">
        Performance de l&apos;équipe
      </h2>
      <p className="mt-0.5 text-sm text-anthracite/60">Les plus sollicités, 30 derniers jours</p>
      {employees === null ? (
        <div className="mt-5 h-32 animate-pulse rounded-lg bg-sable/15" />
      ) : top.length === 0 ? (
        <p className="mt-5 text-sm text-anthracite/70">Aucun rendez-vous réalisé sur cette période.</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-4">
          {top.map((e, i) => (
            <li key={e.employee_id} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${AVATAR_TONES[i % AVATAR_TONES.length]}`}
              >
                {e.name.trim().charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-anthracite">{e.name}</p>
                <p className="text-xs text-anthracite/60">{e.count} rendez-vous</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Info, TrendingUp } from "lucide-react";
import CountUp from "@/components/motion/CountUp";
import { AdminStats, useAdmin } from "@/hooks/useAdmin";
import { useCurrentUser } from "@/hooks/useAuthState";
import { BOOKING_SOURCE_LABELS } from "@/lib/bookingSources";
import { formatCurrency } from "@/lib/currency";
import { serviceWithOption } from "@/lib/serviceOptions";
import type { BookingSource } from "@/hooks/useManagerAppointments";

// Cartes de la vue d'ensemble : fond beige uni, sans bordure.
const CARD = "rounded-2xl bg-beige p-5 sm:p-6";

const SOURCE_COLORS: Record<BookingSource, string> = {
  online: "var(--color-chart-1)",
  whatsapp: "var(--color-chart-2)",
  instagram: "var(--color-chart-3)",
  facebook: "var(--color-chart-4)",
  tiktok: "var(--color-chart-5)",
  phone: "var(--color-chart-6)",
  walk_in: "var(--color-chart-7)",
};

const MONTH_SHORT = (ym: string) =>
  new Date(`${ym}-01T00:00:00`).toLocaleDateString("fr-FR", { month: "short" }).replace(".", "");

export default function AdminDashboardPage() {
  const { getStats } = useAdmin();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const user = useCurrentUser();
  const firstName = user?.name?.trim().split(/\s+/)[0];

  const load = useCallback(async () => {
    try {
      setStats(await getStats());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger le tableau de bord.");
    }
  }, [getStats]);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  return (
    <main className="flex flex-1 flex-col px-5 pb-10 pt-2 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <div>
          <h1 className="text-3xl tracking-tight text-anthracite">Vue d&apos;ensemble</h1>
          {firstName && <p className="mt-1 text-sm text-anthracite/70">Bonjour {firstName}, voici l&apos;activité de la plateforme.</p>}
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        {!stats ? (
          !error && (
            <div className="flex flex-col gap-4" aria-busy="true" aria-label="Chargement du tableau de bord">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-32 animate-pulse rounded-2xl bg-beige" />
                ))}
              </div>
              <div className="h-72 animate-pulse rounded-2xl bg-beige" />
            </div>
          )
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Kpi
                title="Salons en ligne"
                info="Salons validés et visibles par les clients."
                value={<CountUp value={stats.salons.online} />}
                note={`${stats.salons.pending} en attente`}
              />
              <Kpi
                title="Clientes inscrites"
                info="Comptes clients créés sur la plateforme."
                value={<CountUp value={stats.users.clients} />}
                note={`+${stats.users.new_clients} ce mois-ci`}
                up={stats.users.new_clients > 0 ? true : null}
              />
              <Kpi
                title="Rendez-vous du mois"
                info="Du 1er à aujourd'hui, comparé à la même période du mois dernier."
                value={<CountUp value={stats.appointments.this_month} />}
                note={stats.appointments.trend === null ? "pas de comparaison" : `${formatPct(stats.appointments.trend, true)} sur un mois`}
                up={stats.appointments.trend === null ? null : stats.appointments.trend >= 0}
              />
              <Kpi
                title="Taux d'annulation"
                info="Part des rendez-vous annulés sur les 30 derniers jours."
                value={stats.appointments.cancellation_rate === null ? "—" : formatPct(stats.appointments.cancellation_rate)}
                note="30 derniers jours"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)_minmax(0,1.5fr)]">
              <ChannelGauge stats={stats} />
              <PlatformActivity stats={stats} />
              <AppointmentGrowth stats={stats} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
              <RecentAppointments stats={stats} />
              <Cities stats={stats} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function formatPct(value: number, signed = false): string {
  const text = `${value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
  return signed && value > 0 ? `+${text}` : text;
}

function Kpi({
  title,
  info,
  value,
  note,
  up = null,
}: {
  title: string;
  info: string;
  value: React.ReactNode;
  note: string;
  up?: boolean | null;
}) {
  return (
    <div className={`${CARD} flex flex-col`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-base font-medium text-anthracite">{title}</p>
        <span title={info} className="text-anthracite/50">
          <Info size={16} aria-hidden="true" />
          <span className="sr-only">{info}</span>
        </span>
      </div>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-2">
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-anthracite">{value}</p>
        <p className="flex items-center gap-1 text-[11px] text-anthracite/65">
          {up !== null && (
            <span className={`flex size-4 items-center justify-center rounded ${up ? "bg-success/15 text-success" : "bg-alert/15 text-alert"}`}>
              {up ? <ArrowUpRight size={11} aria-hidden="true" /> : <ArrowDownRight size={11} aria-hidden="true" />}
            </span>
          )}
          {note}
        </p>
      </div>
    </div>
  );
}

// Demi-jauge : part de chaque canal sur les 30 derniers jours.
function ChannelGauge({ stats }: { stats: AdminStats }) {
  const sources = (stats.appointments.sources ?? []).filter((s) => s.count > 0);
  const total = stats.appointments.recent_total ?? 0;
  const R = 70;
  const C = Math.PI * R; // longueur du demi-cercle
  let offset = 0;

  return (
    <section aria-labelledby="gauge-title" className="flex flex-col rounded-2xl bg-gradient-to-b from-beige to-sable/30 p-5 sm:p-6">
      <h2 id="gauge-title" className="font-sans text-lg font-medium text-anthracite">
        Canaux de réservation
      </h2>
      <div className="mx-auto mt-4 w-full max-w-[220px]">
        <svg viewBox="0 0 180 100" className="w-full" role="img" aria-label={`${total} rendez-vous sur 30 jours, répartis par canal`}>
          <path d={`M 20 90 A ${R} ${R} 0 0 1 160 90`} fill="none" stroke="white" strokeWidth="18" />
          {total > 0 &&
            sources.map((s) => {
              const length = (s.count / total) * C;
              const el = (
                <path
                  key={s.source}
                  d={`M 20 90 A ${R} ${R} 0 0 1 160 90`}
                  fill="none"
                  stroke={SOURCE_COLORS[s.source]}
                  strokeWidth="18"
                  strokeDasharray={`${Math.max(length - 1.5, 0.5)} ${C}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += length;
              return el;
            })}
          <text x="90" y="78" textAnchor="middle" className="fill-anthracite" style={{ fontSize: 22, fontWeight: 600 }}>
            {total.toLocaleString("fr-FR")}
          </text>
          <text x="90" y="94" textAnchor="middle" className="fill-anthracite/70" style={{ fontSize: 9 }}>
            rendez-vous, 30 jours
          </text>
        </svg>
      </div>
      <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-anthracite/80">
        {sources.map((s) => (
          <li key={s.source} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2 rounded-full" style={{ background: SOURCE_COLORS[s.source] }} />
            {BOOKING_SOURCE_LABELS[s.source]} {formatPct(s.share)}
          </li>
        ))}
      </ul>
    </section>
  );
}

// Activité sur 12 mois : chiffres clés et courbes cumulées.
function PlatformActivity({ stats }: { stats: AdminStats }) {
  const months = stats.monthly;
  const totalAppointments = months.reduce((n, m) => n + m.appointments, 0);
  const totalClients = months.reduce((n, m) => n + m.new_clients, 0);
  const cumulative = (key: "appointments" | "new_clients") => {
    let sum = 0;
    const values = months.map((m) => (sum += m[key]));
    const max = Math.max(1, values[values.length - 1]);
    return values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * 200},${100 - (v / max) * 92}`).join(" ");
  };

  return (
    <section aria-labelledby="activity-title" className={`${CARD} flex flex-col`}>
      <h2 id="activity-title" className="font-sans text-lg font-medium text-anthracite">
        Activité de la plateforme
      </h2>
      <ul className="mt-2 flex flex-wrap gap-4 text-xs text-anthracite/75">
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2 rounded-full bg-brand" />
          Rendez-vous
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
          Nouvelles clientes
        </li>
      </ul>
      <div className="mt-4 grid flex-1 grid-cols-[auto_minmax(0,1fr)] gap-4">
        <dl className="grid grid-cols-1 content-center gap-4 sm:grid-cols-2 sm:gap-x-6">
          <div>
            <dt className="sr-only">Rendez-vous sur 12 mois</dt>
            <dd className="text-3xl font-semibold tabular-nums text-anthracite">{totalAppointments.toLocaleString("fr-FR")}</dd>
            <dd className="text-xs text-anthracite/70">rendez-vous</dd>
          </div>
          <div>
            <dt className="sr-only">Nouvelles clientes sur 12 mois</dt>
            <dd className="text-3xl font-semibold tabular-nums text-anthracite">{totalClients.toLocaleString("fr-FR")}</dd>
            <dd className="text-xs text-anthracite/70">nouvelles clientes</dd>
          </div>
          <div>
            <dt className="sr-only">Part des réservations en ligne</dt>
            <dd className="text-3xl font-semibold tabular-nums text-anthracite">
              {stats.appointments.online_share === null ? "—" : formatPct(stats.appointments.online_share)}
            </dd>
            <dd className="text-xs text-anthracite/70">réservés en ligne</dd>
          </div>
        </dl>
        <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="h-full min-h-32 w-full" role="img" aria-label="Évolution cumulée sur 12 mois">
          <polyline points={cumulative("appointments")} fill="none" stroke="var(--color-brand)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          <polyline
            points={cumulative("new_clients")}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2.5"
            strokeDasharray="5 4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <p className="mt-2 text-xs text-anthracite/60">Sur les 12 derniers mois, mois en cours compris.</p>
    </section>
  );
}

// Croissance : 3 derniers mois complets comparés aux 3 précédents, barres sur 6 mois.
function AppointmentGrowth({ stats }: { stats: AdminStats }) {
  const full = stats.monthly.filter((m) => !m.is_partial);
  const last3 = full.slice(-3).reduce((n, m) => n + m.appointments, 0);
  const prev3 = full.slice(-6, -3).reduce((n, m) => n + m.appointments, 0);
  const growth = prev3 > 0 ? ((last3 - prev3) / prev3) * 100 : null;
  const bars = full.slice(-6);
  const max = Math.max(1, ...bars.map((m) => m.appointments));

  return (
    <section aria-labelledby="growth-title" className={`${CARD} flex flex-col`}>
      <h2 id="growth-title" className="font-sans text-lg font-medium text-anthracite">
        Croissance des rendez-vous
      </h2>
      <div className="mt-4 grid flex-1 grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] items-end gap-4">
        <div className="pb-6">
          <span className="flex size-5 items-center justify-center rounded bg-success/15 text-success">
            <TrendingUp size={13} aria-hidden="true" />
          </span>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-anthracite">{growth === null ? "—" : formatPct(Math.round(growth * 10) / 10, true)}</p>
          <p className="text-xs text-anthracite/70">par rapport au trimestre précédent</p>
        </div>
        <div>
          <ol className="flex h-44 items-end gap-1.5" aria-label="Rendez-vous des 6 derniers mois complets">
            {bars.map((m) => {
              const peak = m.appointments === max;
              return (
                <li key={m.month} className="relative flex h-full flex-1 flex-col justify-end overflow-hidden rounded-full bg-white">
                  <div
                    className={`relative flex w-full justify-center rounded-full ${peak ? "bg-accent" : "bg-sable/70"}`}
                    style={{ height: `${Math.max(8, (m.appointments / max) * 100)}%` }}
                  >
                    {peak && (
                      <span className="absolute bottom-3 rotate-180 text-[11px] font-semibold text-white [writing-mode:vertical-rl]">
                        {m.appointments.toLocaleString("fr-FR")}
                      </span>
                    )}
                  </div>
                  <span className="sr-only">
                    {MONTH_SHORT(m.month)} : {m.appointments} rendez-vous
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="mt-1.5 flex gap-1.5 text-center text-[10px] text-anthracite/60" aria-hidden="true">
            {bars.map((m) => (
              <span key={m.month} className="min-w-0 flex-1 truncate">
                {MONTH_SHORT(m.month)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-amber-100 text-amber-900" },
  confirmed: { label: "Confirmé", className: "bg-brand/10 text-brand" },
  in_progress: { label: "En cours", className: "bg-accent/15 text-accent" },
  completed: { label: "Terminé", className: "bg-success/15 text-success" },
  cancelled: { label: "Annulé", className: "bg-alert/15 text-alert" },
};

function RecentAppointments({ stats }: { stats: AdminStats }) {
  const rows = stats.recent_appointments ?? [];
  return (
    <section aria-labelledby="recent-title" className={CARD}>
      <h2 id="recent-title" className="font-sans text-lg font-medium text-anthracite">
        Derniers rendez-vous
      </h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-anthracite/70">Aucun rendez-vous enregistré pour le moment.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="text-anthracite">
                <th scope="col" className="pb-3 pr-3 font-medium">
                  N°
                </th>
                <th scope="col" className="pb-3 pr-3 font-medium">
                  Salon et service
                </th>
                <th scope="col" className="pb-3 pr-3 font-medium">
                  Date
                </th>
                <th scope="col" className="pb-3 pr-3 font-medium">
                  Prix
                </th>
                <th scope="col" className="pb-3 font-medium">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="text-anthracite/75">
              {rows.map((a) => {
                const status = STATUS[a.status] ?? STATUS.pending;
                return (
                  <tr key={a.id}>
                    <td className="py-2 pr-3 tabular-nums">#{a.id}</td>
                    <td className="max-w-[16rem] py-2 pr-3">
                      <span className="block truncate text-anthracite">{a.salon ?? "Salon"}</span>
                      <span className="block truncate text-xs">{serviceWithOption(a.service ?? "Service", a.option_label)}</span>
                    </td>
                    <td className="py-2 pr-3 tabular-nums">
                      {new Date(a.scheduled_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                    </td>
                    <td className="whitespace-nowrap py-2 pr-3 tabular-nums">{formatCurrency(a.price)}</td>
                    <td className="py-2">
                      <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Cities({ stats }: { stats: AdminStats }) {
  const cities = stats.cities ?? [];
  return (
    <section aria-labelledby="cities-title" className={CARD}>
      <h2 id="cities-title" className="font-sans text-lg font-medium text-anthracite">
        Salons par ville
      </h2>
      {cities.length === 0 ? (
        <p className="mt-4 text-sm text-anthracite/70">Aucun salon en ligne.</p>
      ) : (
        <>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-anthracite/80">
            {cities.slice(0, 4).map((c, i) => (
              <li key={c.city} className="flex items-center gap-1.5">
                <span aria-hidden="true" className="size-2 rounded-full" style={{ background: `var(--color-chart-${(i % 7) + 1})` }} />
                {c.city} {formatPct(c.share)}
              </li>
            ))}
          </ul>
          <ul className="mt-6 flex flex-col gap-4 text-sm">
            {cities.map((c, i) => (
              <li key={c.city}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-anthracite">{c.city}</span>
                  <span className="tabular-nums text-anthracite/70">
                    {c.count} salon{c.count > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full" style={{ width: `${Math.max(3, c.share)}%`, background: `var(--color-chart-${(i % 7) + 1})` }} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

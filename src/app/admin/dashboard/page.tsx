"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Info, TrendingUp } from "lucide-react";
import CountUp from "@/components/motion/CountUp";
import { type AdminSignup, AdminStats, useAdmin } from "@/hooks/useAdmin";
import { BOOKING_SOURCE_LABELS } from "@/lib/bookingSources";
import { formatCurrency } from "@/lib/currency";
import { serviceWithOption } from "@/lib/serviceOptions";
import type { BookingSource } from "@/hooks/useManagerAppointments";
import SenegalMap from "@/components/admin/SenegalMap";

// Cartes de la vue d'ensemble : fond beige uni, sans bordure ni ombre.
const CARD = "rounded-xl bg-beige p-5";
const CARD_TITLE = "font-sans text-[17px] font-medium text-anthracite";
const SHOW_ALL = "text-xs text-anthracite/70 transition-colors hover:text-brand";

// Canaux en tons verts (accent de l'administration), le lilas pour les canaux hors ligne.
const SOURCE_COLORS: Record<BookingSource, string> = {
  online: "var(--color-sauge)",
  whatsapp: "var(--color-sauge-mid)",
  instagram: "var(--color-sauge-soft)",
  facebook: "#b6e8c1",
  tiktok: "#1b5e39",
  phone: "#b49be6",
  walk_in: "#ddd0f6",
};

const MONTH_SHORT = (ym: string) =>
  new Date(`${ym}-01T00:00:00`).toLocaleDateString("fr-FR", { month: "short" }).replace(".", "");

export default function AdminDashboardPage() {
  const { getStats } = useAdmin();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <main className="flex flex-1 flex-col px-5 pb-10 pt-4 sm:px-8 md:pt-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        {/* Titre seul, sur la ligne de la cloche et de l'avatar (barre du cadre). */}
        <h1 className="flex min-h-10 items-center font-sans text-[22px] font-medium tracking-tight text-anthracite">Vue d&apos;ensemble</h1>

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
                  <div key={i} className="h-28 animate-pulse rounded-xl bg-beige" />
                ))}
              </div>
              <div className="h-72 animate-pulse rounded-xl bg-beige" />
            </div>
          )
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Kpi
                title="Salons inscrits"
                info="Tous les salons enregistrés : en ligne, en attente de validation, suspendus ou refusés."
                value={<CountUp value={stats.salons.total ?? stats.salons.online + stats.salons.pending + stats.salons.suspended + stats.salons.rejected} />}
                note={`${stats.salons.pending} en attente de validation`}
              />
              <Kpi
                title="Clientes inscrites"
                info="Comptes clients. La variation compare les inscriptions du 1er à aujourd'hui à la même période du mois dernier."
                value={<CountUp value={stats.users.clients} />}
                delta={stats.users.signup_trend == null ? { text: `+${stats.users.new_clients}`, up: true } : { text: formatPct(stats.users.signup_trend, true), up: stats.users.signup_trend >= 0 }}
                note={stats.users.signup_trend == null ? "ce mois-ci" : "inscriptions, sur un mois"}
              />
              <Kpi
                title="Réservations"
                info="Tous les rendez-vous enregistrés. La variation compare ce mois-ci (du 1er à aujourd'hui) à la même période du mois dernier."
                value={<CountUp value={stats.appointments.total ?? stats.appointments.this_month} />}
                delta={stats.appointments.trend === null ? undefined : { text: formatPct(stats.appointments.trend, true), up: stats.appointments.trend >= 0 }}
                note={stats.appointments.trend === null ? `${stats.appointments.this_month} ce mois-ci` : "ce mois, sur un mois"}
              />
              <Kpi
                title="Taux d'annulation"
                info="Part des rendez-vous annulés sur les 30 derniers jours."
                value={stats.appointments.cancellation_rate === null ? "—" : formatPct(stats.appointments.cancellation_rate)}
                note="30 derniers jours"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,2fr)]">
              <ChannelGauge stats={stats} />
              <PlatformActivity stats={stats} />
              <AppointmentGrowth stats={stats} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
              <RecentActivity stats={stats} />
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
  delta,
}: {
  title: string;
  info: string;
  value: React.ReactNode;
  note: string;
  // Variation colorée (pastille flèche + pourcentage), au-dessus de la note.
  delta?: { text: string; up: boolean };
}) {
  return (
    <div className={`${CARD} flex flex-col`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[15px] font-medium text-anthracite">{title}</p>
        <span title={info} className="text-anthracite/50">
          <Info size={15} aria-hidden="true" />
          <span className="sr-only">{info}</span>
        </span>
      </div>
      <div className="mt-5 flex items-end justify-between gap-2">
        <p className="text-[28px] font-medium leading-none tabular-nums tracking-tight text-anthracite">{value}</p>
        <div className="text-right text-[10px] leading-tight text-anthracite/65">
          {delta && (
            <p className={`flex items-center justify-end gap-1 font-medium ${delta.up ? "text-sauge" : "text-[#d93a2b]"}`}>
              <span className={`flex size-3.5 items-center justify-center rounded-[3px] text-white ${delta.up ? "bg-sauge" : "bg-[#d93a2b]"}`}>
                {delta.up ? <ArrowUpRight size={10} aria-hidden="true" /> : <ArrowDownRight size={10} aria-hidden="true" />}
              </span>
              {delta.text}
            </p>
          )}
          <p className="whitespace-nowrap">{note}</p>
        </div>
      </div>
    </div>
  );
}

// Demi-jauge : part de chaque canal sur les 30 derniers jours, puis un
// conseil tiré des chiffres (comme l'encart « astuce » du modèle).
function ChannelGauge({ stats }: { stats: AdminStats }) {
  const sources = (stats.appointments.sources ?? []).filter((s) => s.count > 0);
  const total = stats.appointments.recent_total ?? 0;
  const R = 66;
  const C = Math.PI * R; // longueur du demi-cercle
  let offset = 0;
  const offline = sources.filter((s) => s.source !== "online").sort((a, b) => b.share - a.share)[0];

  return (
    <section
      aria-labelledby="gauge-title"
      className="flex flex-col rounded-xl bg-gradient-to-b from-sauge-light via-beige to-beige p-4"
    >
      <h2 id="gauge-title" className={CARD_TITLE}>
        Canaux
      </h2>
      <div className="mx-auto mt-3 w-full max-w-[190px]">
        <svg viewBox="0 0 170 96" className="w-full" role="img" aria-label={`${total} rendez-vous sur 30 jours, répartis par canal`}>
          <path d={`M 19 88 A ${R} ${R} 0 0 1 151 88`} fill="none" stroke="white" strokeWidth="20" />
          {total > 0 &&
            sources.map((s) => {
              const length = (s.count / total) * C;
              const el = (
                <path
                  key={s.source}
                  d={`M 19 88 A ${R} ${R} 0 0 1 151 88`}
                  fill="none"
                  stroke={SOURCE_COLORS[s.source]}
                  strokeWidth="20"
                  strokeDasharray={`${Math.max(length - 1.5, 0.5)} ${C}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += length;
              return el;
            })}
          <text x="85" y="76" textAnchor="middle" className="fill-anthracite" style={{ fontSize: 21, fontWeight: 500 }}>
            {total.toLocaleString("fr-FR")}
          </text>
          <text x="85" y="90" textAnchor="middle" className="fill-anthracite/70" style={{ fontSize: 8.5 }}>
            rendez-vous, 30 j
          </text>
        </svg>
      </div>
      <ul className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-anthracite/80">
        {sources.map((s) => (
          <li key={s.source} className="flex items-center gap-1">
            <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: SOURCE_COLORS[s.source] }} />
            {BOOKING_SOURCE_LABELS[s.source]}
          </li>
        ))}
      </ul>
      {offline && (
        <div className="mt-4 text-[11px] leading-snug text-anthracite/70">
          <p className="font-medium text-anthracite">Conseil</p>
          <p className="mt-0.5">
            {BOOKING_SOURCE_LABELS[offline.source]} pèse {formatPct(offline.share)} des réservations : invitez ces clientes à réserver en ligne.
          </p>
        </div>
      )}
      <div className="min-h-4 flex-1" aria-hidden="true" />
      <Link
        href="/admin/salons/all"
        className="flex min-h-8 items-center justify-center rounded-lg bg-sauge-soft text-xs font-medium text-sauge-ink transition-colors hover:bg-sauge-mid"
      >
        Voir les salons
      </Link>
    </section>
  );
}

// Courbe lissée (Catmull-Rom → Bézier) à partir de points [x, y].
function smoothPath(points: [number, number][]): string {
  if (points.length === 0) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

// Activité sur 12 mois : chiffres clés et courbes cumulées. Le mois en cours,
// incomplet, est en pointillés après le trait vertical.
function PlatformActivity({ stats }: { stats: AdminStats }) {
  const months = stats.monthly;
  const totalAppointments = months.reduce((n, m) => n + m.appointments, 0);
  const totalClients = months.reduce((n, m) => n + m.new_clients, 0);
  const n = Math.max(1, months.length - 1);
  const cumulative = (key: "appointments" | "new_clients"): [number, number][] => {
    let sum = 0;
    const values = months.map((m) => (sum += m[key]));
    const max = Math.max(1, values[values.length - 1] ?? 1);
    return values.map((v, i) => [(i / n) * 200, 96 - (v / max) * 88]);
  };
  const partial = months[months.length - 1]?.is_partial === true && months.length > 1;
  const split = (pts: [number, number][]) => (partial ? [pts.slice(0, -1), pts.slice(-2)] : [pts, []]);
  const [rdvDone, rdvNow] = split(cumulative("appointments"));
  const [cliDone, cliNow] = split(cumulative("new_clients"));
  const splitX = partial ? ((months.length - 2) / n) * 200 : null;

  return (
    <section aria-labelledby="activity-title" className={`${CARD} flex flex-col`}>
      <h2 id="activity-title" className={CARD_TITLE}>
        Activité de la plateforme
      </h2>
      <ul className="mt-2 flex flex-wrap gap-4 text-xs text-anthracite/75">
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
          {totalAppointments.toLocaleString("fr-FR")} rendez-vous
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-sauge-mid" />
          {totalClients.toLocaleString("fr-FR")} nouvelles clientes
        </li>
      </ul>
      <div className="mt-3 grid flex-1 grid-cols-[auto_minmax(0,1fr)] gap-3">
        <dl className="grid grid-cols-2 content-center gap-x-8 gap-y-5">
          <div>
            <dt className="sr-only">Rendez-vous sur 12 mois</dt>
            <dd className="text-[28px] font-medium leading-none tabular-nums text-anthracite">{totalAppointments.toLocaleString("fr-FR")}</dd>
            <dd className="mt-1 text-center text-[11px] text-anthracite/70">rendez-vous</dd>
          </div>
          <div>
            <dt className="sr-only">Nouvelles clientes sur 12 mois</dt>
            <dd className="text-[28px] font-medium leading-none tabular-nums text-anthracite">{totalClients.toLocaleString("fr-FR")}</dd>
            <dd className="mt-1 text-center text-[11px] text-anthracite/70">clientes</dd>
          </div>
          <div>
            <dt className="sr-only">Part des réservations en ligne</dt>
            <dd className="text-[28px] font-medium leading-none tabular-nums text-anthracite">
              {stats.appointments.online_share === null ? "—" : formatPct(stats.appointments.online_share)}
            </dd>
            <dd className="mt-1 text-center text-[11px] text-anthracite/70">en ligne</dd>
          </div>
        </dl>
        <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="h-full min-h-32 w-full" role="img" aria-label="Évolution cumulée sur les 12 derniers mois, mois en cours compris">
          {splitX !== null && <line x1={splitX} x2={splitX} y1="0" y2="100" stroke="var(--color-brand)" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
          <path d={smoothPath(cliDone)} fill="none" stroke="var(--color-sauge-mid)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          <path d={smoothPath(rdvDone)} fill="none" stroke="var(--color-brand)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          {cliNow.length > 1 && (
            <path d={smoothPath(cliNow)} fill="none" stroke="var(--color-sauge-mid)" strokeWidth="2.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
          )}
          {rdvNow.length > 1 && (
            <path d={smoothPath(rdvNow)} fill="none" stroke="var(--color-brand)" strokeWidth="3" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
          )}
        </svg>
      </div>
    </section>
  );
}

// Croissance : 3 derniers mois complets comparés aux 3 précédents, barres sur
// 6 mois ; le dernier mois est mis en avant avec sa valeur.
function AppointmentGrowth({ stats }: { stats: AdminStats }) {
  const full = stats.monthly.filter((m) => !m.is_partial);
  const last3 = full.slice(-3).reduce((n, m) => n + m.appointments, 0);
  const prev3 = full.slice(-6, -3).reduce((n, m) => n + m.appointments, 0);
  const growth = prev3 > 0 ? ((last3 - prev3) / prev3) * 100 : null;
  const bars = full.slice(-6);
  const max = Math.max(1, ...bars.map((m) => m.appointments));
  const labelled = new Set([0, Math.floor((bars.length - 1) / 2), bars.length - 1]);

  return (
    <section aria-labelledby="growth-title" className={`${CARD} flex flex-col`}>
      <h2 id="growth-title" className={CARD_TITLE}>
        Croissance des rendez-vous
      </h2>
      <div className="mt-3 grid flex-1 grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] items-end gap-3">
        <div className="pb-7">
          <span className="flex size-4 items-center justify-center rounded-[3px] bg-sauge text-white">
            <TrendingUp size={11} aria-hidden="true" />
          </span>
          <p className="mt-2 text-[28px] font-medium leading-none tabular-nums text-anthracite">
            {growth === null ? "—" : formatPct(Math.round(growth), true)}
          </p>
          <p className="mt-1 text-[11px] text-anthracite/70">sur le trimestre précédent</p>
        </div>
        <div>
          <ol className="flex h-48 items-end gap-1" aria-label="Rendez-vous des 6 derniers mois complets">
            {bars.map((m, i) => {
              const last = i === bars.length - 1;
              return (
                <li key={m.month} className="relative flex h-full flex-1 flex-col justify-end overflow-hidden rounded-[10px] bg-sauge-light">
                  <div
                    className={`relative flex w-full justify-center rounded-[10px] ${last ? "bg-sauge" : "bg-sauge-soft"}`}
                    style={{ height: `${Math.max(8, (m.appointments / max) * 82)}%` }}
                  >
                    {last && (
                      <span className="absolute bottom-3 rotate-180 text-xs font-semibold text-white [writing-mode:vertical-rl]">
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
          <div className="mt-1.5 flex gap-1 text-center text-[10px] text-anthracite/60" aria-hidden="true">
            {bars.map((m, i) => (
              <span key={m.month} className="min-w-0 flex-1 truncate">
                {labelled.has(i) ? MONTH_SHORT(m.month) : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Pastilles de statut pleines, comme le modèle (vert, lilas, rouge…).
const STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-vif-ambre-bg text-vif-ambre-ink" },
  confirmed: { label: "Confirmé", className: "bg-vif-vert-bg text-vif-vert-ink" },
  in_progress: { label: "En cours", className: "bg-vif-ciel-bg text-vif-ciel-ink" },
  completed: { label: "Terminé", className: "bg-vif-lilas-bg text-vif-lilas-ink" },
  cancelled: { label: "Annulé", className: "bg-vif-corail-bg text-vif-corail-ink" },
};

const ROLE_LABELS: Record<AdminSignup["role"], string> = { client: "Cliente", gerant: "Gérant" };

// Activité récente : dernières réservations ou dernières inscriptions.
function RecentActivity({ stats }: { stats: AdminStats }) {
  const [tab, setTab] = useState<"bookings" | "signups">("bookings");
  const rows = stats.recent_appointments ?? [];
  const signups = stats.recent_signups ?? [];
  const tabClass = (on: boolean) =>
    `rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${on ? "bg-white text-anthracite shadow-sm" : "text-anthracite/65 hover:text-anthracite"}`;

  return (
    <section aria-labelledby="recent-title" className={CARD}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="recent-title" className={CARD_TITLE}>
          Activité récente
        </h2>
        <div role="group" aria-label="Type d'activité" className="flex rounded-lg bg-sable/30 p-0.5">
          <button type="button" aria-pressed={tab === "bookings"} onClick={() => setTab("bookings")} className={tabClass(tab === "bookings")}>
            Réservations
          </button>
          <button type="button" aria-pressed={tab === "signups"} onClick={() => setTab("signups")} className={tabClass(tab === "signups")}>
            Inscriptions
          </button>
        </div>
      </div>
      {tab === "signups" ? (
        signups.length === 0 ? (
          <p className="mt-4 text-sm text-anthracite/70">Aucune inscription pour le moment.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[26rem] text-left text-[13px]">
              <thead>
                <tr className="text-anthracite">
                  {["N°", "Nom", "Rôle", "Inscription"].map((h) => (
                    <th key={h} scope="col" className="pb-2.5 pr-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-anthracite/75">
                {signups.map((u) => (
                  <tr key={u.id}>
                    <td className="py-1.5 pr-3 tabular-nums">#{u.id}</td>
                    <td className="max-w-[12rem] truncate py-1.5 pr-3 text-anthracite">{u.name}</td>
                    <td className="py-1.5 pr-3">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
                          u.role === "gerant" ? "bg-[#fbdca6] text-[#7a4a0c]" : "bg-sauge-soft text-sauge-ink"
                        }`}
                      >
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums">{new Date(u.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-anthracite/70">Aucun rendez-vous enregistré pour le moment.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-[13px]">
            <thead>
              <tr className="text-anthracite">
                {["N°", "Salon", "Service", "Date", "Prix", "Statut"].map((h) => (
                  <th key={h} scope="col" className="pb-2.5 pr-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-anthracite/75">
              {rows.map((a) => {
                const status = STATUS[a.status] ?? STATUS.pending;
                return (
                  <tr key={a.id}>
                    <td className="py-1.5 pr-3 tabular-nums">#{a.id}</td>
                    <td className="max-w-[8rem] truncate py-1.5 pr-3">{a.salon ?? "Salon"}</td>
                    <td className="max-w-[8rem] truncate py-1.5 pr-3">{serviceWithOption(a.service ?? "Service", a.option_label)}</td>
                    <td className="py-1.5 pr-3 tabular-nums">
                      {new Date(a.scheduled_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                    </td>
                    <td className="whitespace-nowrap py-1.5 pr-3 tabular-nums">{formatCurrency(a.price)}</td>
                    <td className="py-1.5">
                      <span className={`inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ${status.className}`}>{status.label}</span>
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

const CITY_COLORS = ["var(--color-sauge)", "var(--color-sauge-mid)", "var(--color-sauge-soft)", "#b49be6"];

// Salons en ligne par ville : légende en haut, carte du Sénégal en points.
function Cities({ stats }: { stats: AdminStats }) {
  const cities = stats.cities ?? [];
  return (
    <section aria-labelledby="cities-title" className={`${CARD} flex flex-col`}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="cities-title" className={CARD_TITLE}>
          Salons par ville
        </h2>
        <Link href="/admin/salons/all" className={SHOW_ALL}>
          Voir tout
        </Link>
      </div>
      {cities.length === 0 ? (
        <p className="my-4 text-sm text-anthracite/70">Aucun salon en ligne.</p>
      ) : (
        <>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-anthracite/80">
            {cities.slice(0, 4).map((c, i) => (
              <li key={c.city} className="flex items-center gap-1.5">
                <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: CITY_COLORS[i % CITY_COLORS.length] }} />
                {c.city} <span className="text-anthracite/60">{formatPct(c.share)}</span>
              </li>
            ))}
          </ul>
          <div className="relative -mx-2 mb-3 mt-3 min-h-44 flex-1">
            <SenegalMap cities={cities} />
          </div>
        </>
      )}
    </section>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { type AdminMonth, AdminStats, useAdmin } from "@/hooks/useAdmin";
import { BOOKING_SOURCE_LABELS } from "@/lib/bookingSources";

const CARD = "rounded-xl bg-beige p-5";
const CARD_TITLE = "font-sans text-[17px] font-medium text-anthracite";

const MONTH_SHORT = (ym: string) =>
  new Date(`${ym}-01T00:00:00`).toLocaleDateString("fr-FR", { month: "short" }).replace(".", "");

const pct = (value: number | null | undefined) =>
  value == null ? "—" : `${value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;

interface Series {
  key: "appointments" | "new_clients" | "new_salons" | "cancelled";
  label: string;
  color: string;
}

// Barres mensuelles (13 mois, mois en cours compris et signalé). Plusieurs
// séries côte à côte, ou une série « dont » superposée (annulations).
function MonthlyBars({ months, series, overlay }: { months: AdminMonth[]; series: Series[]; overlay?: Series }) {
  const max = Math.max(1, ...months.flatMap((m) => series.map((s) => m[s.key] ?? 0)));
  return (
    <div>
      <ol className="flex h-48 items-end gap-1.5 sm:gap-2" aria-label="Valeurs mois par mois">
        {months.map((m) => (
          <li key={m.month} className={`flex h-full min-w-0 flex-1 items-end justify-center gap-0.5 ${m.is_partial ? "opacity-60" : ""}`}>
            {series.map((s) => {
              const value = m[s.key] ?? 0;
              const part = overlay ? (m[overlay.key] ?? 0) : 0;
              return (
                <div
                  key={s.key}
                  className="relative flex w-full max-w-5 flex-col justify-end overflow-hidden rounded-t-md"
                  style={{ height: `${Math.max(value > 0 ? 3 : 1, (value / max) * 100)}%`, background: s.color }}
                >
                  {overlay && value > 0 && <div style={{ height: `${(part / value) * 100}%`, background: overlay.color }} />}
                </div>
              );
            })}
            <span className="sr-only">
              {MONTH_SHORT(m.month)}
              {m.is_partial ? " (en cours)" : ""} : {series.map((s) => `${m[s.key] ?? 0} ${s.label.toLowerCase()}`).join(", ")}
              {overlay ? `, dont ${m[overlay.key] ?? 0} ${overlay.label.toLowerCase()}` : ""}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-1.5 flex gap-1.5 text-center text-[10px] text-anthracite/60 sm:gap-2" aria-hidden="true">
        {months.map((m, i) => (
          <span key={m.month} className="min-w-0 flex-1 truncate">
            {i % 2 === 0 || m.is_partial ? MONTH_SHORT(m.month) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string; value?: number }[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-anthracite/75">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2 rounded-sm" style={{ background: item.color }} />
          {item.label}
          {item.value !== undefined && <span className="font-medium tabular-nums text-anthracite">{item.value.toLocaleString("fr-FR")}</span>}
        </li>
      ))}
    </ul>
  );
}

// Évolution de la plateforme : inscriptions, réservations, canaux et indicateurs.
export default function AdminStatisticsPage() {
  const { getStats } = useAdmin();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setStats(await getStats());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les statistiques.");
    }
  }, [getStats]);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  const months = stats?.monthly ?? [];
  const sum = (key: Series["key"]) => months.reduce((n, m) => n + (m[key] ?? 0), 0);
  const signupSeries: Series[] = [
    { key: "new_clients", label: "Clientes", color: "var(--color-sauge)" },
    { key: "new_salons", label: "Salons", color: "var(--color-sauge-soft)" },
  ];
  const bookingSeries: Series[] = [{ key: "appointments", label: "Rendez-vous", color: "var(--color-sauge-mid)" }];
  const cancelled: Series = { key: "cancelled", label: "Annulés", color: "#e5574a" };
  const sources = (stats?.appointments.sources ?? []).filter((s) => s.count > 0).sort((a, b) => b.count - a.count);

  return (
    <main className="flex flex-1 flex-col px-5 pb-10 pt-4 sm:px-8 md:pt-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <div>
          <h1 className="flex min-h-10 items-center font-sans text-[22px] font-medium tracking-tight text-anthracite">Statistiques</h1>
          <p className="text-sm text-anthracite/70">Sur les 12 derniers mois ; le mois en cours, incomplet, est plus clair.</p>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        {!stats ? (
          !error && (
            <div className="grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Chargement des statistiques">
              <div className="h-72 animate-pulse rounded-xl bg-beige" />
              <div className="h-72 animate-pulse rounded-xl bg-beige" />
            </div>
          )
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <section aria-labelledby="signups-title" className={CARD}>
                <h2 id="signups-title" className={CARD_TITLE}>
                  Inscriptions
                </h2>
                <Legend items={signupSeries.map((s) => ({ label: s.label, color: s.color, value: sum(s.key) }))} />
                <div className="mt-4">
                  <MonthlyBars months={months} series={signupSeries} />
                </div>
              </section>

              <section aria-labelledby="bookings-title" className={CARD}>
                <h2 id="bookings-title" className={CARD_TITLE}>
                  Réservations
                </h2>
                <Legend
                  items={[
                    { label: "Rendez-vous", color: "var(--color-sauge-mid)", value: sum("appointments") },
                    { label: "dont annulés", color: cancelled.color, value: sum("cancelled") },
                  ]}
                />
                <div className="mt-4">
                  <MonthlyBars months={months} series={bookingSeries} overlay={cancelled} />
                </div>
              </section>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              <section aria-labelledby="channels-title" className={CARD}>
                <h2 id="channels-title" className={CARD_TITLE}>
                  Canaux de réservation
                </h2>
                <p className="mt-0.5 text-xs text-anthracite/65">30 derniers jours, {stats.appointments.recent_total ?? 0} rendez-vous</p>
                {sources.length === 0 ? (
                  <p className="mt-4 text-sm text-anthracite/70">Aucun rendez-vous sur la période.</p>
                ) : (
                  <ul className="mt-4 flex flex-col gap-3 text-sm">
                    {sources.map((s) => (
                      <li key={s.source}>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-anthracite">{BOOKING_SOURCE_LABELS[s.source]}</span>
                          <span className="tabular-nums text-anthracite/70">
                            {s.count.toLocaleString("fr-FR")} · {pct(s.share)}
                          </span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-sauge-light">
                          <div className="h-full rounded-full bg-sauge-mid" style={{ width: `${Math.max(2, s.share)}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section aria-labelledby="indicators-title" className={CARD}>
                <h2 id="indicators-title" className={CARD_TITLE}>
                  Indicateurs
                </h2>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
                  {[
                    { label: "Taux d'annulation (30 j)", value: pct(stats.appointments.cancellation_rate) },
                    { label: "Réservés en ligne (30 j)", value: pct(stats.appointments.online_share) },
                    { label: "Gérants inscrits", value: stats.users.managers.toLocaleString("fr-FR") },
                    { label: "Salons en ligne", value: stats.salons.online.toLocaleString("fr-FR") },
                    { label: "Salons suspendus", value: stats.salons.suspended.toLocaleString("fr-FR") },
                    { label: "Demandes refusées", value: stats.salons.rejected.toLocaleString("fr-FR") },
                  ].map((item) => (
                    <div key={item.label}>
                      <dt className="text-xs text-anthracite/65">{item.label}</dt>
                      <dd className="mt-0.5 text-2xl font-medium tabular-nums text-anthracite">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

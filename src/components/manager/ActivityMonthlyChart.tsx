"use client";

import { useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ActivityMonth, ActivityTopService } from "@/hooks/useManagerActivity";
import { formatMonthShort } from "@/components/manager/activityFormat";

// Trois séries maximum : au-delà, les courbes deviennent illisibles.
// Couleurs bien distinctes, prises dans la palette des graphiques (globals.css).
const SERIES_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)"];

export default function ActivityMonthlyChart({
  months,
  services,
}: {
  months: ActivityMonth[];
  services: ActivityTopService[];
}) {
  // Deux vues : le total et le détail par service ont des échelles très
  // différentes ; sur un même graphique, les services seraient écrasés en bas.
  const [view, setView] = useState<"total" | "services">("total");
  const series = services.slice(0, 3);
  const data = months.map((month) => {
    const row: Record<string, number | string> = { label: formatMonthShort(month.month), total: month.total };
    for (const service of series) {
      row[`s${service.service_id}`] = month.by_service[String(service.service_id)] ?? 0;
    }
    return row;
  });

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(90,50,35,0.05),0_8px_24px_rgba(90,50,35,0.07)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-anthracite">Évolution sur 12 mois</p>
          <p className="mb-4 text-sm text-anthracite/75">
            Rendez-vous réalisés chaque mois. Le dernier mois est en cours.
          </p>
        </div>
        <div role="group" aria-label="Affichage du graphique" className="flex rounded-full bg-beige p-1 text-sm font-semibold">
          {([["total", "Total"], ["services", "Par service"]] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={view === key}
              onClick={() => setView(key)}
              className={`rounded-full px-3.5 py-1.5 transition-colors ${view === key ? "bg-white text-brand shadow-sm" : "text-anthracite/75 hover:text-brand"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="var(--color-anthracite)" strokeOpacity={0.12} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--color-anthracite)", fontSize: 12 }}
            axisLine={{ stroke: "var(--color-anthracite)", strokeOpacity: 0.2 }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            width={36}
            tick={{ fill: "var(--color-anthracite)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip />
          {view === "services" && <Legend wrapperStyle={{ fontSize: 13 }} />}
          {view === "total" && (
            <Line
              type="monotone"
              dataKey="total"
              name="Tous les rendez-vous"
              stroke="var(--color-chart-1)"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
          )}
          {view === "services" && series.map((service, index) => (
            <Line
              key={service.service_id}
              type="monotone"
              dataKey={`s${service.service_id}`}
              name={service.name}
              stroke={SERIES_COLORS[index]}
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

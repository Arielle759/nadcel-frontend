"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ActivityMonth, ActivityTopService } from "@/hooks/useManagerActivity";
import { formatMonthShort } from "@/components/manager/activityFormat";

// Trois séries maximum : au-delà, les courbes deviennent illisibles.
const SERIES_COLORS = ["var(--color-forest)", "var(--color-dark-sage)", "var(--color-champagne)"];

export default function ActivityMonthlyChart({
  months,
  services,
}: {
  months: ActivityMonth[];
  services: ActivityTopService[];
}) {
  const series = services.slice(0, 3);
  const data = months.map((month) => {
    const row: Record<string, number | string> = { label: formatMonthShort(month.month), total: month.total };
    for (const service of series) {
      row[`s${service.service_id}`] = month.by_service[String(service.service_id)] ?? 0;
    }
    return row;
  });

  return (
    <div className="rounded-2xl border border-sage/20 bg-beige p-5 shadow-[0_10px_30px_rgba(45,59,40,0.06)] sm:p-6">
      <p className="font-semibold text-forest">Évolution sur 12 mois</p>
      <p className="mb-4 text-sm text-anthracite/60">
        Prestations réalisées chaque mois. Le dernier mois est en cours.
      </p>
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
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="total"
            name="Toutes prestations"
            stroke="var(--color-anthracite)"
            strokeOpacity={0.45}
            strokeDasharray="4 4"
            strokeWidth={2}
            dot={false}
          />
          {series.map((service, index) => (
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

"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AdminMonth } from "@/hooks/useAdmin";
import { formatMonthLong, formatMonthShort } from "@/components/manager/activityFormat";
import { ui } from "@/lib/ui";

const AXIS_TICK = { fill: "var(--color-anthracite)", fontSize: 12 };

// Deux graphiques séparés plutôt qu'un seul à double axe : les rendez-vous se
// comptent en milliers, les inscriptions en dizaines, et deux échelles sur un
// même graphique se lisent mal.
export default function AdminMonthlyCharts({ months }: { months: AdminMonth[] }) {
  const data = months.map((m) => ({ ...m, label: formatMonthShort(m.month) }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <MonthlyBars
        title="Rendez-vous par mois"
        description="Tous les salons, réservations en ligne et hors ligne."
        data={data}
        dataKey="appointments"
        unit="rendez-vous"
        color="var(--color-forest)"
      />
      <MonthlyBars
        title="Nouvelles clientes par mois"
        description="Comptes créés sur la plateforme."
        data={data}
        dataKey="new_clients"
        unit="inscriptions"
        color="var(--color-champagne)"
      />
    </div>
  );
}

function MonthlyBars({
  title,
  description,
  data,
  dataKey,
  unit,
  color,
}: {
  title: string;
  description: string;
  data: (AdminMonth & { label: string })[];
  dataKey: "appointments" | "new_clients";
  unit: string;
  color: string;
}) {
  return (
    <div className={`${ui.surface} p-5 sm:p-6`}>
      <p className="font-semibold text-forest">{title}</p>
      <p className="mb-4 text-sm text-anthracite/65">{description} Le dernier mois est en cours.</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-anthracite)" strokeOpacity={0.1} vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={8} />
          <YAxis allowDecimals={false} width={44} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "var(--color-sage)", fillOpacity: 0.15 }}
            formatter={(value) => [`${Number(value).toLocaleString("fr-FR")} ${unit}`, ""]}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as (AdminMonth & { label: string }) | undefined;
              if (!row) return "";
              return `${formatMonthLong(row.month)}${row.is_partial ? " (en cours)" : ""}`;
            }}
            separator=""
            contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(45,59,40,0.12)" }}
          />
          <Bar dataKey={dataKey} radius={[6, 6, 0, 0]} maxBarSize={28} isAnimationActive={false}>
            {data.map((row) => (
              <Cell key={row.month} fill={color} fillOpacity={row.is_partial ? 0.4 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

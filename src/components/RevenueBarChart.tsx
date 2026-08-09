import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminStatsRevenue } from "@/hooks/useAdmin";
import { formatCurrency } from "@/lib/currency";

export default function RevenueBarChart({ revenue }: { revenue: AdminStatsRevenue }) {
  return (
    <div className="rounded-2xl border border-sage/20 bg-beige p-5 shadow-[0_10px_30px_rgba(45,59,40,0.06)] sm:p-6">
      <p className="mb-1 font-semibold text-forest">Chiffre d&apos;affaires</p>
      <p className="mb-4 text-sm text-anthracite/60">Suivi des montants générés et encaissés</p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={[
            { name: "Généré", value: revenue.generated },
            { name: "Encaissé", value: revenue.collected },
            { name: "Reste à encaisser", value: revenue.outstanding },
          ]}
          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
        >
          <CartesianGrid stroke="var(--color-anthracite)" strokeOpacity={0.12} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "var(--color-anthracite)", fontSize: 12 }}
            axisLine={{ stroke: "var(--color-anthracite)", strokeOpacity: 0.2 }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value: number) => formatCurrency(value)}
            width={90}
            tick={{ fill: "var(--color-anthracite)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={64}>
            <Cell fill="var(--color-forest)" />
            <Cell fill="var(--color-dark-sage)" />
            <Cell fill="var(--color-champagne)" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

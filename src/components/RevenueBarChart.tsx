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
    <div className="rounded-lg border border-sage/30 bg-beige p-6">
      <p className="mb-4 text-sm font-medium text-anthracite">Chiffre d&apos;affaires</p>
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
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            <Cell fill="var(--color-forest)" />
            <Cell fill="var(--color-dark-sage)" />
            <Cell fill="var(--color-champagne)" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

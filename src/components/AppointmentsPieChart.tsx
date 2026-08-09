import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { AdminStatsAppointments } from "@/hooks/useAdmin";

export default function AppointmentsPieChart({
  appointments,
}: {
  appointments: AdminStatsAppointments;
}) {
  return (
    <div className="rounded-lg border border-sage/30 bg-beige p-6">
      <p className="mb-4 text-sm font-medium text-anthracite">Répartition des rendez-vous</p>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={[
              { name: "Confirmés", value: appointments.confirmed },
              { name: "Terminés", value: appointments.completed },
              { name: "En attente", value: appointments.pending },
              { name: "Annulés", value: appointments.cancelled },
            ]}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            outerRadius={90}
            label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
          >
            <Cell fill="var(--color-dark-sage)" stroke="var(--color-beige)" strokeWidth={2} />
            <Cell fill="var(--color-dark-sage)" stroke="var(--color-beige)" strokeWidth={2} />
            <Cell fill="var(--color-champagne)" stroke="var(--color-beige)" strokeWidth={2} />
            <Cell fill="var(--color-terracotta)" stroke="var(--color-beige)" strokeWidth={2} />
          </Pie>
          <Legend verticalAlign="bottom" height={36} />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

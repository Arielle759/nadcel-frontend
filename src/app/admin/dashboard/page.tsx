"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Banknote, Building2, Calendar, PieChart as PieChartIcon, Users } from "lucide-react";
import { AdminStats, useAdmin } from "@/hooks/useAdmin";
import { formatCurrency } from "@/lib/currency";
import StatCard from "@/components/StatCard";
import SectionTitle from "@/components/SectionTitle";
import AppointmentsPieChart from "@/components/AppointmentsPieChart";
import RevenueBarChart from "@/components/RevenueBarChart";

const ROLE_LABELS: Record<string, string> = {
  client: "Clients",
  gerant: "Gérants",
  admin: "Admins",
  employee: "Employés",
};

function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

export default function AdminDashboardPage() {
  const { getStats } = useAdmin();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getStats()
      .then((data) => {
        if (isMounted) setStats(data);
      })
      .catch(() => {
        if (isMounted) setError("Impossible de charger les statistiques.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [getStats]);

  return (
    <main className="flex flex-1 flex-col gap-4 bg-gradient-to-br from-beige to-sage/20 px-6 py-6 sm:px-16">
      <h1 className="text-3xl font-semibold tracking-tight text-forest">Administration</h1>

      {loading && <p className="text-anthracite/75">Chargement...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {stats && (
        <div className="border-t-4 border-t-champagne pt-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <section className="flex flex-col gap-2">
                <SectionTitle icon={Banknote}>Chiffre d&apos;affaires</SectionTitle>
                <div className="flex flex-col gap-3">
                  <StatCard
                    label="Chiffre d'affaires généré"
                    value={formatCurrency(stats.revenue.generated)}
                    tone="forest"
                    prominent
                    compact
                  />
                  <StatCard
                    label="Encaissé"
                    value={formatCurrency(stats.revenue.collected)}
                    tone="positive"
                    prominent
                    compact
                  />
                  <StatCard
                    label="Reste à encaisser"
                    value={formatCurrency(stats.revenue.outstanding)}
                    tone="warning"
                    prominent
                    compact
                  />
                </div>
              </section>

              <section className="flex flex-col gap-2">
                <SectionTitle icon={Building2}>Salons</SectionTitle>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Total" value={stats.salons.total} compact />
                  <StatCard label="Vérifiés" value={stats.salons.verified} compact />
                  <StatCard label="En attente" value={stats.salons.pending} compact />
                  <StatCard label="Rejetés" value={stats.salons.rejected} tone="negative" compact />
                </div>
              </section>

              <section className="flex flex-col gap-2">
                <SectionTitle icon={Calendar}>Rendez-vous</SectionTitle>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Confirmés" value={stats.appointments.confirmed} tone="positive" compact />
                  <StatCard label="Terminés" value={stats.appointments.completed} tone="positive" compact />
                  <StatCard label="En attente" value={stats.appointments.pending} tone="warning" compact />
                  <StatCard label="Annulés" value={stats.appointments.cancelled} tone="negative" compact />
                </div>
              </section>

              <section className="flex flex-col gap-2">
                <SectionTitle icon={Users}>Utilisateurs</SectionTitle>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {stats.users.by_role.map((entry) => (
                    <StatCard key={entry.role} label={roleLabel(entry.role)} value={entry.count} compact />
                  ))}
                  {stats.users.without_role > 0 && (
                    <StatCard label="Sans rôle" value={stats.users.without_role} compact />
                  )}
                </div>
              </section>
            </div>

            <div className="flex flex-col gap-4">
              <SectionTitle icon={PieChartIcon}>Visualisations</SectionTitle>
              <AppointmentsPieChart appointments={stats.appointments} />
              <RevenueBarChart revenue={stats.revenue} />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Link
          href="/admin/salons"
          className="rounded-full bg-dark-sage px-5 py-2 text-sm font-medium text-beige transition-colors hover:bg-sage"
        >
          Salons en attente
        </Link>
        <Link
          href="/admin/reviews"
          className="rounded-full border border-dark-sage px-5 py-2 text-sm font-medium text-link-sage transition-colors hover:bg-sage/10"
        >
          Modérer les avis
        </Link>
      </div>
    </main>
  );
}

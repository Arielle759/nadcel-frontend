"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Banknote, Building2, Calendar, MessageSquare, PieChart as PieChartIcon, ShieldCheck, Users } from "lucide-react";
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
    <main className="flex flex-1 flex-col gap-8 bg-gradient-to-br from-beige via-beige to-sage/20 px-6 py-10 sm:px-10 lg:px-14">
      <div className="relative overflow-hidden rounded-3xl bg-forest px-6 py-8 text-beige shadow-[0_18px_50px_rgba(45,59,40,0.18)] sm:px-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-sage/20 blur-2xl" />
        <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-champagne/15 blur-2xl" />
        <div className="relative max-w-2xl">
          <span className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-champagne">
            <ShieldCheck size={16} aria-hidden="true" />
            Centre de contrôle
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-beige sm:text-4xl">Administration</h1>
          <p className="mt-3 text-sm leading-6 text-beige/75 sm:text-base">
            Supervisez l&apos;activité de la plateforme et accédez aux actions prioritaires.
          </p>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Chargement du tableau de bord" aria-busy="true">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl border border-sage/20 bg-sage/10" />
          ))}
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {stats && (
        <div>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/salons"
          className="group flex items-center justify-between rounded-2xl border border-sage/20 bg-beige p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-md"
        >
          <span className="flex items-center gap-3 font-semibold text-forest">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-champagne/15 text-champagne"><Building2 size={19} /></span>
            Salons en attente
          </span>
          <ArrowUpRight size={18} className="text-link-sage transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
        <Link
          href="/admin/reviews"
          className="group flex items-center justify-between rounded-2xl border border-sage/20 bg-beige p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-md"
        >
          <span className="flex items-center gap-3 font-semibold text-forest">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/15 text-link-sage"><MessageSquare size={19} /></span>
            Modérer les avis
          </span>
          <ArrowUpRight size={18} className="text-link-sage transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </main>
  );
}

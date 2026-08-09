"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Banknote, Building2, Calendar, PieChart as PieChartIcon, Sparkles } from "lucide-react";
import { useManager, ManagerStats } from "@/hooks/useManager";
import { formatCurrency } from "@/lib/currency";
import StatCard from "@/components/StatCard";
import SectionTitle from "@/components/SectionTitle";
import AppointmentsPieChart from "@/components/AppointmentsPieChart";
import RevenueBarChart from "@/components/RevenueBarChart";

function NewSalonBanner() {
  const searchParams = useSearchParams();
  const newSalonId = searchParams.get("newSalon");

  if (!newSalonId) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dark-sage/25 bg-gradient-to-r from-sage/15 to-beige p-5 shadow-sm sm:p-6">
      <p className="font-medium text-forest">
        Votre salon a bien été créé et est en attente de validation par l&apos;équipe NADCEL.
      </p>
      <p className="text-sm text-anthracite/75">
        En attendant, complétez votre profil : ajoutez vos services, vos employés et vos
        horaires depuis la fiche de votre salon.
      </p>
      <Link
        href={`/manager/salons/${newSalonId}/services`}
        className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-dark-sage px-4 py-2 text-sm font-semibold text-beige transition-colors hover:bg-forest"
      >
        Ajouter mes services
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function ManagerDashboardPage() {
  const { getSalonStats } = useManager();
  const [stats, setStats] = useState<ManagerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getSalonStats()
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
  }, [getSalonStats]);

  return (
    <main className="flex flex-1 flex-col gap-8 bg-gradient-to-br from-beige via-beige to-sage/20 px-6 py-10 sm:px-10 lg:px-14">
      <div className="relative overflow-hidden rounded-3xl bg-forest px-6 py-8 text-beige shadow-[0_18px_50px_rgba(45,59,40,0.18)] sm:px-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-sage/20 blur-2xl" />
        <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-champagne/15 blur-2xl" />
        <div className="relative max-w-2xl">
          <span className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-champagne">
            <Sparkles size={16} aria-hidden="true" />
            Vue d&apos;ensemble
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-beige sm:text-4xl">
            Tableau de bord
          </h1>
          <p className="mt-3 text-sm leading-6 text-beige/75 sm:text-base">
            Suivez l&apos;activité de vos salons et accédez rapidement à vos actions essentielles.
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <NewSalonBanner />
      </Suspense>

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Chargement du tableau de bord" aria-busy="true">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-2xl border border-sage/20 bg-sage/10" />
          ))}
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {stats && (
        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-4">
            <SectionTitle icon={Banknote}>Chiffre d&apos;affaires</SectionTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="Chiffre d'affaires généré"
                value={formatCurrency(stats.revenue.generated)}
                tone="forest"
                prominent
              />
              <StatCard
                label="Encaissé"
                value={formatCurrency(stats.revenue.collected)}
                tone="positive"
                prominent
              />
              <StatCard
                label="Reste à encaisser"
                value={formatCurrency(stats.revenue.outstanding)}
                tone="warning"
                prominent
              />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <SectionTitle icon={Building2}>Salons</SectionTitle>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Mes salons" value={stats.salons_count} />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <SectionTitle icon={Calendar}>Rendez-vous</SectionTitle>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Confirmés" value={stats.appointments.confirmed} tone="positive" />
              <StatCard label="Terminés" value={stats.appointments.completed} tone="positive" />
              <StatCard label="En attente" value={stats.appointments.pending} tone="warning" />
              <StatCard label="Annulés" value={stats.appointments.cancelled} tone="negative" />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <SectionTitle icon={PieChartIcon}>Visualisations</SectionTitle>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <AppointmentsPieChart appointments={stats.appointments} />
              <RevenueBarChart revenue={stats.revenue} />
            </div>
          </section>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/manager/salons"
          className="group flex items-center justify-between rounded-2xl border border-sage/20 bg-beige p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-md"
        >
          <span className="flex items-center gap-3 font-semibold text-forest">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/15 text-link-sage"><Building2 size={19} /></span>
            Gérer mes salons
          </span>
          <ArrowUpRight size={18} className="text-link-sage transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
        <Link
          href="/manager/appointments"
          className="group flex items-center justify-between rounded-2xl border border-sage/20 bg-beige p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-md"
        >
          <span className="flex items-center gap-3 font-semibold text-forest">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-champagne/15 text-champagne"><Calendar size={19} /></span>
            Gérer les rendez-vous
          </span>
          <ArrowUpRight size={18} className="text-link-sage transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </main>
  );
}

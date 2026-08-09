"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Banknote, Building2, Calendar, PieChart as PieChartIcon } from "lucide-react";
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
    <div className="flex flex-col gap-2 rounded-lg border border-dark-sage/40 bg-sage/10 p-4">
      <p className="font-medium text-forest">
        Votre salon a bien été créé et est en attente de validation par l&apos;équipe NADCEL.
      </p>
      <p className="text-sm text-anthracite/75">
        En attendant, complétez votre profil : ajoutez vos services, vos employés et vos
        horaires depuis la fiche de votre salon.
      </p>
      <Link
        href={`/manager/salons/${newSalonId}/services`}
        className="mt-1 inline-flex w-fit items-center rounded-full bg-dark-sage px-4 py-2 text-sm font-medium text-beige transition-colors hover:bg-sage"
      >
        Ajouter mes services
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
    <main className="flex flex-1 flex-col gap-8 bg-gradient-to-br from-beige to-sage/20 px-6 py-12 sm:px-16">
      <h1 className="text-3xl font-semibold tracking-tight text-forest">Tableau de bord</h1>

      <Suspense fallback={null}>
        <NewSalonBanner />
      </Suspense>

      {loading && <p className="text-anthracite/75">Chargement...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {stats && (
        <div className="flex flex-col gap-8 border-t-4 border-t-champagne pt-6">
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

      <div className="flex gap-4">
        <Link
          href="/manager/salons"
          className="rounded-full bg-dark-sage px-5 py-2 text-sm font-medium text-beige transition-colors hover:bg-sage"
        >
          Gérer mes salons
        </Link>
        <Link
          href="/manager/appointments"
          className="rounded-full border border-dark-sage px-5 py-2 text-sm font-medium text-link-sage transition-colors hover:bg-sage/10"
        >
          Gérer les rendez-vous
        </Link>
      </div>
    </main>
  );
}

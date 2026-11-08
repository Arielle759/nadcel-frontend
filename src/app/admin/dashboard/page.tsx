"use client";

import Link from "next/link";
import CountUp from "@/components/motion/CountUp";
import { useCallback, useEffect, useState } from "react";
import { AdminSalon, AdminStats, useAdmin } from "@/hooks/useAdmin";
import ManagerPage from "@/components/manager/ManagerPage";
import PartnerRequestCard from "@/components/admin/PartnerRequestCard";
import AdminMonthlyCharts from "@/components/admin/AdminMonthlyCharts";
import BookingChannels from "@/components/admin/BookingChannels";
import { formatTrend } from "@/components/manager/activityFormat";
import { ui } from "@/lib/ui";
import DashboardBanner from "@/components/DashboardBanner";
import { useCurrentUser } from "@/hooks/useAuthState";

const PREVIEW_REQUESTS = 3;

function percent(value: number | null): string {
  return value === null ? "—" : `${value.toLocaleString("fr-FR")} %`;
}

function bannerSummary(stats: AdminStats | null): string {
  if (!stats) return "Ce qui attend une décision, puis la santé de la plateforme.";
  const pending = stats.to_review.pending_salons;
  const online = `${stats.salons.online} salon${stats.salons.online > 1 ? "s" : ""} en ligne`;
  if (pending === 0) return `Rien à traiter. ${online}.`;
  return `${pending} demande${pending > 1 ? "s" : ""} de partenariat à examiner, ${online}.`;
}

export default function AdminDashboardPage() {
  const { getStats, getPendingSalons, changeSalonState } = useAdmin();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [requests, setRequests] = useState<AdminSalon[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const user = useCurrentUser();
  const firstName = user?.name?.trim().split(/\s+/)[0];

  const load = useCallback(async () => {
    try {
      const [statsData, pending] = await Promise.all([getStats(), getPendingSalons()]);
      setStats(statsData);
      setRequests(pending);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger le tableau de bord.");
    }
  }, [getStats, getPendingSalons]);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  async function decide(salon: AdminSalon, action: "verify" | "reject") {
    await changeSalonState(salon.id, action);
    // Recharge tout : les compteurs (salons en ligne, à traiter) changent aussi.
    await load();
  }

  return (
    <ManagerPage
      title="Tableau de bord"
      hero={
        <DashboardBanner
          eyebrow="Administration Nadcel"
          title={firstName ? `Bonjour ${firstName},` : "Tableau de bord"}
          summary={bannerSummary(stats)}
          image="/images/services/soin.jpg"
          actions={
            <>
              <Link href="/admin/salons" className={ui.buttonOnDark}>
                {stats && stats.to_review.pending_salons > 0 ? "Examiner les demandes" : "Demandes"}
              </Link>
              <Link href="/admin/salons/all" className={ui.buttonGhostOnDark}>
                Tous les salons
              </Link>
            </>
          }
        />
      }
    >
      {error && (
        <p role="alert" className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {!stats || !requests ? (
        !error && (
          <div className="flex flex-col gap-4" aria-busy="true" aria-label="Chargement du tableau de bord">
            <div className="h-40 animate-pulse rounded-2xl bg-sable/15" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-sable/15" />
              ))}
            </div>
            <div className="h-72 animate-pulse rounded-2xl bg-sable/15" />
          </div>
        )
      ) : (
        <div className="flex flex-col gap-10">
          <ToReview stats={stats} requests={requests} onDecide={decide} />

          <section aria-labelledby="health-title" className="flex flex-col gap-4">
            <h2 id="health-title" className="text-2xl font-semibold tracking-tight text-brand">
              Santé de la plateforme
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Kpi
                label="Salons en ligne"
                value={<CountUp value={stats.salons.online} />}
                hint={stats.salons.suspended > 0 ? `${stats.salons.suspended} suspendu${stats.salons.suspended > 1 ? "s" : ""}` : "Aucun suspendu"}
                href="/admin/salons/all"
                highlight
              />
              <Kpi
                label="Clientes inscrites"
                value={<CountUp value={stats.users.clients} />}
                hint={`${stats.users.new_clients} ce mois-ci`}
              />
              <Kpi
                label="Rendez-vous ce mois-ci"
                value={<CountUp value={stats.appointments.this_month} />}
                hint={<Trend value={stats.appointments.trend} />}
              />
              <Kpi
                label="Taux d'annulation"
                value={
                  stats.appointments.cancellation_rate === null ? (
                    percent(null)
                  ) : (
                    <CountUp
                      value={stats.appointments.cancellation_rate}
                      format={(n) => `${n.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`}
                    />
                  )
                }
                hint="Sur les 30 derniers jours"
              />
            </div>
            <BookingChannels appointments={stats.appointments} />
          </section>

          <section aria-labelledby="evolution-title" className="flex flex-col gap-4">
            <h2 id="evolution-title" className="text-2xl font-semibold tracking-tight text-brand">
              Évolution sur 12 mois
            </h2>
            <AdminMonthlyCharts months={stats.monthly} />
          </section>
        </div>
      )}
    </ManagerPage>
  );
}

function ToReview({
  stats,
  requests,
  onDecide,
}: {
  stats: AdminStats;
  requests: AdminSalon[];
  onDecide: (salon: AdminSalon, action: "verify" | "reject") => Promise<void>;
}) {
  const pending = stats.to_review.pending_salons;
  const lowReviews = stats.to_review.low_reviews;

  if (pending === 0 && lowReviews === 0) {
    return (
      <section className={`${ui.surface} p-5 sm:p-6`}>
        <h2 className="text-lg font-semibold text-anthracite">Rien à traiter</h2>
        <p className="mt-1 text-sm text-anthracite/70">
          Aucune demande de partenariat en attente et aucun avis négatif ces 30 derniers jours.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="review-title" className={`${ui.surface} p-5 sm:p-6`}>
      <h2 id="review-title" className="text-2xl font-semibold tracking-tight text-brand">
        À traiter
      </h2>

      {pending > 0 && (
        <div className="mt-5">
          <p className="font-semibold text-anthracite">
            {pending} demande{pending > 1 ? "s" : ""} de partenariat
          </p>
          <p className="mt-0.5 text-sm text-anthracite/65">Les plus anciennes d&apos;abord. Délai annoncé aux gérants : 48 h ouvrées.</p>
          <ul className="mt-3 flex flex-col gap-2">
            {requests.slice(0, PREVIEW_REQUESTS).map((salon) => (
              <PartnerRequestCard
                key={salon.id}
                compact
                salon={salon}
                onValidate={() => onDecide(salon, "verify")}
                onReject={() => onDecide(salon, "reject")}
              />
            ))}
          </ul>
          <Link href="/admin/salons" className={`${ui.textLink} mt-3 inline-block text-sm`}>
            {pending > PREVIEW_REQUESTS ? `Voir les ${pending} demandes en détail` : "Voir le détail des demandes"}
          </Link>
        </div>
      )}

      {lowReviews > 0 && (
        <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl bg-beige px-4 py-4 ${pending > 0 ? "mt-6" : "mt-5"}`}>
          <div>
            <p className="font-semibold text-anthracite">
              {lowReviews} avis noté{lowReviews > 1 ? "s" : ""} 1 ou 2 sur 5
            </p>
            <p className="text-sm text-anthracite/65">
              Publiés ces 30 derniers jours. Des plaintes répétées sur un même salon peuvent justifier sa suspension.
            </p>
          </div>
          <Link href="/admin/reviews?filtre=negatifs" className={ui.buttonSecondary}>
            Consulter ces avis
          </Link>
        </div>
      )}
    </section>
  );
}

function Kpi({
  label,
  value,
  hint,
  href,
  highlight = false,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  href?: string;
  // La carte mise en avant, sur fond chocolat.
  highlight?: boolean;
}) {
  const body = (
    <>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${highlight ? "text-beige/65" : "text-anthracite/55"}`}>
        {label}
      </p>
      <p className={`mt-3 text-3xl font-semibold tabular-nums tracking-tight ${highlight ? "text-beige" : "text-brand"}`}>
        {value}
      </p>
      <p className={`mt-2 min-h-4 text-xs ${highlight ? "text-beige/70" : "text-anthracite/60"}`}>{hint}</p>
    </>
  );
  const card = highlight
    ? "rounded-2xl bg-brand shadow-[0_6px_16px_rgba(59,42,36,0.18),0_18px_40px_rgba(74,51,40,0.22)] transition-all duration-200 hover:-translate-y-0.5"
    : ui.surfaceInteractive;
  return href ? (
    <Link href={href} className={`${card} block p-6`}>
      {body}
    </Link>
  ) : (
    <div className={`${ui.surface} p-6`}>{body}</div>
  );
}

function Trend({ value }: { value: number | null }) {
  const label = formatTrend(value);
  if (label === null) return <>Pas de comparaison possible</>;
  return (
    <span title="Du 1er à aujourd'hui, comparé à la même période du mois dernier">
      <span className={`font-semibold ${value! >= 0 ? "text-success" : "text-alert"}`}>{label}</span> sur un mois
    </span>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminSalon, AdminStats, useAdmin } from "@/hooks/useAdmin";
import ManagerPage from "@/components/manager/ManagerPage";
import PartnerRequestCard from "@/components/admin/PartnerRequestCard";
import AdminMonthlyCharts from "@/components/admin/AdminMonthlyCharts";
import { formatTrend } from "@/components/manager/activityFormat";
import { ui } from "@/lib/ui";

const PREVIEW_REQUESTS = 3;

function percent(value: number | null): string {
  return value === null ? "—" : `${value.toLocaleString("fr-FR")} %`;
}

export default function AdminDashboardPage() {
  const { getStats, getPendingSalons, changeSalonState } = useAdmin();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [requests, setRequests] = useState<AdminSalon[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <ManagerPage title="Tableau de bord" description="Ce qui attend une décision, puis la santé de la plateforme.">
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
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Kpi
                label="Salons en ligne"
                value={stats.salons.online}
                hint={stats.salons.suspended > 0 ? `${stats.salons.suspended} suspendu${stats.salons.suspended > 1 ? "s" : ""}` : "Aucun suspendu"}
                href="/admin/salons/all"
              />
              <Kpi
                label="Clientes inscrites"
                value={stats.users.clients.toLocaleString("fr-FR")}
                hint={`${stats.users.new_clients} ce mois-ci`}
              />
              <Kpi
                label="Rendez-vous ce mois-ci"
                value={stats.appointments.this_month.toLocaleString("fr-FR")}
                hint={<Trend value={stats.appointments.trend} />}
              />
              <Kpi
                label="Taux d'annulation"
                value={percent(stats.appointments.cancellation_rate)}
                hint="Sur les 30 derniers jours"
              />
            </div>
            <BookingChannels share={stats.appointments.online_share} />
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
        <h2 className="font-semibold text-brand">Rien à traiter</h2>
        <p className="mt-1 text-sm text-anthracite/70">
          Aucune demande de partenariat en attente et aucun avis négatif récent.
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
            <p className="text-sm text-anthracite/65">Publiés ces 30 derniers jours. À relire en cas de contenu abusif.</p>
          </div>
          <Link href="/admin/reviews?filtre=negatifs" className={ui.buttonSecondary}>
            Relire ces avis
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
}: {
  label: string;
  value: number | string;
  hint?: React.ReactNode;
  href?: string;
}) {
  const body = (
    <>
      <p className="text-sm font-medium text-anthracite/75">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-brand">{value}</p>
      <p className="mt-1 min-h-4 text-xs text-anthracite/60">{hint}</p>
    </>
  );
  return href ? (
    <Link href={href} className={`${ui.surfaceInteractive} block p-5`}>
      {body}
    </Link>
  ) : (
    <div className={`${ui.surface} p-5`}>{body}</div>
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

// Part des rendez-vous pris en ligne : l'indicateur d'adoption de la plateforme.
function BookingChannels({ share }: { share: number | null }) {
  if (share === null) return null;
  const offline = Math.round((100 - share) * 10) / 10;
  return (
    <div className={`${ui.surface} p-5 sm:p-6`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-brand">Canaux de réservation</p>
        <p className="text-sm text-anthracite/65">30 derniers jours</p>
      </div>
      <div
        className="mt-4 flex h-3 overflow-hidden rounded-full bg-champagne-light/40"
        role="img"
        aria-label={`${percent(share)} en ligne, ${percent(offline)} hors ligne`}
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${share}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
        <p>
          <span className="font-semibold text-brand">{percent(share)}</span>{" "}
          <span className="text-anthracite/75">réservés en ligne sur Nadcel</span>
        </p>
        <p>
          <span className="font-semibold text-champagne">{percent(offline)}</span>{" "}
          <span className="text-anthracite/75">saisis par les salons (WhatsApp, téléphone, sur place)</span>
        </p>
      </div>
    </div>
  );
}

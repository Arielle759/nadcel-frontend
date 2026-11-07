"use client";

import Link from "next/link";
import CountUp from "@/components/motion/CountUp";
import TopClients from "@/components/manager/TopClients";
import { useState } from "react";

import {
  useManagerActivity,
  type ActivityBusySlot,
  type ActivityPeriod,
  type DayPart,
  type ManagerActivity,
} from "@/hooks/useManagerActivity";
import { BOOKING_SOURCE_LABELS } from "@/lib/bookingSources";
import { formatCurrency } from "@/lib/currency";
import ActivityMonthlyChart from "@/components/manager/ActivityMonthlyChart";
import { DAY_LABELS, DAY_SHORT, PART_LABELS, formatMonthLong, formatTrend } from "@/components/manager/activityFormat";

const METHOD_LABELS: Record<string, string> = {
  especes: "Espèces",
  wave: "Wave",
  orange_money: "Orange Money",
};

const PERIODS: { key: ActivityPeriod; label: string }[] = [
  { key: "month", label: "30 derniers jours" },
  { key: "quarter", label: "3 derniers mois" },
  { key: "year", label: "12 derniers mois" },
];

const PARTS: DayPart[] = ["matin", "apres_midi", "soir"];

const CARD = "rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(90,50,35,0.05),0_8px_24px_rgba(90,50,35,0.07)] sm:p-6";
// Petit libellé en capitales au-dessus des chiffres.
const LABEL = "text-[11px] font-semibold uppercase tracking-[0.08em] text-anthracite/55";

export default function ActivitySection({
  upcoming,
  toClose,
}: {
  upcoming: number | null;
  toClose: number | null;
}) {
  const [period, setPeriod] = useState<ActivityPeriod>("month");
  const { data, loading, error } = useManagerActivity(period);

  return (
    <section className="flex flex-col gap-4" aria-busy={loading}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-anthracite">Activité du salon</h2>
        <div role="group" aria-label="Période analysée" className="flex rounded-full bg-white p-1 shadow-[0_1px_2px_rgba(90,50,35,0.05),0_8px_24px_rgba(90,50,35,0.07)]">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setPeriod(key)}
              aria-pressed={period === key}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                period === key ? "bg-brand text-beige" : "text-anthracite/70 hover:bg-sable/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <KpiRow data={data} upcoming={upcoming} toClose={toClose} />

      {!data && loading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Chargement de l'activité">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-56 animate-pulse rounded-2xl bg-sable/15" />
          ))}
        </div>
      )}

      {data && data.totals.completed === 0 && data.monthly.every((m) => m.total === 0) ? (
        <div className={`${CARD} text-center`}>
          <p className="font-semibold text-brand">Pas encore d&apos;activité à analyser</p>
          <p className="mt-1 text-sm text-anthracite/65">
            Les statistiques apparaîtront dès que vos premiers rendez-vous seront marqués comme terminés.
          </p>
        </div>
      ) : (
        data && (
          <div className={`flex flex-col gap-4 transition-opacity ${loading ? "opacity-60" : ""}`}>
            <Insights data={data} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TopServices data={data} />
              <Forecast data={data} />
            </div>
            <TopClients clients={data.top_clients ?? []} period={period} />
            <ActivityMonthlyChart months={data.monthly} services={data.top_services} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <BusySlots slots={data.busy_slots} />
              <div className="flex flex-col gap-4">
                <Employees data={data} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <Loyalty data={data} />
                  <PaymentMethods data={data} />
                  <BookingSources data={data} />
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </section>
  );
}

// Quatre indicateurs compacts en tête : l'essentiel tient sur une seule ligne.
function KpiRow({
  data,
  upcoming,
  toClose,
}: {
  data: ManagerActivity | null;
  upcoming: number | null;
  toClose: number | null;
}) {
  const placeholder = "—";
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Kpi
        label="Prestations réalisées"
        value={data ? <CountUp value={data.totals.completed} /> : placeholder}
        trend={data ? <TrendBadge trend={data.totals.trend} /> : null}
      />
      <Kpi
        label="Chiffre d'affaires encaissé"
        value={data ? <CountUp value={data.totals.revenue} format={formatCurrency} /> : placeholder}
        hint="Payé sur place, noté à la clôture"
        tone="highlight"
      />
      <Kpi label="Rendez-vous à venir" value={upcoming !== null ? <CountUp value={upcoming} /> : placeholder} />
      <Kpi
        label="À clôturer"
        value={toClose !== null ? <CountUp value={toClose} /> : placeholder}
        tone={toClose ? "warning" : "neutral"}
        hint={toClose ? "Rendez-vous passés sans paiement noté" : "Tout est à jour"}
        href={toClose ? "/manager/appointments" : undefined}
      />
    </div>
  );
}

function Kpi({
  label,
  value,
  trend = null,
  hint,
  tone = "neutral",
  href,
}: {
  label: string;
  value: React.ReactNode;
  trend?: React.ReactNode;
  hint?: string;
  // highlight : la carte mise en avant, sur fond chocolat.
  tone?: "neutral" | "warning" | "highlight";
  href?: string;
}) {
  const highlight = tone === "highlight";
  const body = (
    <>
      <p className={highlight ? `${LABEL} text-beige/65` : LABEL}>{label}</p>
      <p
        className={`mt-3 text-3xl font-semibold tabular-nums tracking-tight ${
          highlight ? "text-beige" : tone === "warning" ? "text-alert" : "text-brand"
        }`}
      >
        {value}
      </p>
      <div className={`mt-2 flex min-h-4 items-center gap-2 text-xs ${highlight ? "text-beige/70" : "text-anthracite/55"}`}>
        {trend}
        {hint && <span>{hint}</span>}
      </div>
    </>
  );
  const className = `rounded-2xl p-6 ${
    highlight
      ? "bg-brand shadow-[0_6px_16px_rgba(59,42,36,0.18),0_18px_40px_rgba(74,51,40,0.22)]"
      : "bg-white shadow-[0_1px_2px_rgba(90,50,35,0.05),0_8px_24px_rgba(90,50,35,0.07)]"
  } ${href ? "transition-all hover:-translate-y-0.5 hover:shadow-[0_2px_6px_rgba(90,50,35,0.06),0_16px_36px_rgba(90,50,35,0.12)]" : ""}`;

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

function PaymentMethods({ data }: { data: ManagerActivity }) {
  const used = data.payment_methods.filter((m) => m.count > 0);
  return (
    <div className={CARD}>
      <p className={`${LABEL} mb-3`}>Encaissements</p>
      {used.length === 0 ? (
        <p className="text-sm text-anthracite/60">Aucun paiement noté à la clôture sur cette période.</p>
      ) : (
        <dl className="text-sm">
          {used.map((m) => (
            <div key={m.method} className="flex items-baseline justify-between gap-2 py-1.5">
              <dt className="text-anthracite/60">
                {METHOD_LABELS[m.method] ?? m.method}, {m.share.toLocaleString("fr-FR")} %
              </dt>
              <dd className="font-medium tabular-nums text-anthracite">{formatCurrency(m.amount)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function BookingSources({ data }: { data: ManagerActivity }) {
  const sources = data.sources ?? [];
  if (sources.length === 0) return null;
  return (
    <div className={CARD}>
      <p className={`${LABEL} mb-3`}>Canaux de réservation</p>
      <dl className="text-sm">
        {sources.map((s) => (
          <div key={s.source} className="flex items-baseline justify-between gap-2 py-1.5">
            <dt className="text-anthracite/60">
              {BOOKING_SOURCE_LABELS[s.source]}, {s.share.toLocaleString("fr-FR")} %
            </dt>
            <dd className="font-medium tabular-nums text-anthracite">{s.count}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function TrendBadge({ trend }: { trend: number | null }) {
  const label = formatTrend(trend);
  if (label === null) {
    return <span className="text-xs text-anthracite/50">Nouveau</span>;
  }
  const up = trend! >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-success" : "text-alert"}`}
      title="Par rapport à la période précédente de même durée"
    >
      {label}
    </span>
  );
}

function TopServices({ data }: { data: ManagerActivity }) {
  return (
    <div className={CARD}>
      <p className="text-base font-semibold text-anthracite">Prestations préférées des clients</p>
      <p className="mb-4 text-sm text-anthracite/60">
        {data.totals.completed} prestation{data.totals.completed > 1 ? "s" : ""} réalisée{data.totals.completed > 1 ? "s" : ""}, soit{" "}
        {formatCurrency(data.totals.revenue)}
      </p>
      {data.top_services.length === 0 ? (
        <p className="text-sm text-anthracite/60">Aucune prestation réalisée sur cette période.</p>
      ) : (
        <ol className="flex flex-col gap-5">
          {data.top_services.map((service, index) => (
            <li key={service.service_id} className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-beige font-heading text-lg font-semibold text-accent"
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-anthracite">{service.name}</p>
                <p className="mt-0.5 text-xs text-anthracite/55">
                  {service.count} fois, {service.share.toLocaleString("fr-FR")} % des prestations,{" "}
                  {formatCurrency(service.revenue)}
                </p>
              </div>
              <TrendBadge trend={service.trend} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Forecast({ data }: { data: ManagerActivity }) {
  const { forecast } = data;
  const month = formatMonthLong(forecast.month);

  return (
    <div className={`${CARD} flex flex-col gap-3`}>
      <p className={LABEL}>Prévision pour {month}</p>
      {forecast.expected === null ? (
        <p className="text-sm text-anthracite/65">
          Il faut au moins 3 mois d&apos;activité pour établir une prévision fiable ({forecast.months_of_history} mois disponible
          {forecast.months_of_history > 1 ? "s" : ""} pour l&apos;instant).
        </p>
      ) : (
        <>
          <p className="text-4xl font-semibold tracking-tight text-brand">
            ≈ {forecast.expected}
            <span className="ml-2 text-base font-medium text-anthracite/60">prestations attendues</span>
          </p>
          <p className="text-sm text-anthracite/65">
            {forecast.method === "seasonal"
              ? "Calcul : même mois l'an dernier, ajusté selon la tendance des 3 derniers mois."
              : "Calcul : moyenne des 3 derniers mois complets."}{" "}
            Estimation indicative, à confronter à votre connaissance du salon.
          </p>
          {forecast.peak_month && (
            <p className="rounded-xl bg-sable/10 px-3 py-2 text-sm text-anthracite/75">
              Mois le plus chargé de l&apos;année écoulée : <strong>{formatMonthLong(forecast.peak_month.month)}</strong> (
              {forecast.peak_month.total} prestations).
            </p>
          )}
        </>
      )}
    </div>
  );
}

function BusySlots({ slots }: { slots: ActivityBusySlot[] }) {
  const max = Math.max(1, ...slots.map((slot) => slot.count));
  const countOf = (day: number, part: DayPart) => slots.find((s) => s.day === day && s.part === part)?.count ?? 0;

  return (
    <div className={CARD}>
      <p className="text-base font-semibold text-anthracite">Jours et moments les plus chargés</p>
      <p className="mb-4 text-sm text-anthracite/60">Plus la case est foncée, plus il y a eu de prestations.</p>
      <table className="w-full table-fixed border-separate border-spacing-1 text-center text-xs">
        <caption className="sr-only">Nombre de prestations par jour de la semaine et moment de la journée</caption>
        <thead>
          <tr>
            <th scope="col" className="w-24" />
            {DAY_SHORT.map((day) => (
              <th key={day} scope="col" className="font-semibold text-anthracite/60">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PARTS.map((part) => (
            <tr key={part}>
              <th scope="row" className="pr-1 text-left font-semibold capitalize text-anthracite/60">
                {PART_LABELS[part]}
              </th>
              {DAY_SHORT.map((_, index) => {
                const count = countOf(index + 1, part);
                const intensity = count / max;
                return (
                  <td
                    key={index}
                    className={`h-10 rounded-lg font-semibold ${intensity > 0.55 ? "text-beige" : "text-brand"}`}
                    style={{
                      backgroundColor:
                        count === 0 ? "rgba(220, 198, 180, 0.22)" : `rgba(74, 51, 40, ${0.15 + intensity * 0.85})`,
                    }}
                    title={`${DAY_LABELS[index]} ${PART_LABELS[part]} : ${count} prestation${count > 1 ? "s" : ""}`}
                  >
                    {count > 0 ? count : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-anthracite/50">Matin : avant 12 h. Après-midi : de 12 h à 17 h. Soir : après 17 h.</p>
    </div>
  );
}

function Employees({ data }: { data: ManagerActivity }) {
  return (
    <div className={CARD}>
      <p className={`${LABEL} mb-3`}>Activité par employé</p>
      {data.employees.length === 0 ? (
        <p className="text-sm text-anthracite/60">Aucune prestation attribuée sur cette période.</p>
      ) : (
        <dl className="text-sm">
          {data.employees.map((employee) => (
            <div key={employee.employee_id} className="flex items-baseline justify-between gap-3 py-1.5">
              <dt className="text-anthracite/60">
                {employee.name}, {employee.count} prestation{employee.count > 1 ? "s" : ""}
              </dt>
              <dd className="font-medium tabular-nums text-anthracite">{formatCurrency(employee.revenue)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function Loyalty({ data }: { data: ManagerActivity }) {
  const { loyalty } = data;
  return (
    <div className={CARD}>
      <p className={LABEL}>Fidélité des clients</p>
      <p className="mt-3 text-5xl font-light tabular-nums tracking-tight text-brand">
        {loyalty.rate.toLocaleString("fr-FR")}
        <span className="ml-1 text-2xl">%</span>
      </p>
      <p className="mt-2 text-sm text-anthracite/65">
        {loyalty.returning} client{loyalty.returning > 1 ? "s" : ""} sur {loyalty.clients} {loyalty.returning > 1 ? "sont venus" : "est venu"} au
        moins deux fois sur la période.
      </p>
    </div>
  );
}

// Constats rédigés à partir des chiffres, pour que le gérant n'ait pas à les déduire lui-même.
function Insights({ data }: { data: ManagerActivity }) {
  const insights: string[] = [];

  const busiest = [...data.busy_slots].sort((a, b) => b.count - a.count)[0];
  if (busiest && busiest.count >= 3) {
    insights.push(
      `Votre moment le plus chargé est le ${DAY_LABELS[busiest.day - 1]} ${PART_LABELS[busiest.part]} (${busiest.count} prestations) : prévoyez assez de personnel sur ce créneau.`
    );
  }

  const rising = data.top_services.find((s) => s.trend !== null && s.trend >= 20 && s.count >= 3);
  if (rising) {
    insights.push(`La demande de « ${rising.name} » progresse de ${formatTrend(rising.trend)} par rapport à la période précédente.`);
  }

  const falling = data.top_services.find((s) => s.trend !== null && s.trend <= -20 && s.previous_count >= 3);
  if (falling) {
    insights.push(`« ${falling.name} » recule de ${formatTrend(falling.trend)} : une offre ou une mise en avant pourrait relancer la demande.`);
  }

  if (data.forecast.expected !== null && data.forecast.peak_month) {
    const peakMonthNumber = data.forecast.peak_month.month.slice(5);
    if (peakMonthNumber === data.forecast.month.slice(5)) {
      insights.push("Le mois prochain correspond à votre période la plus chargée de l'an dernier : anticipez les horaires et le stock.");
    }
  }

  if (insights.length === 0) return null;

  return (
    <div className={CARD}>
      <p className={LABEL}>À retenir</p>
      <ul className="mt-2 flex flex-col gap-2 text-sm leading-6 text-anthracite/80">
        {insights.map((insight) => (
          <li key={insight}>{insight}</li>
        ))}
      </ul>
    </div>
  );
}

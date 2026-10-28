"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  CalendarClock,
  Lightbulb,
  Scissors,
  TrendingDown,
  TrendingUp,
  UserRoundCheck,
  Users,
  Wallet,
} from "lucide-react";
import {
  useManagerActivity,
  type ActivityBusySlot,
  type ActivityPeriod,
  type DayPart,
  type ManagerActivity,
} from "@/hooks/useManagerActivity";
import { formatCurrency } from "@/lib/currency";
import SectionTitle from "@/components/SectionTitle";
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

const CARD = "rounded-2xl border border-sage/20 bg-beige p-5 shadow-[0_10px_30px_rgba(45,59,40,0.06)] sm:p-6";

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
        <SectionTitle icon={Activity}>Activité du salon</SectionTitle>
        <div role="group" aria-label="Période analysée" className="flex rounded-full border border-sage/30 bg-beige p-1">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setPeriod(key)}
              aria-pressed={period === key}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                period === key ? "bg-forest text-beige" : "text-anthracite/70 hover:bg-sage/10"
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
            <div key={item} className="h-56 animate-pulse rounded-2xl border border-sage/20 bg-sage/10" />
          ))}
        </div>
      )}

      {data && data.totals.completed === 0 && data.monthly.every((m) => m.total === 0) ? (
        <div className={`${CARD} text-center`}>
          <p className="font-semibold text-forest">Pas encore d&apos;activité à analyser</p>
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
            <ActivityMonthlyChart months={data.monthly} services={data.top_services} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <BusySlots slots={data.busy_slots} />
              <div className="flex flex-col gap-4">
                <Employees data={data} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <Loyalty data={data} />
                  <PaymentMethods data={data} />
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
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Kpi
        label="Prestations réalisées"
        value={data ? data.totals.completed : placeholder}
        trend={data ? <TrendBadge trend={data.totals.trend} /> : null}
      />
      <Kpi
        label="Chiffre d'affaires encaissé"
        value={data ? formatCurrency(data.totals.revenue) : placeholder}
        hint="Payé sur place, noté à la clôture"
      />
      <Kpi label="Rendez-vous à venir" value={upcoming ?? placeholder} />
      <Kpi
        label="À clôturer"
        value={toClose ?? placeholder}
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
  value: number | string;
  trend?: React.ReactNode;
  hint?: string;
  tone?: "neutral" | "warning";
  href?: string;
}) {
  const body = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-anthracite/60">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${tone === "warning" ? "text-champagne" : "text-forest"}`}>
        {value}
      </p>
      <div className="mt-1 flex min-h-4 items-center gap-2 text-xs text-anthracite/55">
        {trend}
        {hint && <span>{hint}</span>}
      </div>
    </>
  );
  const className = `rounded-2xl border bg-beige p-4 ${
    tone === "warning" ? "border-champagne/40" : "border-sage/20"
  } ${href ? "transition-colors hover:border-champagne" : ""}`;

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
      <p className="mb-2 flex items-center gap-2 font-semibold text-forest">
        <Wallet size={17} aria-hidden="true" />
        Encaissements
      </p>
      {used.length === 0 ? (
        <p className="text-sm text-anthracite/60">Aucun paiement noté à la clôture sur cette période.</p>
      ) : (
        <ul className="flex flex-col gap-1.5 text-sm">
          {used.map((m) => (
            <li key={m.method} className="flex items-center justify-between gap-2">
              <span className="text-anthracite">{METHOD_LABELS[m.method] ?? m.method}</span>
              <span className="text-anthracite/65">
                {formatCurrency(m.amount)} · {m.share.toLocaleString("fr-FR")} %
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TrendBadge({ trend }: { trend: number | null }) {
  const label = formatTrend(trend);
  if (label === null) {
    return <span className="text-xs text-anthracite/50">Nouveau</span>;
  }
  const up = trend! >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-link-sage" : "text-terracotta"}`}
      title="Par rapport à la période précédente de même durée"
    >
      <Icon size={14} aria-hidden="true" />
      {label}
    </span>
  );
}

function TopServices({ data }: { data: ManagerActivity }) {
  return (
    <div className={CARD}>
      <p className="flex items-center gap-2 font-semibold text-forest">
        <Scissors size={17} aria-hidden="true" />
        Prestations préférées des clients
      </p>
      <p className="mb-4 text-sm text-anthracite/60">
        {data.totals.completed} prestation{data.totals.completed > 1 ? "s" : ""} réalisée{data.totals.completed > 1 ? "s" : ""} ·{" "}
        {formatCurrency(data.totals.revenue)}
      </p>
      {data.top_services.length === 0 ? (
        <p className="text-sm text-anthracite/60">Aucune prestation réalisée sur cette période.</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {data.top_services.map((service, index) => (
            <li key={service.service_id} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium text-anthracite">
                  <span className="mr-2 text-anthracite/45">{index + 1}.</span>
                  {service.name}
                </span>
                <TrendBadge trend={service.trend} />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-sage/15" aria-hidden="true">
                <div className="h-full rounded-full bg-forest" style={{ width: `${service.share}%` }} />
              </div>
              <p className="text-xs text-anthracite/60">
                {service.count} fois · {service.share.toLocaleString("fr-FR")} % des prestations ·{" "}
                {formatCurrency(service.revenue)}
              </p>
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
      <p className="flex items-center gap-2 font-semibold text-forest">
        <CalendarClock size={17} aria-hidden="true" />
        Prévision pour {month}
      </p>
      {forecast.expected === null ? (
        <p className="text-sm text-anthracite/65">
          Il faut au moins 3 mois d&apos;activité pour établir une prévision fiable ({forecast.months_of_history} mois disponible
          {forecast.months_of_history > 1 ? "s" : ""} pour l&apos;instant).
        </p>
      ) : (
        <>
          <p className="text-4xl font-semibold tracking-tight text-forest">
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
            <p className="rounded-xl bg-sage/10 px-3 py-2 text-sm text-anthracite/75">
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
      <p className="font-semibold text-forest">Jours et moments les plus chargés</p>
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
                    className={`h-10 rounded-lg font-semibold ${intensity > 0.55 ? "text-beige" : "text-forest"}`}
                    style={{
                      backgroundColor:
                        count === 0 ? "rgba(163, 177, 138, 0.12)" : `rgba(45, 59, 40, ${0.15 + intensity * 0.85})`,
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
      <p className="mt-2 text-xs text-anthracite/50">Matin : avant 12 h · Après-midi : 12 h – 17 h · Soir : après 17 h</p>
    </div>
  );
}

function Employees({ data }: { data: ManagerActivity }) {
  return (
    <div className={CARD}>
      <p className="mb-3 flex items-center gap-2 font-semibold text-forest">
        <Users size={17} aria-hidden="true" />
        Activité par employé
      </p>
      {data.employees.length === 0 ? (
        <p className="text-sm text-anthracite/60">Aucune prestation attribuée sur cette période.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-sage/15">
          {data.employees.map((employee) => (
            <li key={employee.employee_id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="font-medium text-anthracite">{employee.name}</span>
              <span className="text-anthracite/65">
                {employee.count} prestation{employee.count > 1 ? "s" : ""} · {formatCurrency(employee.revenue)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Loyalty({ data }: { data: ManagerActivity }) {
  const { loyalty } = data;
  return (
    <div className={CARD}>
      <p className="mb-2 flex items-center gap-2 font-semibold text-forest">
        <UserRoundCheck size={17} aria-hidden="true" />
        Fidélité des clients
      </p>
      <p className="text-3xl font-semibold tracking-tight text-forest">{loyalty.rate.toLocaleString("fr-FR")} %</p>
      <p className="mt-1 text-sm text-anthracite/65">
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
    <div className="rounded-2xl border border-champagne/30 bg-champagne/10 p-5">
      <p className="mb-2 flex items-center gap-2 font-semibold text-forest">
        <Lightbulb size={17} aria-hidden="true" />À retenir
      </p>
      <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-anthracite/80">
        {insights.map((insight) => (
          <li key={insight}>{insight}</li>
        ))}
      </ul>
    </div>
  );
}

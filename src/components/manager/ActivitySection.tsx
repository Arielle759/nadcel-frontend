"use client";

import TopClients from "@/components/manager/TopClients";

import {
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

export const PERIODS: { key: ActivityPeriod; label: string }[] = [
  { key: "month", label: "30 derniers jours" },
  { key: "quarter", label: "3 derniers mois" },
  { key: "year", label: "12 derniers mois" },
];

const PARTS: DayPart[] = ["matin", "apres_midi", "soir"];

// Cartes du tableau de bord : fond très légèrement teinté, fine bordure.
export const CARD = "rounded-xl border border-[#ebe4dd] bg-[#faf8f6] p-5 shadow-[0_1px_3px_rgba(60,40,30,0.06)] sm:p-6";
// Petit libellé en capitales au-dessus des chiffres.
const LABEL = "text-base font-semibold text-anthracite";

export const PERIOD_SHORT: Record<ActivityPeriod, string> = {
  month: "30 derniers jours",
  quarter: "3 derniers mois",
  year: "12 derniers mois",
};

// Partie « analyse » du tableau de bord gérant, sous le planning du jour.
export default function ActivitySection({
  data,
  loading,
  error,
  period,
  onPeriodChange,
}: {
  data: ManagerActivity | null;
  loading: boolean;
  error: string | null;
  period: ActivityPeriod;
  onPeriodChange: (period: ActivityPeriod) => void;
}) {
  const noActivity = data !== null && data.totals.completed === 0 && data.monthly.every((m) => m.total === 0);

  return (
    <section className="flex flex-col gap-4" aria-busy={loading} aria-labelledby="analysis-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="analysis-title" className="sr-only">
          Analyse de l&apos;activité
        </h2>
        <div role="group" aria-label="Période analysée" className="flex rounded-lg border border-[#ebe4dd] bg-white p-1">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onPeriodChange(key)}
              aria-pressed={period === key}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                period === key ? "bg-accent text-white" : "text-anthracite/70 hover:bg-[#f1ece6]"
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

      {!data && loading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Chargement de l'activité">
          {[0, 1].map((item) => (
            <div key={item} className="h-56 animate-pulse rounded-xl bg-sable/15" />
          ))}
        </div>
      )}

      {noActivity ? (
        <div className={`${CARD} text-center`}>
          <p className="font-semibold text-brand">Pas encore d&apos;activité à analyser</p>
          <p className="mt-1 text-sm text-anthracite/75">
            Les statistiques apparaîtront dès que vos premiers rendez-vous seront marqués comme terminés.
          </p>
        </div>
      ) : (
        data && (
          <div className={`flex flex-col gap-4 transition-opacity ${loading ? "opacity-60" : ""}`}>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TopServices data={data} period={period} />
              <Forecast data={data} />
            </div>
            <Insights data={data} />
            <TopClients clients={data.top_clients ?? []} period={period} />
            <ActivityMonthlyChart months={data.monthly} services={data.top_services} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <BusySlots slots={data.busy_slots} />
              </div>
              <Loyalty data={data} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PaymentMethods data={data} />
              <BookingSources data={data} />
            </div>
          </div>
        )
      )}
    </section>
  );
}

function PaymentMethods({ data }: { data: ManagerActivity }) {
  const used = data.payment_methods.filter((m) => m.count > 0);
  return (
    <div className={CARD}>
      <p className={`${LABEL} mb-3`}>Encaissements</p>
      {used.length === 0 ? (
        <p className="text-sm text-anthracite/75">Aucun paiement noté à la clôture sur cette période.</p>
      ) : (
        <BarList
          rows={used.map((m) => ({ key: m.method, label: METHOD_LABELS[m.method] ?? m.method, share: m.share, value: formatCurrency(m.amount) }))}
        />
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
      <BarList
        rows={sources.map((s) => ({ key: s.source, label: BOOKING_SOURCE_LABELS[s.source], share: s.share, value: `${s.count} rdv` }))}
      />
    </div>
  );
}

// Liste de parts en barres horizontales : libellé et valeur au-dessus, part en
// pourcentage dans la barre. Plus lisible qu'une suite de chiffres.
function BarList({ rows }: { rows: { key: string; label: string; share: number; value: string }[] }) {
  return (
    <ul className="flex flex-col gap-3 text-sm">
      {rows.map((r, i) => (
        <li key={r.key}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-medium text-anthracite">{r.label}</span>
            <span className="tabular-nums text-anthracite/75">{r.value}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-beige">
              <div className="h-full rounded-full" style={{ width: `${Math.max(2, r.share)}%`, background: `var(--color-chart-${(i % 7) + 1})` }} />
            </div>
            <span className="w-12 text-right text-xs tabular-nums text-anthracite/75">{r.share.toLocaleString("fr-FR")} %</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function TopServices({ data, period }: { data: ManagerActivity; period: ActivityPeriod }) {
  return (
    <div className={CARD}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-base font-semibold text-anthracite">Services les plus demandés</p>
        <p className="text-xs text-anthracite/70">{PERIOD_SHORT[period]}</p>
      </div>
      {data.top_services.length === 0 ? (
        <p className="mt-4 text-sm text-anthracite/75">Aucun rendez-vous réalisé sur cette période.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3.5 text-sm">
          {data.top_services.slice(0, 5).map((service, _i, list) => (
            <li key={service.service_id}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-medium text-anthracite">{service.name}</span>
                <span className="shrink-0 tabular-nums font-semibold text-anthracite">{service.share.toLocaleString("fr-FR")} %</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-beige">
                {/* Barres à l'échelle du service le plus demandé : les écarts se lisent mieux. */}
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(4, (service.share / Math.max(...list.map((x) => x.share), 1)) * 100)}%` }} />
              </div>
              <p className="mt-1 text-xs text-anthracite/70">
                {service.count} rendez-vous · {formatCurrency(service.revenue)}
              </p>
            </li>
          ))}
        </ul>
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
        <p className="text-sm text-anthracite/75">
          Il faut au moins 3 mois d&apos;activité pour établir une prévision fiable ({forecast.months_of_history} mois disponible
          {forecast.months_of_history > 1 ? "s" : ""} pour l&apos;instant).
        </p>
      ) : (
        <>
          <p className="text-4xl font-semibold tracking-tight text-brand">
            ≈ {forecast.expected}
            <span className="ml-2 text-base font-medium text-anthracite/75">rendez-vous attendus</span>
          </p>
          <p className="text-sm text-anthracite/75">
            {forecast.method === "seasonal"
              ? "Calcul : même mois l'an dernier, ajusté selon la tendance des 3 derniers mois."
              : "Calcul : moyenne des 3 derniers mois complets."}{" "}
            Estimation indicative, à confronter à votre connaissance du salon.
          </p>
          {forecast.peak_month && (
            <p className="rounded-xl bg-sable/10 px-3 py-2 text-sm text-anthracite/75">
              Mois le plus chargé de l&apos;année écoulée : <strong>{formatMonthLong(forecast.peak_month.month)}</strong> (
              {forecast.peak_month.total} rendez-vous).
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
      <p className="mb-4 text-sm text-anthracite/75">Plus la case est foncée, plus il y a eu de rendez-vous.</p>
      <table className="w-full table-fixed border-separate border-spacing-1 text-center text-xs">
        <caption className="sr-only">Nombre de rendez-vous par jour de la semaine et moment de la journée</caption>
        <thead>
          <tr>
            <th scope="col" className="w-24" />
            {DAY_SHORT.map((day) => (
              <th key={day} scope="col" className="font-semibold text-anthracite/75">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PARTS.map((part) => (
            <tr key={part}>
              <th scope="row" className="pr-1 text-left font-semibold capitalize text-anthracite/75">
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
                    title={`${DAY_LABELS[index]} ${PART_LABELS[part]} : ${count} rendez-vous`}
                  >
                    {count > 0 ? count : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-anthracite/75">Matin : avant 12 h. Après-midi : de 12 h à 17 h. Soir : après 17 h.</p>
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
      <p className="mt-2 text-sm text-anthracite/75">
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
      `Votre moment le plus chargé est le ${DAY_LABELS[busiest.day - 1]} ${PART_LABELS[busiest.part]} (${busiest.count} rendez-vous) : prévoyez assez de personnel sur ce créneau.`
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

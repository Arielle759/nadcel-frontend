"use client";

import { motion } from "framer-motion";
import CountUp from "@/components/motion/CountUp";
import type { AdminStats } from "@/hooks/useAdmin";
import { BOOKING_SOURCE_LABELS } from "@/lib/bookingSources";
import type { BookingSource } from "@/hooks/useManagerAppointments";
import { ui } from "@/lib/ui";

// Une couleur par canal, du plus « Nadcel » (en ligne, chocolat) au plus hors
// ligne. La couleur n'est jamais seule : chaque canal est aussi écrit en toutes lettres.
const CHANNELS: { source: BookingSource; color: string; hint: string }[] = [
  { source: "online", color: "var(--color-brand)", hint: "Réservés par les clients sur Nadcel" },
  { source: "whatsapp", color: "var(--color-accent)", hint: "Saisis par le salon" },
  { source: "instagram", color: "var(--color-champagne-light)", hint: "Messages reçus par le salon" },
  { source: "facebook", color: "var(--color-brand-soft)", hint: "Messages reçus par le salon" },
  { source: "tiktok", color: "var(--color-cacao)", hint: "Messages reçus par le salon" },
  { source: "phone", color: "var(--color-champagne)", hint: "Saisis par le salon" },
  { source: "walk_in", color: "var(--color-sable)", hint: "Clients venus sans rendez-vous" },
];

const SIZE = 184;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const GAP = 0.012; // petit espace entre deux parts de l'anneau

// Petit anneau qui reprend la part du canal, dans sa couleur : il relie chaque
// carte à l'anneau principal, sans pastille décorative.
function MiniRing({ share, color }: { share: number; color: string }) {
  const size = 40;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="white" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: Math.max(share / 100, 0.001) }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      />
    </svg>
  );
}

function formatShare(value: number): string {
  return `${value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
}

// Anneau des canaux de réservation sur 30 jours, avec le détail de chaque canal.
export default function BookingChannels({ appointments }: { appointments: AdminStats["appointments"] }) {
  const { online_share: onlineShare, sources, recent_total: total } = appointments;
  if (onlineShare === null || !sources || !total) return null;

  const counts = new Map(sources.map((s) => [s.source, s]));
  const used = CHANNELS.filter((c) => (counts.get(c.source)?.count ?? 0) > 0);
  const fractions = used.map((channel) => (counts.get(channel.source)?.share ?? 0) / 100);
  const segments = used.map((channel, index) => ({
    ...channel,
    start: fractions.slice(0, index).reduce((sum, f) => sum + f, 0),
    length: Math.max(0, fractions[index] - (used.length > 1 ? GAP : 0)),
  }));

  // Les canaux sans rendez-vous sur la période ne prennent pas de place
  // (« en ligne » reste toujours affiché, c'est la référence).
  const cards = CHANNELS.filter((c) => c.source === "online" || (counts.get(c.source)?.count ?? 0) > 0);

  const summary = cards.map((c) => `${BOOKING_SOURCE_LABELS[c.source]} ${formatShare(counts.get(c.source)?.share ?? 0)}`).join(", ");

  return (
    <section aria-labelledby="channels-title" className={`${ui.surface} p-6 sm:p-7`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="channels-title" className="font-sans text-base font-semibold text-anthracite">
          Canaux de réservation
        </h3>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-anthracite/55">
          30 derniers jours, {total.toLocaleString("fr-FR")} rendez-vous
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-12">
        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={summary}>
            <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--color-beige)" strokeWidth={STROKE} />
            {segments.map((segment, index) => (
              <g key={segment.source} transform={`rotate(${segment.start * 360 - 90} ${SIZE / 2} ${SIZE / 2})`}>
                <motion.circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={STROKE}
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: segment.length }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.15 + index * 0.15, ease: "easeOut" }}
                />
              </g>
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center" aria-hidden="true">
            <span className="text-3xl font-semibold tabular-nums tracking-tight text-brand">
              <CountUp value={onlineShare} format={formatShare} />
            </span>
            <span className="mt-0.5 text-xs text-anthracite/60">en ligne</span>
          </div>
        </div>

        <dl className="grid w-full flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
          {cards.map((channel) => {
            const data = counts.get(channel.source);
            return (
              <div key={channel.source} className="flex items-center gap-4 rounded-xl bg-beige/60 px-4 py-3.5">
                <MiniRing share={data?.share ?? 0} color={channel.color} />
                <div className="min-w-0 flex-1">
                  <dt className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-anthracite">{BOOKING_SOURCE_LABELS[channel.source]}</span>
                    <span className="text-sm tabular-nums text-anthracite/60">{formatShare(data?.share ?? 0)}</span>
                  </dt>
                  <dd className="mt-0.5">
                    <span className="text-xl font-semibold tabular-nums text-brand">{(data?.count ?? 0).toLocaleString("fr-FR")}</span>
                    <span className="ml-1.5 text-xs text-anthracite/55">{channel.hint}</span>
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

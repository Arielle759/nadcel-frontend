"use client";

import AddToCalendar from "@/components/AddToCalendar";
import Reveal from "@/components/motion/Reveal";
import type { ClientAppointment } from "@/hooks/useClientAppointments";
import type { CalendarEvent } from "@/lib/calendar";
import { assetUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { resolveServiceImage } from "@/lib/serviceImage";
import { ui } from "@/lib/ui";
import { serviceWithOption } from "@/lib/serviceOptions";

const LABEL = "text-[11px] font-semibold uppercase tracking-[0.08em]";

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

// « Aujourd'hui », « Demain », « Dans 3 jours »… : le compte à rebours du prochain rendez-vous.
function countdown(date: Date, now: number): string {
  const days = Math.round((startOfDay(date) - startOfDay(new Date(now))) / 86_400_000);
  if (days <= 0) return "C'est aujourd'hui";
  if (days === 1) return "C'est demain";
  if (days < 7) return `Dans ${days} jours`;
  const weeks = Math.round(days / 7);
  return weeks === 1 ? "Dans une semaine" : `Dans ${weeks} semaines`;
}

function formatTime(date: Date): string {
  const minutes = date.getMinutes();
  return minutes === 0 ? `${date.getHours()} h` : `${date.getHours()} h ${String(minutes).padStart(2, "0")}`;
}

function photoFor(appointment: ClientAppointment): string | undefined {
  const { service, salon } = appointment;
  return (
    resolveServiceImage({ image: service.image ?? null, name: service.name, category: service.category ?? "" }) ??
    assetUrl(salon.cover ?? null) ??
    undefined
  );
}

// Le prochain rendez-vous en grand, comme un billet : photo, compte à rebours,
// heure, adresse et les gestes utiles (agenda, itinéraire, appel).
export function NextAppointmentCard({
  appointment,
  now,
  calendarEvent,
}: {
  appointment: ClientAppointment;
  now: number;
  calendarEvent: CalendarEvent | null;
}) {
  const date = new Date(appointment.scheduled_at);
  const { salon, service } = appointment;
  const photo = photoFor(appointment);
  const address = [salon.address, salon.city].filter(Boolean).join(", ");
  const day = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([salon.name, address].filter(Boolean).join(", "))}`;

  return (
    <Reveal>
      <section
        aria-labelledby="next-appointment-title"
        className={`${ui.surface} grid overflow-hidden rounded-3xl sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]`}
      >
        <div className="relative h-44 bg-sable/30 sm:h-auto">
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <span className="absolute left-4 top-4 rounded-full bg-vif-vert-bg px-3 py-1.5 text-xs font-semibold text-vif-vert-ink shadow-[0_4px_12px_rgba(59,42,36,0.15)]">
            {countdown(date, now)}
          </span>
        </div>
        <div className="flex flex-col gap-4 p-6 sm:p-8">
          <div>
            <p className={`${LABEL} text-anthracite/75`}>Votre prochain moment beauté</p>
            <h2 id="next-appointment-title" className="mt-2 text-2xl font-semibold tracking-tight text-brand sm:text-3xl">
              {serviceWithOption(service.name, appointment.option_label)}
            </h2>
            <p className="mt-1 text-anthracite/75">
              chez <span className="font-semibold text-anthracite">{salon.name}</span>
              {appointment.employee?.name ? `, avec ${appointment.employee.name}` : ""}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-beige/70 px-4 py-3">
              <dt className={`${LABEL} text-anthracite/75`}>Quand</dt>
              <dd className="mt-1 font-semibold text-anthracite">
                <span className="first-letter:uppercase">{day}</span>, {formatTime(date)}
              </dd>
            </div>
            <div className="rounded-xl bg-beige/70 px-4 py-3">
              <dt className={`${LABEL} text-anthracite/75`}>À régler au salon</dt>
              <dd className="mt-1 font-semibold tabular-nums text-anthracite">{formatCurrency(Number(appointment.price))}</dd>
            </div>
          </dl>

          {address && <p className="text-sm text-anthracite/75">{address}</p>}

          <div className="flex flex-wrap items-center gap-2">
            {calendarEvent && (
              <AddToCalendar event={calendarEvent} filename={`nadcel-rendez-vous-${appointment.id}.ics`} />
            )}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={`${ui.textLink} px-3 text-sm`}>
              Itinéraire
            </a>
            {salon.phone && (
              <a href={`tel:${salon.phone.replace(/\s+/g, "")}`} className={`${ui.textLink} px-3 text-sm`}>
                Appeler le salon
              </a>
            )}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

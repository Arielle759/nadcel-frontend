"use client";

import { useEffect, useMemo, useState } from "react";
import { ManagerAppointment, useManagerAppointments } from "@/hooks/useManagerAppointments";
import { BOOKING_SOURCE_LABELS, appointmentClientName } from "@/lib/bookingSources";
import WhatsAppReminderButton from "@/components/manager/WhatsAppReminderButton";
import { ui } from "@/lib/ui";
import { serviceWithOption } from "@/lib/serviceOptions";

// « réservé par whatsapp » ou « réservé par sur place » se lisaient mal.
const BOOKED_VIA: Partial<Record<string, string>> = {
  whatsapp: "réservé par WhatsApp",
  instagram: "réservé sur Instagram",
  facebook: "réservé sur Facebook",
  tiktok: "réservé sur TikTok",
  phone: "réservé par téléphone",
  walk_in: "réservé au salon",
};

function isTomorrow(iso: string, now: number): boolean {
  const date = new Date(iso);
  const today = new Date(now);
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  return (
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate()
  );
}

function timeLabel(iso: string): string {
  const d = new Date(iso);
  return d.getMinutes() === 0 ? `${d.getHours()} h` : `${d.getHours()} h ${String(d.getMinutes()).padStart(2, "0")}`;
}

// Rendez-vous de demain pris hors ligne : la cliente n'a pas d'e-mail, donc pas
// de rappel automatique. Le gérant les relance ici en un clic.
export default function RemindersCard() {
  const { getAppointments } = useManagerAppointments();
  const [appointments, setAppointments] = useState<ManagerAppointment[]>([]);
  const [now, setNow] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    // Seulement la journée de demain : la liste ne dépend pas du volume du salon.
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const to = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 0, 0, -1);
    getAppointments({ from, to })
      .then((data) => {
        if (!active) return;
        setAppointments(data);
        setNow(Date.now());
      })
      .catch(() => {
        // Carte secondaire : en cas d'erreur, on ne l'affiche simplement pas.
      });
    return () => {
      active = false;
    };
  }, [getAppointments]);

  const toRemind = useMemo(() => {
    if (now === null) return [];
    return appointments
      .filter(
        (a) =>
          !a.client &&
          a.client_phone &&
          (a.status === "confirmed" || a.status === "pending") &&
          isTomorrow(a.scheduled_at, now)
      )
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  }, [appointments, now]);

  if (toRemind.length === 0) return null;

  const pending = toRemind.filter((a) => !a.reminder_sent_at).length;
  // La carte reste courte : les 3 premiers rappels à envoyer, le reste sur demande.
  // Quand tout est envoyé, seule la ligne de titre reste visible.
  const ordered = [...toRemind.filter((a) => !a.reminder_sent_at), ...toRemind.filter((a) => a.reminder_sent_at)];
  const visible = expanded ? ordered : pending === 0 ? [] : ordered.slice(0, 3);

  return (
    <section aria-labelledby="reminders-title" className={`${ui.surface} mb-6 p-5 sm:p-6`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="reminders-title" className="text-lg font-semibold text-anthracite">
          Rappels à envoyer pour demain
        </h2>
        <p className="text-sm text-anthracite/70">
          {pending === 0 ? "Tous les rappels sont envoyés." : `${pending} sur ${toRemind.length} à envoyer`}
        </p>
      </div>
      {(expanded || pending > 0) && <p className="mt-1 text-sm text-anthracite/75">
        Ces clientes ont réservé par WhatsApp, téléphone ou au salon : elles ne reçoivent pas l&apos;e-mail automatique.
      </p>}
      {visible.length > 0 && <ul className="mt-5 flex flex-col gap-4">
        {visible.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-4">
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-beige font-heading text-lg font-semibold text-brand"
              >
                {appointmentClientName(a).charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-anthracite">
                  {timeLabel(a.scheduled_at)}, {appointmentClientName(a)}
                </p>
                <p className="mt-0.5 text-[13px] text-anthracite/75">
                  {serviceWithOption(a.service?.name ?? "Service", a.option_label)}, {BOOKED_VIA[a.source] ?? BOOKING_SOURCE_LABELS[a.source]}
                </p>
              </div>
            </div>
            <WhatsAppReminderButton
              appointment={a}
              compact
              onSent={(updated) =>
                setAppointments((prev) => prev.map((x) => (x.id === updated.id ? { ...x, reminder_sent_at: updated.reminder_sent_at } : x)))
              }
            />
          </li>
        ))}
      </ul>}
      {visible.length < toRemind.length && (
        <button type="button" onClick={() => setExpanded(true)} className={`${ui.textLink} mt-4 text-sm`}>
          Voir les {toRemind.length} rappels
        </button>
      )}
      {expanded && (
        <button type="button" onClick={() => setExpanded(false)} className={`${ui.textLink} mt-4 text-sm`}>
          Réduire la liste
        </button>
      )}
    </section>
  );
}

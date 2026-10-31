"use client";

import { useEffect, useMemo, useState } from "react";
import { ManagerAppointment, useManagerAppointments } from "@/hooks/useManagerAppointments";
import { BOOKING_SOURCE_LABELS, appointmentClientName } from "@/lib/bookingSources";
import WhatsAppReminderButton from "@/components/manager/WhatsAppReminderButton";
import { ui } from "@/lib/ui";

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

  useEffect(() => {
    let active = true;
    getAppointments()
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

  return (
    <section aria-labelledby="reminders-title" className={`${ui.surface} mb-6 p-5 sm:p-6`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="reminders-title" className="font-semibold text-forest">
          Rappels à envoyer pour demain
        </h2>
        <p className="text-sm text-anthracite/70">
          {pending === 0 ? "Tous les rappels sont envoyés." : `${pending} sur ${toRemind.length} à envoyer`}
        </p>
      </div>
      <p className="mt-1 text-sm text-anthracite/70">
        Ces clientes ont réservé par WhatsApp, téléphone ou au salon : elles ne reçoivent pas l&apos;e-mail automatique.
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {toRemind.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-beige px-4 py-3">
            <div className="min-w-0">
              <p className="font-semibold text-anthracite">
                {timeLabel(a.scheduled_at)}, {appointmentClientName(a)}
              </p>
              <p className="text-sm text-anthracite/70">
                {a.service?.name}, réservé par {BOOKING_SOURCE_LABELS[a.source].toLowerCase()}
              </p>
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
      </ul>
    </section>
  );
}

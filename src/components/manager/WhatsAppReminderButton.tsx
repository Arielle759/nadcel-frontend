"use client";

import { useState } from "react";
import { ManagerAppointment, useManagerAppointments } from "@/hooks/useManagerAppointments";
import { appointmentClientName } from "@/lib/bookingSources";
import { reminderMessage, whatsAppLink } from "@/lib/whatsapp";

// Ouvre WhatsApp avec le message de rappel déjà rédigé ; le rendez-vous est noté
// « rappel envoyé » au moment du clic (le gérant n'a plus qu'à appuyer sur Envoyer).
export default function WhatsAppReminderButton({
  appointment,
  salonName,
  onSent,
  compact = false,
}: {
  appointment: ManagerAppointment;
  salonName?: string;
  onSent: (updated: ManagerAppointment) => void;
  compact?: boolean;
}) {
  const { markReminderSent } = useManagerAppointments();
  const [error, setError] = useState<string | null>(null);

  const link = whatsAppLink(
    appointment.client_phone,
    reminderMessage({
      clientName: appointmentClientName(appointment),
      salonName: salonName ?? appointment.salon?.name ?? "notre salon",
      serviceName: appointment.service?.name ?? "votre rendez-vous",
      scheduledAt: appointment.scheduled_at,
    })
  );

  if (!link) {
    return <span className="text-xs text-anthracite/75">Numéro non reconnu pour WhatsApp</span>;
  }

  const sent = Boolean(appointment.reminder_sent_at);

  async function handleClick() {
    setError(null);
    if (sent) return;
    try {
      onSent(await markReminderSent(appointment.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rappel non noté.");
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={
          sent
            ? "inline-flex min-h-9 items-center rounded-full px-3 text-xs font-semibold text-brand/70 hover:text-brand"
            : `inline-flex items-center rounded-full bg-[#1f7a4d] font-semibold text-white transition-colors hover:bg-[#186440] ${
                compact ? "min-h-9 px-3 text-xs" : "min-h-11 px-5 text-sm"
              }`
        }
      >
        {sent ? "Rappel envoyé, renvoyer" : "Rappeler sur WhatsApp"}
      </a>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </span>
  );
}

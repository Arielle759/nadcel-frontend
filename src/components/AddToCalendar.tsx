"use client";

import { downloadIcs, googleCalendarUrl, type CalendarEvent } from "@/lib/calendar";
import { ui } from "@/lib/ui";

// Google Agenda en premier : c'est le calendrier natif d'Android, majoritaire
// au Sénégal. Le fichier .ics couvre l'iPhone, Outlook et les autres agendas.
export default function AddToCalendar({ event, filename }: { event: CalendarEvent; filename: string }) {
  return (
    <>
      <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className={ui.buttonSecondary}>
        Ajouter à Google Agenda
      </a>
      <button
        type="button"
        onClick={() => downloadIcs(event, filename)}
        className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-accent transition-colors hover:text-brand"
        title="Fichier .ics pour le Calendrier d'iPhone, Outlook ou un autre agenda"
      >
        Autre calendrier
      </button>
    </>
  );
}

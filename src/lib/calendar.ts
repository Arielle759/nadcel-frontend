// « Ajouter à mon agenda » : le rendez-vous rejoint le calendrier du téléphone,
// qui envoie lui-même ses notifications (même hors connexion, sans Nadcel).
// - Google Agenda : lien de création prérempli (calendrier natif d'Android).
// - Fichier .ics (iCalendar, RFC 5545) : Calendrier d'iPhone, Outlook, Samsung.
//   Il porte deux rappels : la veille et 2 h avant.

export interface CalendarEvent {
  uid: string;
  title: string;
  start: Date;
  end: Date;
  location: string;
  details: string;
}

// 2026-11-03T12:30:00.000Z devient 20261103T123000Z (format commun Google / iCalendar).
function utcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${utcStamp(event.start)}/${utcStamp(event.end)}`,
    details: event.details,
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Échappement imposé par la RFC 5545 pour les valeurs texte.
function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

// Lignes de 75 octets maximum, la suite commence par une espace (RFC 5545, 3.1).
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  for (const char of line) {
    const limit = parts.length === 0 ? 75 : 74;
    if (new TextEncoder().encode(current + char).length > limit) {
      parts.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.join("\r\n ");
}

export function icsContent(event: CalendarEvent): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nadcel//Rendez-vous//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${utcStamp(event.start)}`,
    `DTEND:${utcStamp(event.end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(event.location)}`,
    `DESCRIPTION:${escapeText(event.details)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(`Demain : ${event.title}`)}`,
    "TRIGGER:-P1D",
    "END:VALARM",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(`Dans 2 h : ${event.title}`)}`,
    "TRIGGER:-PT2H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function downloadIcs(event: CalendarEvent, filename: string): void {
  const blob = new Blob([icsContent(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

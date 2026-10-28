const DRAFT_KEY = "booking_draft";

export interface BookingDraft {
  salonId: number;
  serviceId: number;
  date: string; // YYYY-MM-DD
  heure: string; // HH:mm
}

export function saveBookingDraft(draft: BookingDraft): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // sessionStorage indisponible (navigation privée, etc.) : tant pis, pas bloquant.
  }
}

export function readBookingDraft(): BookingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BookingDraft;
  } catch {
    return null;
  }
}

export function clearBookingDraft(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export function nextUrlForBookingDraft(): string {
  const draft = readBookingDraft();
  return draft ? `/salons/${draft.salonId}/appointments` : "/";
}

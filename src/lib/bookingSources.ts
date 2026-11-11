import type { BookingSource } from "@/hooks/useManagerAppointments";

export const BOOKING_SOURCE_LABELS: Record<BookingSource, string> = {
  online: "En ligne",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  phone: "Téléphone",
  walk_in: "Sur place",
};

export function appointmentClientName(a: { client: { name: string } | null; client_name?: string | null }): string {
  return a.client?.name ?? a.client_name ?? "Client";
}

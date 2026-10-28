import type { AppointmentStatus } from "@/hooks/useManagerAppointments";

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  in_progress: "bg-violet-100 text-violet-900",
  completed: "bg-sage/25 text-forest",
  cancelled: "bg-red-100 text-red-900",
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  in_progress: "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
};

export default function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

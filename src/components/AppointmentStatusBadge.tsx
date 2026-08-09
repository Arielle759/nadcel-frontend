import type { AppointmentStatus } from "@/hooks/useManagerAppointments";

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  in_progress: "border-violet-200 bg-violet-50 text-violet-800",
  completed: "border-sky-200 bg-sky-50 text-sky-800",
  cancelled: "border-red-200 bg-red-50 text-red-800",
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
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

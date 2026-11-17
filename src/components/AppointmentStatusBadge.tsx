import type { AppointmentStatus } from "@/hooks/useManagerAppointments";

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "bg-vif-ambre-bg text-vif-ambre-ink",
  confirmed: "bg-vif-vert-bg text-vif-vert-ink",
  in_progress: "bg-vif-ciel-bg text-vif-ciel-ink",
  completed: "bg-vif-lilas-bg text-vif-lilas-ink",
  cancelled: "bg-vif-corail-bg text-vif-corail-ink",
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

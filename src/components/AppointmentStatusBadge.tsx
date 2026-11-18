import type { AppointmentStatus } from "@/hooks/useManagerAppointments";

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "bg-vif-ambre-bg text-vif-ambre-ink",
  confirmed: "bg-vif-vert-bg text-vif-vert-ink",
  in_progress: "bg-vif-ciel-bg text-vif-ciel-ink",
  completed: "bg-vif-lilas-bg text-vif-lilas-ink",
  cancelled: "bg-vif-corail-bg text-vif-corail-ink",
  no_show: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  in_progress: "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
  no_show: "Absente",
};

export default function AppointmentStatusBadge({ status, late = false }: { status: AppointmentStatus; late?: boolean }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {status === "cancelled" && late ? "Annulé tardivement" : STATUS_LABELS[status]}
    </span>
  );
}

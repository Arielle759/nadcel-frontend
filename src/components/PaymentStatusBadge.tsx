import type { PaymentMethod, PaymentStatus } from "@/hooks/useManagerAppointments";

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  unpaid: "bg-gray-100 text-gray-700",
  paid: "bg-emerald-100 text-emerald-800",
};

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Non payé",
  paid: "Payé",
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Espèces",
  card: "Carte",
};

export default function PaymentStatusBadge({
  status,
  method,
}: {
  status: PaymentStatus;
  method: PaymentMethod | null;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-medium ${PAYMENT_STYLES[status]}`}
    >
      {PAYMENT_LABELS[status]}
      {status === "paid" && method ? ` · ${PAYMENT_METHOD_LABELS[method]}` : ""}
    </span>
  );
}

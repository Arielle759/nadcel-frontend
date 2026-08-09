import type { PaymentMethod, PaymentStatus } from "@/hooks/useManagerAppointments";

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  unpaid: "border-stone-200 bg-stone-50 text-stone-700",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-800",
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
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${PAYMENT_STYLES[status]}`}
    >
      {PAYMENT_LABELS[status]}
      {status === "paid" && method ? ` (${PAYMENT_METHOD_LABELS[method]})` : ""}
    </span>
  );
}

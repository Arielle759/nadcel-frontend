import type { PaymentMethod, PaymentStatus } from "@/hooks/useManagerAppointments";
import { formatCurrency } from "@/lib/currency";

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  unpaid: "border-stone-200 bg-stone-50 text-stone-700",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Non encaissé",
  paid: "Encaissé",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  especes: "Espèces",
  wave: "Wave",
  orange_money: "Orange Money",
  cash: "Espèces",
  card: "Carte",
};

export default function PaymentStatusBadge({
  status,
  method,
  amount = null,
}: {
  status: PaymentStatus;
  method: PaymentMethod | null;
  amount?: string | number | null;
}) {
  const details = [
    amount !== null && amount !== undefined ? formatCurrency(Number(amount)) : null,
    method ? PAYMENT_METHOD_LABELS[method] : null,
  ].filter(Boolean);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${PAYMENT_STYLES[status]}`}
    >
      {PAYMENT_LABELS[status]}
      {status === "paid" && details.length > 0 ? ` : ${details.join(", ")}` : ""}
    </span>
  );
}

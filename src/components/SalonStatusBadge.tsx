type SalonStatus = "active" | "suspended" | "pending" | "rejected";

const STATUS_STYLES: Record<SalonStatus, string> = {
  active: "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  rejected: "bg-gray-100 text-gray-700",
};

const STATUS_LABELS: Record<SalonStatus, string> = {
  active: "Actif",
  suspended: "Suspendu",
  pending: "En attente",
  rejected: "Rejeté",
};

function resolveSalonStatus(isVerified: boolean, isActive: boolean): SalonStatus {
  if (isVerified && isActive) return "active";
  if (isVerified && !isActive) return "suspended";
  if (!isVerified && isActive) return "pending";
  return "rejected";
}

export default function SalonStatusBadge({
  isVerified,
  isActive,
}: {
  isVerified: boolean;
  isActive: boolean;
}) {
  const status = resolveSalonStatus(isVerified, isActive);
  return (
    <span
      className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

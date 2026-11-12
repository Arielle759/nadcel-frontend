import { Star } from "lucide-react";

export default function SalonRating({
  average,
  count,
}: {
  average: string | number | null;
  count: number;
}) {
  if (!count || average === null) {
    return <span className="text-xs font-semibold text-brand">Nouveau</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand">
      <Star size={14} className="fill-champagne text-champagne" aria-hidden="true" />
      {Number(average).toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
      <span className="font-normal text-anthracite/75">({count})</span>
    </span>
  );
}

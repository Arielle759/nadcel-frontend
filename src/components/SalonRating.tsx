import { Star } from "lucide-react";

export default function SalonRating({
  average,
  count,
}: {
  average: string | number | null;
  count: number;
}) {
  if (!count || average === null) {
    return <span className="text-xs font-semibold text-forest">Nouveau</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest">
      <Star size={14} className="fill-champagne text-champagne" aria-hidden="true" />
      {Number(average).toFixed(1)}
      <span className="font-normal text-anthracite/60">({count})</span>
    </span>
  );
}

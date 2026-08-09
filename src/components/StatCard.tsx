export type StatTone = "neutral" | "forest" | "positive" | "warning" | "negative";

const TONE_CLASSES: Record<StatTone, string> = {
  neutral: "text-anthracite",
  forest: "text-forest",
  positive: "text-link-sage",
  warning: "text-champagne",
  negative: "text-terracotta",
};

export default function StatCard({
  label,
  value,
  tone = "neutral",
  prominent = false,
  compact = false,
}: {
  label: string;
  value: number | string;
  tone?: StatTone;
  prominent?: boolean;
  compact?: boolean;
}) {
  const padding = compact ? (prominent ? "p-6" : "p-4") : prominent ? "p-8" : "p-6";
  const textSize = compact ? (prominent ? "text-3xl" : "text-2xl") : prominent ? "text-4xl" : "text-3xl";

  return (
    <div
      className={`rounded-lg border ${
        prominent ? "border-forest/30 bg-forest/5" : "border-sage/30 bg-beige"
      } ${padding}`}
    >
      <p className="text-sm text-anthracite/75">{label}</p>
      <p className={`font-semibold ${textSize} ${TONE_CLASSES[tone]}`}>{value}</p>
    </div>
  );
}

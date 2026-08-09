export type StatTone = "neutral" | "forest" | "positive" | "warning" | "negative";

const TONE_CLASSES: Record<StatTone, string> = {
  neutral: "text-anthracite",
  forest: "text-forest",
  positive: "text-link-sage",
  warning: "text-champagne",
  negative: "text-terracotta",
};

const TONE_ACCENTS: Record<StatTone, string> = {
  neutral: "bg-sage",
  forest: "bg-forest",
  positive: "bg-dark-sage",
  warning: "bg-champagne",
  negative: "bg-terracotta",
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
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(45,59,40,0.1)] ${
        prominent ? "border-forest/20 bg-gradient-to-br from-beige to-sage/10" : "border-sage/20 bg-beige"
      } ${padding}`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${TONE_ACCENTS[tone]}`} />
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-anthracite/60">
        {label}
      </p>
      <p className={`mt-2 font-semibold tracking-tight ${textSize} ${TONE_CLASSES[tone]}`}>
        {value}
      </p>
    </div>
  );
}

import type { DayPart } from "@/hooks/useManagerActivity";

export const DAY_LABELS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
export const DAY_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export const PART_LABELS: Record<DayPart, string> = {
  matin: "matin",
  apres_midi: "après-midi",
  soir: "soir",
};

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const MONTHS_LONG = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

// "2026-03" devient "mars 26"
export function formatMonthShort(key: string): string {
  const [year, month] = key.split("-");
  return `${MONTHS[Number(month) - 1]} ${year.slice(2)}`;
}

// "2026-03" devient "mars 2026"
export function formatMonthLong(key: string): string {
  const [year, month] = key.split("-");
  return `${MONTHS_LONG[Number(month) - 1]} ${year}`;
}

// 12.5 devient "+12,5 %" ; null reste null (pas de période de comparaison)
export function formatTrend(trend: number | null): string | null {
  if (trend === null) return null;
  const sign = trend > 0 ? "+" : "";
  return `${sign}${trend.toLocaleString("fr-FR")} %`;
}

// 90 devient "1 h 30", 45 devient "45 min"
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

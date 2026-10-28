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

// "2026-03" → "mars 26"
export function formatMonthShort(key: string): string {
  const [year, month] = key.split("-");
  return `${MONTHS[Number(month) - 1]} ${year.slice(2)}`;
}

// "2026-03" → "mars 2026"
export function formatMonthLong(key: string): string {
  const [year, month] = key.split("-");
  return `${MONTHS_LONG[Number(month) - 1]} ${year}`;
}

// 12.5 → "+12,5 %", null → null (pas de période de comparaison)
export function formatTrend(trend: number | null): string | null {
  if (trend === null) return null;
  const sign = trend > 0 ? "+" : "";
  return `${sign}${trend.toLocaleString("fr-FR")} %`;
}

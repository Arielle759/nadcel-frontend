// 30 -> "30 min", 60 -> "1 h", 90 -> "1 h 30"
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours} h`;

  return `${hours} h ${String(remainingMinutes).padStart(2, "0")}`;
}

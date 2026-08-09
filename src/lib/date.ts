export function formatDateTime(scheduledAt: string): string {
  const date = new Date(scheduledAt);
  const datePart = date.toLocaleDateString("fr-FR");
  const timePart = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${datePart} à ${timePart}`;
}

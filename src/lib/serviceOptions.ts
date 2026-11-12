import { formatCurrency } from "@/lib/currency";
import { formatDuration } from "@/lib/duration";

// Service avec des options (longueur des tresses…) : chaque option a son prix et
// sa durée. Sans option choisie, on affiche une fourchette.
interface WithOptions {
  price: number | string;
  duration: number;
  options?: { price: number | string; duration: number }[];
}

export function hasOptions(service: WithOptions): boolean {
  return (service.options?.length ?? 0) > 0;
}

export function servicePriceLabel(service: WithOptions): string {
  if (!hasOptions(service)) return formatCurrency(Number(service.price));
  const prices = service.options!.map((o) => Number(o.price));
  return `dès ${formatCurrency(Math.min(...prices))}`;
}

export function serviceDurationLabel(service: WithOptions): string {
  if (!hasOptions(service)) return formatDuration(service.duration);
  const durations = service.options!.map((o) => o.duration);
  const min = Math.min(...durations);
  const max = Math.max(...durations);
  return min === max ? formatDuration(min) : `${formatDuration(min)} à ${formatDuration(max)}`;
}

/** Prix le plus élevé d'un service (pour la fourchette de prix d'un salon). */
export function serviceMaxPrice(service: WithOptions): number {
  if (!hasOptions(service)) return Number(service.price);
  return Math.max(...service.options!.map((o) => Number(o.price)));
}

/** « Box braids (Mi-dos) » pour un rendez-vous pris avec une option. */
export function serviceWithOption(name: string, optionLabel?: string | null): string {
  return optionLabel ? `${name} (${optionLabel})` : name;
}

// "23 Rue Mohamed V, Plateau" + "Dakar" -> "Plateau, Dakar"
// Sans virgule dans l'adresse, on ne garde que la ville.
export function salonArea(address: string | null | undefined, city: string): string {
  const parts = (address ?? "").split(",").map((part) => part.trim()).filter(Boolean);
  const area = parts.length > 1 ? parts[parts.length - 1] : null;
  if (!area || area.toLowerCase() === city.toLowerCase()) return city;
  return `${area}, ${city}`;
}

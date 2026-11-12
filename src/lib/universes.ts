// Univers de beauté proposés sur l'accueil et dans le menu « Services ».
// Chaque univers ouvre la recherche de salons sur un terme que l'API sait
// retrouver (catégorie ou nom de service).
export const UNIVERSES = [
  { label: "Coiffure", query: "Coiffure", image: "/images/services/coiffure.jpg" },
  { label: "Barbier", query: "Coupe homme", image: "/images/services/coupe-homme.jpg" },
  { label: "Onglerie", query: "Manucure", image: "/images/services/manicure.jpg" },
  { label: "Soin du visage", query: "Soin", image: "/images/services/soin.jpg" },
  { label: "Massage", query: "Massage", image: "/images/services/massage.jpg" },
  { label: "Épilation", query: "Épilation", image: "/images/services/epilation.jpg" },
] as const;

export function universeHref(query: string): string {
  return `/salons?q=${encodeURIComponent(query)}`;
}

import { assetUrl } from "@/lib/api";
import type { Service } from "@/hooks/useServices";
import { SERVICE_CATEGORY_GROUPS } from "@/lib/serviceCategories";

// Exact service names that need a more specific photo than their category's
// default (e.g. "Coupe Homme" shouldn't share coiffure.jpg's braids photo).
const SERVICE_NAME_IMAGES: Record<string, string> = {
  "coupe homme": "/images/services/coupe-homme.jpg",
};

const CATEGORY_IMAGES: Record<string, string> = {
  coiffure: "/images/services/coiffure.jpg",
  coloration: "/images/services/coloration.jpg",
  manucure: "/images/services/manicure.jpg",
  soin: "/images/services/soin.jpg",
  massage: "/images/services/massage.jpg",
  epilation: "/images/services/epilation.jpg",
};

function normalizeText(value: string): string {
  const withoutAccents = value
    .normalize("NFD")
    .split("")
    .filter((char) => char.codePointAt(0)! < 0x0300 || char.codePointAt(0)! > 0x036f)
    .join("");
  return withoutAccents.toLowerCase().trim();
}

function serviceNameImage(name: string): string | undefined {
  return SERVICE_NAME_IMAGES[normalizeText(name)];
}

// Photo par défaut des catégories proposées dans le formulaire (correspondance exacte).
const LISTED_CATEGORY_IMAGES = new Map(
  SERVICE_CATEGORY_GROUPS.flatMap((g) => g.categories)
    .filter((c) => c.image)
    .map((c) => [normalizeText(c.name), c.image] as const)
);

function categoryFallbackImage(category: string): string | undefined {
  const normalized = normalizeText(category);
  const listed = LISTED_CATEGORY_IMAGES.get(normalized);
  if (listed) return listed;
  // Anciennes catégories courtes (« Coiffure », « Soin »…) ou saisie libre.
  const key = Object.keys(CATEGORY_IMAGES).find((candidate) => normalized.startsWith(candidate));
  return key ? CATEGORY_IMAGES[key] : undefined;
}

const LOCAL_IMAGE_PREFIX = "/images/services/";

// The backend sometimes returns a service.image path that already aliases
// one of our local fallback images (same /images/services/*.jpg convention).
// That must be used as-is — passing it through assetUrl() would prepend the
// API origin and try to fetch it from the backend, where it doesn't exist.
function resolveApiImage(image: string | null | undefined): string | undefined {
  if (!image) return undefined;
  if (image.startsWith(LOCAL_IMAGE_PREFIX)) return image;
  return assetUrl(image);
}

// Priority: a real uploaded photo, then a name-specific stock photo, then the
// category's default. Shared by ServiceCard and the manager service forms so
// the "current photo" preview always matches what the card actually shows.
export function resolveServiceImage(
  service: Pick<Service, "image" | "name" | "category">
): string | undefined {
  return (
    resolveApiImage(service.image) ??
    serviceNameImage(service.name) ??
    categoryFallbackImage(service.category)
  );
}

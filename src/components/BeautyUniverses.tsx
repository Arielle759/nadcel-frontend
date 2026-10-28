import Link from "next/link";
import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import { ui } from "@/lib/ui";

// Chaque univers ouvre la recherche de salons sur un terme que l'API sait
// retrouver (catégorie ou nom de prestation).
const UNIVERSES = [
  { label: "Coiffure", query: "Coiffure", image: "/images/services/coiffure.jpg" },
  { label: "Barbier", query: "Coupe homme", image: "/images/services/coupe-homme.jpg" },
  { label: "Onglerie", query: "Manucure", image: "/images/services/manucure.jpg" },
  { label: "Soin du visage", query: "Soin", image: "/images/services/soin.jpg" },
  { label: "Massage", query: "Massage", image: "/images/services/massage.jpg" },
  { label: "Épilation", query: "Épilation", image: "/images/services/epilation.jpg" },
];

export default function BeautyUniverses() {
  return (
    <section aria-labelledby="universes-title" className="px-6 pt-28 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading id="universes-title" title="Nos univers beauté" muted="Choisissez, on s'occupe du reste." />
          <Link href="/salons" className={ui.buttonSecondary}>
            Tous les salons
          </Link>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {UNIVERSES.map(({ label, query, image }) => (
            <li key={label}>
              <Link
                href={`/salons?q=${encodeURIComponent(query)}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-sage/20 shadow-[0_1px_2px_rgba(45,59,40,0.06),0_10px_28px_rgba(45,59,40,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_6px_rgba(45,59,40,0.08),0_22px_44px_rgba(45,59,40,0.2)]"
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                />
                <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-forest/85 to-transparent" aria-hidden="true" />
                <span className="absolute bottom-4 left-4 right-4 text-base font-semibold text-beige">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

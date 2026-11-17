"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { useSalons } from "@/hooks/useSalons";
import { SalonCard } from "@/components/SalonGrid";
import CardSkeletons from "@/components/CardSkeletons";
import SectionHeading from "@/components/SectionHeading";
import { ui } from "@/lib/ui";

const arrow =
  "flex size-11 items-center justify-center rounded-full bg-white text-brand shadow-[0_1px_2px_rgba(90,50,35,0.06),0_8px_20px_rgba(90,50,35,0.12)] transition-opacity hover:bg-beige disabled:pointer-events-none disabled:opacity-35";

// Salons de l'accueil en carrousel horizontal : défilement au doigt ou à la
// molette (aimanté carte par carte), flèches sur ordinateur, et un lien vers
// la liste complète.
export default function PopularSalons() {
  const { salons, total, loading, error } = useSalons({ per_page: 12 });
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update, salons.length]);

  // Une flèche avance d'environ une « page » de cartes visibles.
  function scroll(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <section aria-labelledby="salons-title" className="pt-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            id="salons-title"
            title="Salons à découvrir"
            description="Chaque salon est vérifié par notre équipe avant d'apparaître ici."
          />
          <div className="flex items-center gap-3">
            {salons.length > 1 && (
              <div className="hidden gap-2 md:flex">
                <button type="button" onClick={() => scroll(-1)} disabled={edges.start} className={arrow}>
                  <ChevronLeft size={20} aria-hidden="true" />
                  <span className="sr-only">Salons précédents</span>
                </button>
                <button type="button" onClick={() => scroll(1)} disabled={edges.end} className={arrow}>
                  <ChevronRight size={20} aria-hidden="true" />
                  <span className="sr-only">Salons suivants</span>
                </button>
              </div>
            )}
            <Link href="/salons" className={ui.buttonSecondary}>
              {total !== null && total > 0 ? `Voir les ${total} salons` : "Voir tous les salons"}
            </Link>
          </div>
        </Reveal>

        {loading ? (
          <CardSkeletons />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : salons.length === 0 ? (
          <p className="text-center text-anthracite/75">Aucun salon disponible pour le moment.</p>
        ) : (
          <ul
            ref={trackRef}
            aria-label="Salons à découvrir"
            className="-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-6 overflow-x-auto px-6 pb-6 [scrollbar-width:none] sm:-mx-10 sm:scroll-px-10 sm:px-10 [&::-webkit-scrollbar]:hidden"
          >
            {salons.map((salon) => (
              <li key={salon.id} className="w-[80%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]">
                <SalonCard salon={salon} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

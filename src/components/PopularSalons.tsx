"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { useSalons } from "@/hooks/useSalons";
import { SalonCard } from "@/components/SalonGrid";
import CardSkeletons from "@/components/CardSkeletons";
import SectionHeading from "@/components/SectionHeading";
import { ui } from "@/lib/ui";

// Vitesse du défilement automatique : une carte toutes les 3 secondes.
const SECONDS_PER_SALON = 3;
// Après un clic sur une flèche, le défilement automatique reprend après ce délai.
const RESUME_AFTER_ARROW_MS = 1500;

const arrow =
  "flex size-11 items-center justify-center rounded-full bg-white text-brand shadow-[0_1px_2px_rgba(90,50,35,0.06),0_8px_20px_rgba(90,50,35,0.12)] transition-colors hover:bg-beige";

// Salons de l'accueil : défilement automatique et continu (la liste est doublée
// pour boucler sans saut), flèches pour avancer ou reculer d'un salon,
// glissement au doigt sur mobile. Le défilement s'arrête au survol, au toucher
// et quand une carte reçoit le focus clavier. Si le système demande moins
// d'animations, il ne démarre pas : la liste se fait défiler à la main.
export default function PopularSalons() {
  const { salons, total, loading, error } = useSalons({ per_page: 12 });
  const trackRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const resumeAtRef = useRef(0);
  const loop = salons.length > 2;

  useEffect(() => {
    const el = trackRef.current;
    if (!el || !loop) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let last = performance.now();
    let position = el.scrollLeft;
    const tick = (now: number) => {
      const dt = Math.min(now - last, 64); // onglet en arrière-plan : pas de saut
      last = now;
      const half = el.scrollWidth / 2;
      const card = (el.querySelector("li") as HTMLElement | null)?.offsetWidth ?? 340;
      if (!hoverRef.current && now >= resumeAtRef.current && half > el.clientWidth) {
        position += (card / SECONDS_PER_SALON) * (dt / 1000);
        if (position >= half) position -= half;
        el.scrollLeft = position;
      } else {
        position = el.scrollLeft; // reprend là où l'utilisateur a laissé la liste
        if (position >= half) {
          position -= half;
          el.scrollLeft = position;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [loop, salons.length]);

  // Une flèche avance ou recule d'une carte, puis l'automatique reprend.
  function step(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = (el.querySelector("li") as HTMLElement | null)?.offsetWidth ?? 340;
    const half = el.scrollWidth / 2;
    if (direction === -1 && el.scrollLeft < card) el.scrollLeft += half; // boucle vers l'arrière
    resumeAtRef.current = performance.now() + RESUME_AFTER_ARROW_MS;
    el.scrollBy({ left: direction * card, behavior: "smooth" });
  }

  const pause = () => (hoverRef.current = true);
  const resume = () => (hoverRef.current = false);

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
            {loop && (
              <div className="hidden gap-2 md:flex">
                <button type="button" onClick={() => step(-1)} className={arrow}>
                  <ChevronLeft size={20} aria-hidden="true" />
                  <span className="sr-only">Salon précédent</span>
                </button>
                <button type="button" onClick={() => step(1)} className={arrow}>
                  <ChevronRight size={20} aria-hidden="true" />
                  <span className="sr-only">Salon suivant</span>
                </button>
              </div>
            )}
            <Link href="/salons" className={ui.buttonSecondary}>
              {total !== null && total > 0 ? `Voir les ${total} salons` : "Voir tous les salons"}
            </Link>
          </div>
        </Reveal>
      </div>

      {loading ? (
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <CardSkeletons />
        </div>
      ) : error ? (
        <p className="mx-auto max-w-6xl px-6 text-sm text-red-600 sm:px-10">{error}</p>
      ) : salons.length === 0 ? (
        <p className="text-center text-anthracite/75">Aucun salon disponible pour le moment.</p>
      ) : (
        <div
          ref={trackRef}
          onMouseEnter={pause}
          onMouseLeave={resume}
          onTouchStart={pause}
          onTouchEnd={resume}
          onFocus={pause}
          onBlur={resume}
          className="overflow-x-auto [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] [&::-webkit-scrollbar]:hidden"
        >
          <ul aria-label="Salons à découvrir" className="flex w-max pb-6">
            {(loop ? [...salons, ...salons] : salons).map((salon, index) => {
              const copy = index >= salons.length;
              return (
                <li
                  key={`${salon.id}-${copy ? "b" : "a"}`}
                  // Deuxième exemplaire : décor de la boucle, ignoré au clavier et à la lecture d'écran.
                  aria-hidden={copy || undefined}
                  inert={copy || undefined}
                  className="w-[280px] shrink-0 pr-6 sm:w-[340px]"
                >
                  <SalonCard salon={salon} />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

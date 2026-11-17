"use client";

import Link from "next/link";
import { useState } from "react";
import { Pause, Play } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { useSalons } from "@/hooks/useSalons";
import { SalonCard } from "@/components/SalonGrid";
import CardSkeletons from "@/components/CardSkeletons";
import SectionHeading from "@/components/SectionHeading";
import { ui } from "@/lib/ui";

// Durée d'un tour complet, proportionnelle au nombre de salons (vitesse constante).
const SECONDS_PER_SALON = 6;

// Salons de l'accueil en défilement automatique et continu (la liste est
// doublée pour boucler sans saut). Le défilement s'arrête au survol, quand
// une carte reçoit le focus clavier, ou avec le bouton pause (WCAG 2.2.2).
// Si le système demande moins d'animations, la liste reste immobile et se
// fait défiler à la main.
export default function PopularSalons() {
  const { salons, total, loading, error } = useSalons({ per_page: 12 });
  const [paused, setPaused] = useState(false);
  const loop = salons.length > 2;

  return (
    <section aria-labelledby="salons-title" className="pt-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            id="salons-title"
            title="Salons à découvrir"
            description="Chaque salon est vérifié par notre équipe avant d'apparaître ici."
          />
          <Link href="/salons" className={ui.buttonSecondary}>
            {total !== null && total > 0 ? `Voir les ${total} salons` : "Voir tous les salons"}
          </Link>
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
        <div className="group/marquee relative">
          <div className="overflow-hidden motion-reduce:overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
            <ul
              aria-label="Salons à découvrir"
              className={`flex w-max pb-6 ${
                loop
                  ? "animate-[marquee_var(--marquee-duration)_linear_infinite] group-hover/marquee:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none"
                  : ""
              } ${paused ? "[animation-play-state:paused]" : ""}`}
              style={{ "--marquee-duration": `${salons.length * SECONDS_PER_SALON}s` } as React.CSSProperties}
            >
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
          {loop && (
            <button
              type="button"
              onClick={() => setPaused((v) => !v)}
              aria-pressed={paused}
              className="absolute bottom-8 right-6 flex size-9 items-center justify-center rounded-full bg-white/90 text-brand shadow-[0_4px_12px_rgba(59,42,36,0.15)] transition-opacity hover:bg-white motion-reduce:hidden sm:right-10"
            >
              {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
              <span className="sr-only">{paused ? "Reprendre le défilement des salons" : "Mettre en pause le défilement des salons"}</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
}

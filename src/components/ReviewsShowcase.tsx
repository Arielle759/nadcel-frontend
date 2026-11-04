"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import { ui } from "@/lib/ui";

interface HighlightedReview {
  id: number;
  rating: number;
  comment: string;
  author: string;
  salon: { id: number; name: string };
}

const ROTATE_MS = 7000;
const MAX_LENGTH = 260;

function excerpt(text: string): string {
  if (text.length <= MAX_LENGTH) return text;
  return `${text.slice(0, MAX_LENGTH).replace(/\s+\S*$/, "")}…`;
}

// Avis réels laissés après un rendez-vous terminé (4 ou 5 étoiles, avec un
// commentaire). La section n'apparaît pas tant qu'il n'y en a aucun : aucun
// avis n'est inventé. Les avis se relaient seuls, avec une pause au survol,
// au clavier et un bouton Pause (WCAG 2.2.2).
export default function ReviewsShowcase() {
  const [reviews, setReviews] = useState<HighlightedReview[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get<{ data: HighlightedReview[] }>("/reviews/highlights")
      .then(({ data }) => active && setReviews(data.data))
      .catch(() => active && setReviews([]));
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => {
      active = false;
      query.removeEventListener("change", sync);
    };
  }, []);

  const count = reviews.length;
  const autoplay = count > 1 && !paused && !hovered && !reducedMotion;

  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((current) => (current + 1) % count);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [autoplay, count]);

  if (count === 0) return null;

  function go(delta: number) {
    setIndex((current) => (current + delta + count) % count);
  }

  return (
    <section aria-labelledby="reviews-title" className="px-6 pt-28 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading
            id="reviews-title"
            title="Les avis après rendez-vous"
            description="Seules les personnes venues au salon peuvent laisser un avis, une fois la prestation terminée."
          />
        </Reveal>

        <Reveal
          delay={120}
          className={`${ui.surface} mt-12 rounded-3xl p-7 sm:p-10`}
          aria-roledescription="carrousel"
          aria-label="Avis de clients"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
        >
          {/* Tous les avis occupent la même case : la carte prend la hauteur du
              plus long et ne saute pas d'un avis à l'autre. */}
          <div className="grid" aria-live={autoplay ? "off" : "polite"}>
            {reviews.map((review, i) => {
              const current = i === index;
              return (
                <figure
                  key={review.id}
                  aria-hidden={!current}
                  className={`[grid-area:1/1] transition-all duration-700 ease-out ${
                    current ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
                  }`}
                >
                  <div className="flex gap-1" role="img" aria-label={`${review.rating} sur 5`}>
                    {Array.from({ length: 5 }, (_, star) => (
                      <Star
                        key={star}
                        size={18}
                        aria-hidden="true"
                        className={star < review.rating ? "fill-champagne text-champagne" : "text-sable"}
                      />
                    ))}
                  </div>
                  <blockquote className="mt-5 max-w-3xl font-heading text-2xl leading-snug text-brand sm:text-[1.75rem]">
                    « {excerpt(review.comment)} »
                  </blockquote>
                  <figcaption className="mt-6 text-sm text-anthracite/75">
                    <span className="font-semibold text-anthracite">{review.author}</span>, chez{" "}
                    <Link href={`/salons/${review.salon.id}`} className={ui.textLink} tabIndex={current ? 0 : -1}>
                      {review.salon.name}
                    </Link>
                  </figcaption>
                </figure>
              );
            })}
          </div>

          {count > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm tabular-nums text-anthracite/60">
                Avis {index + 1} sur {count}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => go(-1)} className={`${ui.buttonSecondary} min-h-10 px-4`}>
                  Précédent
                </button>
                <button type="button" onClick={() => go(1)} className={`${ui.buttonSecondary} min-h-10 px-4`}>
                  Suivant
                </button>
                {!reducedMotion && (
                  <button
                    type="button"
                    onClick={() => setPaused((value) => !value)}
                    aria-pressed={paused}
                    className={`${ui.buttonSecondary} min-h-10 px-4`}
                  >
                    {paused ? "Reprendre" : "Pause"}
                  </button>
                )}
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

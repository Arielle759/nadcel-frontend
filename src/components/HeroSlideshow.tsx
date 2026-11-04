"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SLIDES = [
  { src: "/images/services/soin.jpg", position: "object-center" },
  { src: "/images/services/coiffure.jpg", position: "object-center" },
  { src: "/images/services/colorationtrois.jpg", position: "object-center" },
  { src: "/images/services/massage.jpg", position: "object-center" },
];

const SLIDE_MS = 6500;

// Photos du bandeau d'accueil qui se relaient en fondu, avec un lent zoom.
// Décoratives (alt vide). Le défilement s'arrête quand l'onglet est caché et
// n'a pas lieu si l'utilisateur a demandé à réduire les animations.
export default function HeroSlideshow() {
  const [step, setStep] = useState(0);
  const index = step % SLIDES.length;
  const previous = step > 0 ? (step - 1) % SLIDES.length : null;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setStep((current) => current + 1);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {SLIDES.map((slide, i) => {
        const active = i === index;
        // La photo qui s'efface garde son zoom pendant le fondu (pas de saut).
        const zooming = active || i === previous;
        return (
          <div
            key={slide.src}
            className="absolute inset-0 overflow-hidden transition-opacity duration-[1400ms] ease-in-out"
            style={{ opacity: active ? 1 : 0 }}
          >
            <Image
              src={slide.src}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className={`object-cover ${slide.position} ${zooming ? "hero-slide-zoom" : ""}`}
            />
          </div>
        );
      })}
    </div>
  );
}

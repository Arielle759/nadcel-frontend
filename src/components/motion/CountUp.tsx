"use client";

import { useLayoutEffect, useRef } from "react";

interface CountUpProps {
  value: number;
  format?: (value: number) => string;
  durationMs?: number;
}

const defaultFormat = (value: number) => Math.round(value).toLocaleString("fr-FR");

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Chiffre qui défile jusqu'à sa valeur quand il apparaît à l'écran.
// La vraie valeur est écrite dans le HTML (lecteurs d'écran, JavaScript lent) ;
// l'animation ne fait que la ré-afficher progressivement.
export default function CountUp({ value, format = defaultFormat, durationMs = 1100 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const shownRef = useRef<number | null>(null);
  const formatRef = useRef(format);

  // Toujours la dernière fonction de formatage, sans relancer l'animation.
  useLayoutEffect(() => {
    formatRef.current = format;
  });

  useLayoutEffect(() => {
    const element = ref.current;
    const text = element?.firstChild;
    if (!element || !text) return;

    // Premier affichage : la valeur finale tout de suite (jamais « 0 » sur une
    // capture ou une connexion lente). L'animation ne sert qu'aux changements.
    const from = shownRef.current ?? value;
    const write = (n: number) => {
      text.nodeValue = formatRef.current(n);
    };

    if (from === value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      shownRef.current = value;
      write(value);
      return;
    }

    let frame = 0;
    let observer: IntersectionObserver | null = null;
    write(from);

    const run = () => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        const current = from + (value - from) * easeOutCubic(t);
        shownRef.current = current;
        write(t < 1 ? current : value);
        if (t < 1) frame = requestAnimationFrame(step);
        else shownRef.current = value;
      };
      frame = requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer?.disconnect();
          run();
        }
      });
      observer.observe(element);
    } else {
      run();
    }

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      // Démontage ou nouvelle valeur : on repart de ce qui est affiché.
      write(shownRef.current ?? value);
    };
  }, [value, durationMs]);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {format(value)}
      </span>
      <span className="sr-only">{format(value)}</span>
    </>
  );
}

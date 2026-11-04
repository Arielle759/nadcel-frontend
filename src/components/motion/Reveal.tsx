"use client";

import { useLayoutEffect, useRef } from "react";

type RevealTag = "div" | "li" | "section";

interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  as?: RevealTag;
  // Décalage en millisecondes, pour faire apparaître des cartes l'une après l'autre.
  delay?: number;
}

// Apparition en douceur au défilement.
// Le contenu est rendu visible côté serveur : il n'est masqué qu'une fois le
// JavaScript chargé, et seulement s'il est encore sous l'écran. Une connexion
// lente ou un JavaScript bloqué n'empêche donc jamais de le lire.
// Rien ne bouge si l'utilisateur a demandé à réduire les animations.
export default function Reveal({ as = "div", delay = 0, style, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Déjà à l'écran au chargement : on ne le cache pas.
    if (element.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    element.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.dataset.reveal = "shown";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag
      {...rest}
      ref={ref as React.RefObject<HTMLDivElement & HTMLLIElement>}
      style={{ ...style, "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

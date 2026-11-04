"use client";

import { MotionConfig } from "framer-motion";

// Toutes les animations framer-motion respectent le réglage « Réduire les
// animations » du téléphone ou de l'ordinateur (WCAG 2.3.3).
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

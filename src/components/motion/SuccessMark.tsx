"use client";

import { motion } from "framer-motion";

// Coche de confirmation : le cercle apparaît, puis la coche se trace.
// Décorative : le texte à côté porte le message.
export default function SuccessMark({ size = 64 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="shrink-0"
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      <circle cx="32" cy="32" r="32" fill="var(--color-success)" />
      <motion.path
        d="M19 33.5 L28 42 L45 24"
        fill="none"
        stroke="var(--color-beige)"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.25, duration: 0.45, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

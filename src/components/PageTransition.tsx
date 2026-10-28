"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

// Simple apparition à chaque changement de page. Pas d'animation de sortie :
// avec AnimatePresence (mode "wait"), la nouvelle page était montée une première
// fois dans l'ancienne pendant la sortie, ce qui lançait ses effets deux fois
// (appels API en double, brouillon de réservation consommé puis perdu).
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-1 flex-col"
    >
      {children}
    </motion.div>
  );
}

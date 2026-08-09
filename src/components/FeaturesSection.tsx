"use client";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path
        d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BadgeCheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path
        d="M12 2 14.5 4.5 18 4l.5 3.5L21 10l-2 3 2 3-2.5 2.5L18 22l-3.5-.5L12 24l-2.5-2.5L6 22l-.5-3.5L3 16l2-3-2-3 2.5-2.5L6 4l3.5.5L12 2Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12.5 11 14.5 15.5 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path
        d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const FEATURES = [
  {
    title: "Rapide",
    description: "Réservez votre rendez-vous en moins de 2 minutes.",
    Icon: BoltIcon,
  },
  {
    title: "Certifiés",
    description: "Tous nos salons partenaires sont vérifiés et certifiés.",
    Icon: BadgeCheckIcon,
  },
  {
    title: "Avis authentiques",
    description: "Des retours vérifiés de vrais clients, sans filtre.",
    Icon: StarIcon,
  },
];

export default function FeaturesSection() {
  return (
    <section className="px-6 pt-20 pb-8 sm:px-16">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={containerVariants}
        className="grid grid-cols-1 gap-10 sm:grid-cols-3"
      >
        {FEATURES.map(({ title, description, Icon }) => (
          <motion.div
            key={title}
            variants={itemVariants}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/20 text-link-sage">
              <Icon className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-anthracite">{title}</h3>
            <p className="text-sm text-anthracite/75">{description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

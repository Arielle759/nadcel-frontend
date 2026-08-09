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
    <section className="bg-beige px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">Pourquoi Nadcel</span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-forest sm:text-4xl">Votre rendez-vous beauté, sans complication</h2>
        <p className="mt-4 leading-7 text-anthracite/70">Une expérience pensée pour vous faire gagner du temps et réserver en toute confiance.</p>
      </div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={containerVariants}
        className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-3"
      >
        {FEATURES.map(({ title, description, Icon }) => (
          <motion.div
            key={title}
            variants={itemVariants}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="group flex flex-col items-center gap-4 rounded-2xl border border-sage/20 bg-gradient-to-b from-beige to-sage/10 p-7 text-center shadow-[0_10px_30px_rgba(45,59,40,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(45,59,40,0.1)]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-beige shadow-md transition-transform group-hover:rotate-3 group-hover:scale-105">
              <Icon className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold text-forest">{title}</h3>
            <p className="text-sm leading-6 text-anthracite/70">{description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { ui } from "@/lib/ui";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const SUGGESTIONS = ["Coiffure", "Manucure", "Massage", "Plateau", "Almadies"];

export default function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Une suggestion remplit seulement le champ : la redirection n'a lieu
  // qu'au clic sur « Rechercher » (ou Entrée). Un second clic la retire.
  function pickSuggestion(term: string) {
    setQuery((current) => (current.trim().toLowerCase() === term.toLowerCase() ? "" : term));
    inputRef.current?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/salons?q=${encodeURIComponent(value)}` : "/salons");
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative flex min-h-[620px] overflow-hidden px-6 py-24 sm:px-10 lg:min-h-[680px] lg:px-16"
    >
      <Image
        src="/images/services/soin.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-forest/95 via-forest/75 to-forest/15" />

      <div className="relative mx-auto flex w-full max-w-6xl items-center">
        <div className="max-w-2xl">
          <motion.p variants={itemVariants} className="mb-5 text-sm font-medium text-beige/75">
            Dakar, Thiès, Saint-Louis et Mbour
          </motion.p>
          <motion.h1
            variants={itemVariants}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-4xl font-semibold leading-[1.06] tracking-tight text-beige sm:text-6xl"
          >
            Le bon salon, au bon moment, près de chez vous.
          </motion.h1>
          <motion.p
            variants={itemVariants}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-6 max-w-xl text-lg leading-8 text-beige/80"
          >
            Comparez les salons vérifiés, voyez les créneaux libres et réservez en ligne. Vous payez au salon.
          </motion.p>

          <motion.form
            variants={itemVariants}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onSubmit={handleSubmit}
            role="search"
            className="mt-9 flex flex-col gap-2 rounded-2xl bg-beige p-2 shadow-[0_18px_50px_rgba(20,30,18,0.25)] sm:flex-row sm:items-center"
          >
            <label htmlFor="hero-search" className="sr-only">
              Prestation, salon, quartier ou ville
            </label>
            <div className="flex flex-1 items-center gap-3 px-4">
              <Search size={18} className="shrink-0 text-anthracite/50" aria-hidden="true" />
              <input
                ref={inputRef}
                id="hero-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Prestation, salon, quartier ou ville"
                autoComplete="off"
                className="h-12 w-full bg-transparent text-base text-anthracite outline-none placeholder:text-anthracite/50"
              />
            </div>
            <button type="submit" className={`${ui.buttonPrimary} h-12 px-7`}>
              Rechercher
            </button>
          </motion.form>

          <motion.div variants={itemVariants} className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-beige/70">Par exemple :</span>
            {SUGGESTIONS.map((term) => {
              const selected = query.trim().toLowerCase() === term.toLowerCase();
              return (
                <button
                  key={term}
                  type="button"
                  onClick={() => pickSuggestion(term)}
                  aria-pressed={selected}
                  className={`rounded-full border px-3 py-1 transition-colors ${
                    selected
                      ? "border-beige bg-beige font-semibold text-forest"
                      : "border-beige/25 text-beige/90 hover:border-beige/60 hover:text-beige"
                  }`}
                >
                  {term}
                </button>
              );
            })}
          </motion.div>

          <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center gap-3 text-sm text-beige/75">
            <span>Vous gérez un salon ?</span>
            <Link href="/devenir-partenaire" className={`${ui.buttonGhostOnDark} min-h-9 px-4`}>
              Inscrivez-le gratuitement
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

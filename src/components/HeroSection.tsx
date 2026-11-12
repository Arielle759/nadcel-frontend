"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import HeroSlideshow from "@/components/HeroSlideshow";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import SearchSuggest from "@/components/SearchSuggest";
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
      className="relative z-20 flex min-h-[620px] px-6 py-24 sm:px-10 lg:min-h-[680px] lg:px-16"
    >
      {/* Le fond est découpé à part : la liste de suggestions peut ainsi
          déborder sous la section sans être coupée. */}
      <div className="absolute inset-0 overflow-hidden">
        <HeroSlideshow />
        <div className="absolute inset-0 bg-gradient-to-r from-brand/95 via-brand/75 to-brand/15" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl items-center">
        <div className="max-w-2xl">
          <motion.p variants={itemVariants} className="mb-5 text-sm font-medium text-beige/75">
            Salons vérifiés, partout au Sénégal
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
            className="mt-9 flex flex-col gap-2 rounded-2xl bg-beige p-2 shadow-[0_18px_50px_rgba(40,25,18,0.25)] ring-brand-soft focus-within:ring-2 sm:flex-row sm:items-center"
          >
            <label htmlFor="hero-search" className="sr-only">
              Service, salon, quartier ou ville
            </label>
            <div className="flex flex-1 items-center gap-3 px-4">
              <Search size={18} className="shrink-0 text-anthracite/75" aria-hidden="true" />
              <SearchSuggest
                inputRef={inputRef}
                id="hero-search"
                value={query}
                onChange={setQuery}
                onPickTerm={(term) => router.push(`/salons?q=${encodeURIComponent(term)}`)}
                placeholder="Service, salon, quartier ou ville"
                className="h-12 w-full bg-transparent text-base text-anthracite outline-none focus-visible:outline-none placeholder:text-anthracite/75 [&::-webkit-search-cancel-button]:hidden"
              />
            </div>
            <button type="submit" className={`${ui.buttonPrimary} h-12 px-7`}>
              Rechercher
            </button>
          </motion.form>

          <motion.div variants={itemVariants} className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-beige/70">Par exemple :</span>
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
                      ? "border-beige bg-beige font-semibold text-brand"
                      : "border-beige/25 text-beige/90 hover:border-beige/60 hover:text-beige"
                  }`}
                >
                  {term}
                </button>
              );
            })}
          </motion.div>

          <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center gap-3 text-sm text-beige/75">
            <span>Vous avez un salon ?</span>
            <Link href="/devenir-partenaire" className={`${ui.buttonGhostOnDark} min-h-9 px-4`}>
              Inscrivez-le gratuitement
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

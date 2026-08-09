"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Scissors,
  Palette,
  Hand,
  Sparkles,
  Waves,
  Zap,
  Star,
  MapPin,
  ShieldCheck,
  CalendarX,
  Clock,
  Mail,
  ArrowUpRight,
} from "lucide-react";
import { useSalons } from "@/hooks/useSalons";
import { assetUrl } from "@/lib/api";
import SalonCategoryTags from "@/components/SalonCategoryTags";
import CardSkeletons from "@/components/CardSkeletons";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const REASSURANCE_ITEMS = [
  { icon: ShieldCheck, label: "Réservation sécurisée" },
  { icon: CalendarX, label: "Annulation facile" },
  { icon: Clock, label: "Créneaux vérifiés en temps réel" },
  { icon: Mail, label: "Confirmation par email" },
];

const CATEGORIES = [
  { label: "Coiffure", icon: Scissors },
  { label: "Coloration", icon: Palette },
  { label: "Manucure", icon: Hand },
  { label: "Soin", icon: Sparkles },
  { label: "Massage", icon: Waves },
  { label: "Épilation", icon: Zap },
];

export default function PopularSalons() {
  const { salons, loading, error } = useSalons();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [topRated, setTopRated] = useState(false);

  const trimmedQuery = query.trim().toLowerCase();
  const searched = trimmedQuery
    ? salons.filter(
        (salon) =>
          salon.name.toLowerCase().includes(trimmedQuery) ||
          salon.city.toLowerCase().includes(trimmedQuery) ||
          salon.address.toLowerCase().includes(trimmedQuery) ||
          salon.service_categories.some((cat) => cat.toLowerCase().includes(trimmedQuery))
      )
    : salons;

  const ordered = topRated
    ? [...searched].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
    : searched;

  const filtered = trimmedQuery ? ordered : ordered.slice(0, 4);

  return (
    <section className="border-t border-sage/20 px-6 pt-8 pb-20 sm:px-16">
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-forest">
          Salons populaires
        </h2>
        <p className="text-anthracite/75">
          Découvrez les salons les mieux notés près de chez vous.
        </p>
        <div className="flex w-full flex-col items-center gap-4 rounded-2xl bg-gradient-to-b from-sage/10 to-transparent px-4 py-6">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setTopRated((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                topRated
                  ? "border-dark-sage bg-dark-sage text-beige"
                  : "border-sage/40 bg-beige text-forest hover:border-dark-sage hover:bg-sage/10"
              }`}
            >
              <Star size={16} />
              Les mieux notés
            </button>

            <button
              type="button"
              disabled
              title="Bientôt disponible"
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-sage/20 bg-beige/60 px-4 py-2 text-sm font-medium text-anthracite/40"
            >
              <MapPin size={16} />
              À proximité
            </button>

            {CATEGORIES.map(({ label, icon: Icon }) => {
              const active = query === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setQuery(label)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-dark-sage bg-dark-sage text-beige"
                      : "border-sage/40 bg-beige text-forest hover:border-dark-sage hover:bg-sage/10"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un salon..."
            className="w-full max-w-sm rounded-full border border-sage/40 bg-beige px-5 py-2.5 text-sm text-anthracite outline-none focus:border-dark-sage"
          />
        </div>
      </div>

      {loading && <CardSkeletons count={4} />}
      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-center text-anthracite/75">
          {trimmedQuery ? "Aucun salon ne correspond à votre recherche." : "Aucun salon disponible pour le moment."}
        </p>
      )}

      {!loading && !error && <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {filtered.map((salon) => (
          <motion.div key={salon.id} variants={cardVariants} transition={{ duration: 0.4, ease: "easeOut" }}>
            <div className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-sage/20 bg-beige shadow-[0_12px_35px_rgba(45,59,40,0.08)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-sage/40 hover:shadow-[0_18px_45px_rgba(45,59,40,0.14)]">
              <Link href={`/salons/${salon.id}`} className="flex h-full flex-col">
                <div className="relative flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-sage/40 to-dark-sage/40 text-4xl">
                  {assetUrl(salon.cover ?? salon.logo) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={assetUrl(salon.cover ?? salon.logo)}
                      alt={salon.name}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <span>💆</span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-forest/45 to-transparent" />
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-beige/95 px-3 py-1.5 text-xs font-semibold text-forest shadow-sm backdrop-blur-sm">
                    <Star size={14} className="fill-champagne text-champagne" aria-hidden="true" />
                    {salon.rating || "Nouveau"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="text-lg font-semibold text-forest">{salon.name}</h3>
                  <p className="inline-flex items-center gap-1.5 text-sm text-anthracite/70">
                    <MapPin size={15} className="text-terracotta" aria-hidden="true" />
                    {salon.city}
                  </p>
                  <SalonCategoryTags categories={salon.service_categories} />
                  <span className="mt-auto inline-flex w-fit items-center gap-1.5 pt-3 text-sm font-semibold text-link-sage transition-colors group-hover:text-forest">
                    Découvrir
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>}

      <div className="mt-14 grid grid-cols-2 gap-6 border-t border-sage/20 pt-10 md:grid-cols-4">
        {REASSURANCE_ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <Icon size={20} className="text-link-sage" />
            <span className="text-sm text-anthracite/75">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSalons } from "@/hooks/useSalons";
import { assetUrl } from "@/lib/api";
import SalonCategoryTags from "@/components/SalonCategoryTags";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function SalonGrid() {
  const { salons, loading, error } = useSalons();

  if (loading) {
    return <p className="text-anthracite/75">Chargement des salons...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (salons.length === 0) {
    return <p className="text-anthracite/75">Aucun salon disponible.</p>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={containerVariants}
      className="grid w-full grid-cols-1 gap-6 border-t-4 border-t-champagne pt-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {salons.map((salon) => (
        <motion.div
          key={salon.id}
          variants={cardVariants}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-sage/30 bg-beige shadow-md transition-shadow duration-300 ease-out hover:shadow-lg"
        >
          <div className="flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-sage/40 to-dark-sage/40 text-4xl">
            {assetUrl(salon.cover ?? salon.logo) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={assetUrl(salon.cover ?? salon.logo)}
                alt={salon.name}
                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              />
            ) : (
              <span>💆</span>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-3 p-6">
            <h2 className="text-lg font-semibold text-anthracite">{salon.name}</h2>
            <p className="text-xs text-anthracite/75">{salon.city}</p>
            <SalonCategoryTags categories={salon.service_categories} />
            <p className="flex-1 text-sm text-anthracite/75">{salon.description}</p>
            <Link
              href={`/salons/${salon.id}`}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-dark-sage px-4 py-2 text-sm font-medium text-beige transition-colors hover:bg-sage"
            >
              Voir détails
            </Link>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Salon } from "@/hooks/useSalons";
import { assetUrl } from "@/lib/api";
import SalonCategoryTags from "@/components/SalonCategoryTags";
import SalonRating from "@/components/SalonRating";
import CardSkeletons from "@/components/CardSkeletons";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function SalonGrid({
  salons,
  loading,
  error,
  emptyMessage = "Aucun salon disponible.",
}: {
  salons: Salon[];
  loading: boolean;
  error: string | null;
  emptyMessage?: string;
}) {
  if (loading) {
    return <CardSkeletons />;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (salons.length === 0) {
    return <p className="text-center text-anthracite/75">{emptyMessage}</p>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={containerVariants}
      className="grid w-full grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3"
    >
      {salons.map((salon) => (
        <motion.div
          key={salon.id}
          variants={cardVariants}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-sage/20 bg-beige shadow-[0_12px_35px_rgba(45,59,40,0.08)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-sage/40 hover:shadow-[0_18px_45px_rgba(45,59,40,0.14)]"
        >
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
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-forest/45 to-transparent" />
              <span className="absolute bottom-3 right-3 rounded-full bg-beige/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                <SalonRating average={salon.reviews_avg_rating} count={salon.reviews_count} />
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-forest">{salon.name}</h2>
                <p className="inline-flex items-center gap-1.5 text-sm text-anthracite/70">
                  <MapPin size={15} className="text-terracotta" aria-hidden="true" />
                  {salon.city}
                </p>
              </div>
              <SalonCategoryTags categories={salon.service_categories} />
              <p className="line-clamp-3 flex-1 text-sm leading-6 text-anthracite/75">{salon.description}</p>
              <span className="mt-2 inline-flex w-fit items-center gap-2 text-sm font-semibold text-link-sage transition-colors group-hover:text-forest">
                Découvrir le salon
                <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

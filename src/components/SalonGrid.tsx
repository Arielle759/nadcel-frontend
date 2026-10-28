"use client";

import Link from "next/link";
import type { Salon } from "@/hooks/useSalons";
import { assetUrl } from "@/lib/api";
import SalonCategoryTags from "@/components/SalonCategoryTags";
import SalonRating from "@/components/SalonRating";
import CardSkeletons from "@/components/CardSkeletons";
import { salonArea } from "@/lib/salonArea";

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
    <div
      className="grid w-full grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3"
    >
      {salons.map((salon) => (
        <div
          key={salon.id}
          className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-sage/20 bg-beige shadow-[0_8px_24px_rgba(45,59,40,0.06)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-[0_16px_40px_rgba(45,59,40,0.12)]"
        >
          <Link href={`/salons/${salon.id}`} className="flex h-full flex-col">
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-sage/20">
              {assetUrl(salon.cover ?? salon.logo) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={assetUrl(salon.cover ?? salon.logo)}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-heading text-6xl font-semibold text-forest/30" aria-hidden="true">
                    {salon.name.charAt(0)}
                  </span>
                </div>
              )}
              {salon.reviews_count > 0 && (
                <span className="absolute bottom-3 left-3 rounded-full bg-beige/95 px-3 py-1.5 shadow-sm">
                  <SalonRating average={salon.reviews_avg_rating} count={salon.reviews_count} />
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
              <div>
                <h3 className="text-xl font-semibold text-forest">{salon.name}</h3>
                <p className="mt-1 text-sm text-anthracite/75">{salonArea(salon.address, salon.city)}</p>
              </div>
              <SalonCategoryTags categories={salon.service_categories} />
              <p className="line-clamp-2 flex-1 text-sm leading-6 text-anthracite/75">{salon.description}</p>
              <span className="mt-1 text-sm font-semibold text-forest underline-offset-4 group-hover:underline">
                Voir le salon et réserver
              </span>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

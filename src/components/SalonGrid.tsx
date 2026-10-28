"use client";

import Link from "next/link";
import type { Salon } from "@/hooks/useSalons";
import { assetUrl } from "@/lib/api";
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
    <div className="grid w-full grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {salons.map((salon) => {
        const cover = assetUrl(salon.cover ?? salon.logo);
        const categories = salon.service_categories.slice(0, 3).join(", ");
        return (
          <Link key={salon.id} href={`/salons/${salon.id}`} className="group flex min-w-0 flex-col">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-sage/20 shadow-[0_1px_2px_rgba(45,59,40,0.06),0_10px_28px_rgba(45,59,40,0.10)] transition-shadow duration-300 group-hover:shadow-[0_2px_6px_rgba(45,59,40,0.08),0_20px_44px_rgba(45,59,40,0.18)]">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-heading text-6xl font-semibold text-forest/30" aria-hidden="true">
                    {salon.name.charAt(0)}
                  </span>
                </div>
              )}
              {salon.reviews_count > 0 && (
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 shadow-sm">
                  <SalonRating average={salon.reviews_avg_rating} count={salon.reviews_count} />
                </span>
              )}
            </div>
            <div className="mt-4 px-1">
              <h3 className="text-xl font-semibold text-forest transition-colors group-hover:text-dark-sage">{salon.name}</h3>
              <p className="mt-1 text-sm text-anthracite/75">
                {salonArea(salon.address, salon.city)}
                {categories && <span className="text-anthracite/60">, {categories.toLowerCase()}</span>}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

"use client";

import { Building2, ShieldCheck, Star, Users } from "lucide-react";
import { useSalons } from "@/hooks/useSalons";

export default function TrustSection() {
  const { salons } = useSalons();

  const salonsCount = salons.length > 0 ? salons.length : 9;

  const ratings = salons
    .map((salon) => Number(salon.rating))
    .filter((rating) => !Number.isNaN(rating) && rating > 0);
  const averageRating =
    ratings.length > 0
      ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
      : "4.5";

  const STATS = [
    { icon: Building2, value: `${salonsCount}`, label: "Salons partenaires" },
    { icon: Star, value: `${averageRating}/5`, label: "Avis clients" },
    { icon: Users, value: "40+", label: "Clientes satisfaites" },
    { icon: ShieldCheck, value: null, label: "Paiement sécurisé" },
  ];

  return (
    <section className="bg-sage/10 px-6 py-10 sm:px-16">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {STATS.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <Icon className="h-7 w-7 text-link-sage" />
            {value && <span className="text-2xl font-bold text-forest">{value}</span>}
            <span className="text-sm text-anthracite/75">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

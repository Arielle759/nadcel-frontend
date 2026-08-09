import Image from "next/image";
import { Banknote, Clock3, Sparkles } from "lucide-react";
import type { Service } from "@/hooks/useServices";
import { resolveServiceImage } from "@/lib/serviceImage";
import { formatCurrency } from "@/lib/currency";
import { formatDuration } from "@/lib/duration";

export default function ServiceCard({ service }: { service: Service }) {
  const imageSrc = resolveServiceImage(service);

  return (
    <div className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-sage/20 bg-beige shadow-[0_10px_30px_rgba(45,59,40,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-sage/40 hover:shadow-[0_16px_38px_rgba(45,59,40,0.12)]">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gradient-to-br from-sage/40 to-dark-sage/40">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={service.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Sparkles size={40} className="text-beige/80" aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-forest/35 to-transparent" />
      </div>
      <div className="flex min-h-[7.5rem] flex-1 flex-col justify-center gap-3 p-5">
        <p className="line-clamp-2 text-lg font-semibold text-forest">{service.name}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-anthracite/75">
          <span className="inline-flex items-center gap-1.5 font-semibold text-anthracite">
            <Banknote size={16} className="text-link-sage" aria-hidden="true" />
            {formatCurrency(service.price)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={16} className="text-terracotta" aria-hidden="true" />
            {formatDuration(service.duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import type { Service } from "@/hooks/useServices";
import { resolveServiceImage } from "@/lib/serviceImage";
import { formatCurrency } from "@/lib/currency";
import { formatDuration } from "@/lib/duration";

export default function ServiceCard({ service }: { service: Service }) {
  const imageSrc = resolveServiceImage(service);

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-sage/30 bg-beige">
      <div className="relative aspect-[4/3] w-full shrink-0 bg-gradient-to-br from-sage/40 to-dark-sage/40">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={service.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">✂️</div>
        )}
      </div>
      <div className="flex min-h-[6.5rem] flex-1 flex-col justify-center gap-1 p-4">
        <p className="line-clamp-2 font-semibold text-anthracite">{service.name}</p>
        <p className="text-sm text-anthracite/75">{formatCurrency(service.price)}</p>
        <p className="text-sm text-anthracite/75">{formatDuration(service.duration)}</p>
      </div>
    </div>
  );
}

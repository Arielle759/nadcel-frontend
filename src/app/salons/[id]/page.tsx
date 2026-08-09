import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSalon } from "@/lib/salons";
import ServiceCard from "@/components/ServiceCard";
import { assetUrl } from "@/lib/api";

export default async function SalonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const salon = await getSalon(id);

  if (!salon) {
    notFound();
  }

  const coverSrc = assetUrl(salon.cover);

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-12 sm:px-16">
      <Link href="/salons" className="text-sm text-link-sage hover:underline">
        ← Retour aux salons
      </Link>

      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg bg-gradient-to-br from-sage/40 to-dark-sage/40">
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={salon.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">💆</div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-forest">{salon.name}</h1>
        <p className="text-anthracite/75">{salon.description}</p>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-anthracite/75">
          Adresse
        </h2>
        <p>
          {salon.address}, {salon.city}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-anthracite/75">
          Services
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {salon.services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      <Link
        href={`/salons/${salon.id}/appointments`}
        className="mt-2 inline-flex w-fit items-center justify-center rounded-full bg-dark-sage px-6 py-2 font-medium text-beige transition-colors hover:bg-sage"
      >
        Réserver
      </Link>
    </main>
  );
}

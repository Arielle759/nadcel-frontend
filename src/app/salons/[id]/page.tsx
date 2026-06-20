import Link from "next/link";
import { notFound } from "next/navigation";
import { getSalon } from "@/lib/salons";

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

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-12 sm:px-16">
      <Link href="/salons" className="text-sm text-dark-sage hover:underline">
        ← Retour aux salons
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{salon.nom}</h1>
        <p className="text-anthracite/70">{salon.description}</p>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-anthracite/60">
          Adresse
        </h2>
        <p>{salon.adresse}</p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-anthracite/60">
          Services
        </h2>
        <ul className="flex flex-wrap gap-2">
          {salon.services.map((service) => (
            <li
              key={service.id}
              className="rounded-full border border-sage/40 bg-beige px-3 py-1 text-sm"
            >
              {service.name}
            </li>
          ))}
        </ul>
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

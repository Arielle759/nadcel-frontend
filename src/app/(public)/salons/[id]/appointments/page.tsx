import Link from "next/link";
import { notFound } from "next/navigation";
import { getSalon } from "@/lib/salons";
import { salonArea } from "@/lib/salonArea";
import AppointmentForm from "@/components/AppointmentForm";

export default async function AppointmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { service } = await searchParams;
  const initialServiceId = typeof service === "string" ? Number(service) : undefined;
  const salon = await getSalon(id);

  if (!salon) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col px-6 pb-24 pt-8 sm:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <nav aria-label="Fil d'Ariane" className="text-sm text-anthracite/75">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/salons" className="text-forest underline-offset-4 hover:underline">
                Salons
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/salons/${salon.id}`} className="text-forest underline-offset-4 hover:underline">
                {salon.name}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Réserver</li>
          </ol>
        </nav>

        <div className="mb-10 mt-6">
          <h1 className="text-3xl font-semibold tracking-tight text-forest sm:text-4xl">Réserver chez {salon.name}</h1>
          <p className="mt-2 text-anthracite/75">{salonArea(salon.address, salon.city)}</p>
        </div>

        {salon.services.length === 0 ? (
          <p className="text-anthracite/75">Ce salon n&apos;a pas encore publié de prestation réservable.</p>
        ) : (
          <AppointmentForm
            salonId={salon.id}
            salonName={salon.name}
            salonCover={salon.cover}
            services={salon.services}
            initialServiceId={initialServiceId}
          />
        )}
      </div>
    </main>
  );
}

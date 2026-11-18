import { notFound } from "next/navigation";
import { getSalon } from "@/lib/salons";
import { salonArea } from "@/lib/salonArea";
import AppointmentForm from "@/components/AppointmentForm";
import FocusTopBar from "@/components/FocusTopBar";

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
    <main className="flex flex-1 flex-col px-6 pb-24 pt-6 sm:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <FocusTopBar backHref={`/salons/${salon.id}`} backLabel="← Retour au salon" />

        <div className="mb-10 mt-10">
          <h1 className="text-3xl font-semibold tracking-tight text-brand sm:text-4xl">Réserver chez {salon.name}</h1>
          <p className="mt-2 text-anthracite/75">{salonArea(salon.address, salon.city)}</p>
        </div>

        {salon.services.length === 0 ? (
          <p className="text-anthracite/75">Ce salon n&apos;a pas encore publié de service réservable.</p>
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

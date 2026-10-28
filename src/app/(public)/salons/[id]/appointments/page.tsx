import Link from "next/link";
import { notFound } from "next/navigation";
import { getSalon } from "@/lib/salons";
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
    <main className="flex flex-1 flex-col gap-6 px-6 py-12 sm:px-16">
      <Link
        href={`/salons/${salon.id}`}
        className="text-sm text-link-sage hover:underline"
      >
        Retour au salon
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-forest">
          Réserver chez {salon.name}
        </h1>
        <p className="text-anthracite/75">
          Services disponibles : {salon.services.map((s) => s.name).join(", ")}
        </p>
      </div>

      <AppointmentForm salonId={salon.id} salonName={salon.name} salonCover={salon.cover} services={salon.services} initialServiceId={initialServiceId} />
    </main>
  );
}

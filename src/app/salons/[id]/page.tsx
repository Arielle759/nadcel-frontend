import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";

interface SalonDetail {
  id: number;
  nom: string;
  description: string;
  adresse: string;
  services: string[];
}

async function getSalon(id: string): Promise<SalonDetail | null> {
  try {
    const { data } = await api.get<SalonDetail>(`/salons/${id}`);
    return data;
  } catch {
    return null;
  }
}

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
      <Link href="/salons" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
        ← Retour aux salons
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{salon.nom}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{salon.description}</p>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Adresse
        </h2>
        <p>{salon.adresse}</p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Services
        </h2>
        <ul className="flex flex-wrap gap-2">
          {salon.services.map((service) => (
            <li
              key={service}
              className="rounded-full border border-black/[.08] px-3 py-1 text-sm dark:border-white/[.145]"
            >
              {service}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="mt-2 w-fit rounded-full bg-foreground px-6 py-2 font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Réserver
      </button>
    </main>
  );
}

import SalonGrid from "@/components/SalonGrid";

export default function SalonsPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-12 sm:px-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Tous les salons</h1>
        <p className="text-anthracite/70">
          Parcourez l&apos;ensemble des salons et choisissez celui qui vous convient.
        </p>
      </div>
      <SalonGrid />
    </main>
  );
}

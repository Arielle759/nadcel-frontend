import SalonGrid from "@/components/SalonGrid";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-12 sm:px-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Nos salons</h1>
        <p className="text-anthracite/70">
          Découvrez les salons disponibles et réservez votre prochain rendez-vous.
        </p>
      </div>
      <SalonGrid />
    </main>
  );
}

import Link from "next/link";

type Section = "details" | "services" | "employees";

// Onglets d'un salon dans l'espace gérant : fiche, prestations, équipe.
export default function SalonNav({ salonId, current }: { salonId: string | number; current: Section }) {
  const items: { key: Section; label: string; href: string }[] = [
    { key: "details", label: "Fiche et horaires", href: `/manager/salons/${salonId}` },
    { key: "services", label: "Services", href: `/manager/salons/${salonId}/services` },
    { key: "employees", label: "Équipe", href: `/manager/salons/${salonId}/employees` },
  ];

  return (
    <nav
      aria-label="Rubriques du salon"
      className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-[0_1px_2px_rgba(90,50,35,0.05),0_8px_24px_rgba(90,50,35,0.07)]"
    >
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={item.key === current ? "page" : undefined}
          className={`flex min-h-10 shrink-0 items-center rounded-full px-5 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
            item.key === current ? "bg-brand text-beige" : "text-anthracite/75 hover:text-brand"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

import Link from "next/link";

// Gabarit commun des pages de l'espace privé : titre, phrase d'aide,
// actions à droite, lien de retour facultatif.
export default function ManagerPage({
  title,
  description,
  actions,
  back,
  children,
  width = "wide",
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
  children: React.ReactNode;
  width?: "wide" | "narrow";
}) {
  return (
    <main className="flex flex-1 flex-col px-5 py-8 sm:px-10 sm:py-10">
      <div className={`mx-auto w-full ${width === "narrow" ? "max-w-3xl" : "max-w-6xl"}`}>
        {back && (
          <Link href={back.href} className="text-sm font-semibold text-brand transition-colors hover:text-brand-soft">
            {back.label}
          </Link>
        )}
        <div className={`flex flex-wrap items-end justify-between gap-4 ${back ? "mt-3" : ""}`}>
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight text-brand sm:text-4xl">{title}</h1>
            {description && <p className="mt-2 max-w-2xl text-anthracite/75">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}

// Bandeau d'accueil des tableaux de bord (gérant, administrateur) : une photo
// sous un voile chocolat, un mot d'accueil, un résumé et deux actions.
// Sans photo, le bandeau reste chocolat uni.
export default function DashboardBanner({
  eyebrow,
  title,
  summary,
  image,
  actions,
}: {
  eyebrow?: string;
  title: string;
  summary: string;
  image?: string | null;
  actions?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-brand shadow-[0_6px_16px_rgba(59,42,36,0.18),0_24px_56px_rgba(74,51,40,0.22)]">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="hero-slide-zoom absolute inset-0 -z-10 h-full w-full object-cover" />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-brand/95 via-brand/85 to-brand/60 lg:via-brand/80 lg:to-brand/20"
      />
      <div className="flex min-h-52 flex-wrap items-end justify-between gap-6 px-6 py-8 sm:px-10 sm:py-9">
        <div className="min-w-0">
          {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-beige/65">{eyebrow}</p>}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-beige sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-xl text-beige/80">{summary}</p>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </section>
  );
}

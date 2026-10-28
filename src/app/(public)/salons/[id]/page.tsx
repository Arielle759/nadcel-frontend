import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSalon } from "@/lib/salons";
import type { Service } from "@/hooks/useServices";
import SalonRating from "@/components/SalonRating";
import { assetUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { formatDuration } from "@/lib/duration";
import { resolveServiceImage } from "@/lib/serviceImage";
import { salonArea } from "@/lib/salonArea";
import { DAYS, type DayKey, type OpeningHours } from "@/lib/openingHours";
import { ui } from "@/lib/ui";

// getDay() : 0 = dimanche … 6 = samedi
const DAY_KEYS_BY_INDEX: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function formatHour(value: string): string {
  const [hours, minutes] = value.split(":");
  return minutes === "00" ? `${Number(hours)} h` : `${Number(hours)} h ${minutes}`;
}

function todayLabel(hours: OpeningHours | null, todayKey: DayKey): string | null {
  if (!hours) return null;
  const today = hours[todayKey];
  if (!today) return "Fermé aujourd'hui";
  return `Ouvert aujourd'hui de ${formatHour(today.open)} à ${formatHour(today.close)}`;
}

function groupByCategory(services: Service[]): { category: string; services: Service[] }[] {
  const groups = new Map<string, Service[]>();
  for (const service of services) {
    const key = service.category?.trim() || "Autres prestations";
    groups.set(key, [...(groups.get(key) ?? []), service]);
  }
  return Array.from(groups, ([category, items]) => ({
    category,
    services: [...items].sort((a, b) => a.price - b.price),
  }));
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

  const coverSrc = assetUrl(salon.cover);
  const bookingHref = `/salons/${salon.id}/appointments`;
  const todayKey = DAY_KEYS_BY_INDEX[new Date().getDay()];
  const today = todayLabel(salon.opening_hours, todayKey);
  const groups = groupByCategory(salon.services);
  const prices = salon.services.map((service) => service.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
  const fullAddress = `${salon.address}, ${salon.city}`;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${salon.name}, ${fullAddress}`)}`;

  return (
    <main className="flex flex-1 flex-col px-6 pb-32 pt-8 sm:px-10 lg:pb-24">
      <div className="mx-auto w-full max-w-6xl">
        <nav aria-label="Fil d'Ariane" className="text-sm text-anthracite/75">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/salons" className="text-forest underline-offset-4 hover:underline">
                Salons
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{salon.name}</li>
          </ol>
        </nav>

        <div className="relative mt-5 h-60 w-full overflow-hidden rounded-3xl bg-sage/20 sm:h-80 lg:h-[420px]">
          {coverSrc ? (
            <Image src={coverSrc} alt={`Intérieur du salon ${salon.name}`} fill sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" priority />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-heading text-8xl font-semibold text-forest/25" aria-hidden="true">
                {salon.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <h1 className="text-4xl font-semibold tracking-tight text-forest sm:text-5xl">{salon.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-anthracite/80">
              {salon.reviews_count > 0 ? (
                <SalonRating average={salon.reviews_avg_rating} count={salon.reviews_count} />
              ) : (
                <span>Pas encore d&apos;avis</span>
              )}
              <span>{salonArea(salon.address, salon.city)}</span>
              {today && <span className="font-medium text-forest">{today}</span>}
            </div>
            {salon.description && (
              <p className="mt-6 max-w-2xl text-lg leading-8 text-anthracite/85">{salon.description}</p>
            )}

            <section aria-labelledby="services-title" className="mt-14">
              <h2 id="services-title" className="text-2xl font-semibold tracking-tight text-forest sm:text-3xl">
                Prestations
              </h2>

              {groups.length === 0 ? (
                <p className="mt-4 text-anthracite/75">Ce salon n&apos;a pas encore publié ses prestations.</p>
              ) : (
                groups.map(({ category, services }) => (
                  <div key={category} className="mt-8">
                    <h3 className="text-sm font-semibold text-anthracite/75" style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>
                      {category} ({services.length})
                    </h3>
                    <ul className="mt-2 divide-y divide-sage/25 border-y border-sage/25">
                      {services.map((service) => {
                        const imageSrc = resolveServiceImage(service);
                        return (
                          <li key={service.id} className="flex items-center gap-4 py-4">
                            <div className="relative hidden h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sage/20 sm:block">
                              {imageSrc && <Image src={imageSrc} alt="" fill sizes="56px" className="object-cover" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-forest">{service.name}</p>
                              {service.description && (
                                <p className="mt-0.5 line-clamp-1 text-sm text-anthracite/75">{service.description}</p>
                              )}
                              <p className="mt-1 text-sm text-anthracite/75 sm:hidden">
                                {formatDuration(service.duration)}, {formatCurrency(service.price)}
                              </p>
                            </div>
                            <span className="hidden w-20 shrink-0 text-right text-sm text-anthracite/75 sm:block">
                              {formatDuration(service.duration)}
                            </span>
                            <span className="hidden w-28 shrink-0 text-right font-semibold text-anthracite sm:block">
                              {formatCurrency(service.price)}
                            </span>
                            <Link
                              href={`${bookingHref}?service=${service.id}`}
                              className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-forest/25 px-4 text-sm font-semibold text-forest transition-colors hover:border-forest hover:bg-forest hover:text-beige"
                              aria-label={`Réserver : ${service.name}`}
                            >
                              Réserver
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </section>

            <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2">
              <section aria-labelledby="hours-title">
                <h2 id="hours-title" className="text-2xl font-semibold tracking-tight text-forest">
                  Horaires
                </h2>
                {salon.opening_hours ? (
                  <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-sm">
                    {DAYS.map(({ key, label }) => {
                      const hours = salon.opening_hours?.[key];
                      const isToday = key === todayKey;
                      return (
                        <div key={key} className={`contents ${isToday ? "font-semibold text-forest" : "text-anthracite/85"}`}>
                          <dt>{label}</dt>
                          <dd>{hours ? `${formatHour(hours.open)} à ${formatHour(hours.close)}` : "Fermé"}</dd>
                        </div>
                      );
                    })}
                  </dl>
                ) : (
                  <p className="mt-4 text-sm text-anthracite/75">Le salon n&apos;a pas encore renseigné ses horaires.</p>
                )}
              </section>

              <section aria-labelledby="address-title">
                <h2 id="address-title" className="text-2xl font-semibold tracking-tight text-forest">
                  Adresse
                </h2>
                <p className="mt-4 text-sm text-anthracite/85">{fullAddress}</p>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-forest underline-offset-4 hover:underline"
                >
                  Voir l&apos;itinéraire (Google Maps)
                </a>
              </section>
            </div>
          </div>

          <aside aria-label="Réservation" className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
            <div className="rounded-3xl border border-sage/25 bg-white/60 p-6 shadow-[0_12px_32px_rgba(45,59,40,0.07)]">
              <p className="font-heading text-2xl font-semibold text-forest">Réserver</p>
              {minPrice !== null && maxPrice !== null && (
                <p className="mt-2 text-sm text-anthracite/80">
                  {salon.services.length} {salon.services.length > 1 ? "prestations" : "prestation"},{" "}
                  {minPrice === maxPrice
                    ? formatCurrency(minPrice)
                    : `de ${formatCurrency(minPrice)} à ${formatCurrency(maxPrice)}`}
                </p>
              )}
              {today && <p className="mt-1 text-sm text-anthracite/80">{today}</p>}
              <Link href={bookingHref} className={`${ui.buttonPrimary} mt-6 h-12 w-full text-base`}>
                Choisir un créneau
              </Link>
              <p className="mt-4 text-sm leading-6 text-anthracite/75">
                Aucun paiement en ligne. Vous réglez au salon, en espèces, par Wave ou par Orange Money.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile : l'action de réservation reste toujours accessible en bas de l'écran. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sage/25 bg-beige/95 px-6 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <p className="min-w-0 text-sm text-anthracite/80">
            {minPrice !== null ? <>À partir de <span className="font-semibold text-forest">{formatCurrency(minPrice)}</span></> : salon.name}
          </p>
          <Link href={bookingHref} className={`${ui.buttonPrimary} shrink-0`}>
            Choisir un créneau
          </Link>
        </div>
      </div>
    </main>
  );
}

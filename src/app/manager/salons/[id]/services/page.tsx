"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Service, useServices } from "@/hooks/useServices";
import { formatCurrency } from "@/lib/currency";
import { formatDuration } from "@/lib/duration";
import { resolveServiceImage } from "@/lib/serviceImage";
import ManagerPage from "@/components/manager/ManagerPage";
import SalonNav from "@/components/manager/SalonNav";
import ConfirmDelete from "@/components/ConfirmDelete";
import { ui } from "@/lib/ui";

export default function ManagerServicesPage() {
  const { id } = useParams<{ id: string }>();
  const { getServices, setServiceActive } = useServices();
  const [services, setServices] = useState<Service[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [reactivating, setReactivating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setError(null);
    try {
      // Les services actifs d'abord, les désactivés à la fin.
      const list = await getServices(id, { includeInactive: true });
      setServices([...list].sort((a, b) => Number(b.is_active !== false) - Number(a.is_active !== false)));
    } catch {
      setError("Impossible de charger les services.");
    } finally {
      setLoading(false);
    }
  }, [getServices, id]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchServices();
    });
  }, [fetchServices]);

  return (
    <ManagerPage
      title="Services"
      description="Ce que vos clientes peuvent réserver, avec le prix et la durée affichés sur votre page."
      back={{ href: "/manager/salons", label: "Mes salons" }}
      actions={
        <Link href={`/manager/salons/${id}/services/new`} className={ui.buttonPrimary}>
          Ajouter un service
        </Link>
      }
    >
      <SalonNav salonId={id} current="services" />

      <div className="mt-8">
        {loading && <div className="h-40 animate-pulse rounded-2xl bg-sable/15" />}
        {error && <p className="text-sm text-red-700">{error}</p>}
        {notice && (
          <p role="status" className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {notice}
          </p>
        )}

        {!loading && !error && services.length === 0 && (
          <div className={`${ui.surface} px-6 py-12 text-center`}>
            <p className="font-heading text-2xl font-semibold text-brand">Aucun service</p>
            <p className="mt-2 text-sm text-anthracite/75">Ajoutez votre premier service pour pouvoir recevoir des réservations.</p>
          </div>
        )}

        <ul className="flex flex-col gap-3">
          {services.map((service) => {
            const imageSrc = resolveServiceImage(service);
            const active = service.is_active !== false;
            return (
              <li key={service.id} className={`${ui.surface} flex flex-wrap items-center gap-4 p-4 ${active ? "" : "opacity-75"}`}>
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sable/20">
                  {imageSrc && <Image src={imageSrc} alt="" fill sizes="56px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-brand">
                    <span>{service.name}</span>
                    {!active && (
                      <span className="rounded-full bg-anthracite/10 px-2.5 py-0.5 text-xs font-semibold text-anthracite/80">
                        Désactivé
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-anthracite/75">
                    {service.category}, {formatDuration(service.duration)}
                  </p>
                  {!active ? (
                    <p className="mt-1 text-sm text-anthracite/80">
                      Ce service n&apos;est plus proposé aux clientes. Son historique est conservé.
                    </p>
                  ) : service.employees_count === 0 && (
                    <p className="mt-1 text-sm font-medium text-alert">
                      Aucun employé ne le réalise : il n&apos;est pas réservable.{" "}
                      <Link href={`/manager/salons/${id}/employees`} className={ui.textLink}>
                        Voir les employés
                      </Link>
                    </p>
                  )}
                </div>
                <p className="w-28 text-right font-semibold text-anthracite">{formatCurrency(Number(service.price))}</p>
                <div className="flex flex-wrap items-center gap-1">
                  <Link href={`/manager/salons/${id}/services/${service.id}`} className={ui.buttonSecondary}>
                    Modifier
                  </Link>
                  {active ? (
                    <ConfirmDelete
                      label="Désactiver"
                      question="Désactiver ce service ? Il ne sera plus proposé aux clientes."
                      confirmLabel="Oui, désactiver"
                      busyLabel="Désactivation..."
                      onConfirm={async () => {
                        const result = await setServiceActive(service.id, false);
                        const upcoming = result.upcoming_appointments ?? 0;
                        setNotice(
                          upcoming > 0
                            ? `« ${service.name} » n'est plus proposé. ${upcoming} rendez-vous à venir ${upcoming > 1 ? "sont" : "est"} maintenu${upcoming > 1 ? "s" : ""} : honorez-${upcoming > 1 ? "les" : "le"} ou prévenez les clientes.`
                            : `« ${service.name} » n'est plus proposé aux clientes.`
                        );
                        await fetchServices();
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      disabled={reactivating === service.id}
                      onClick={async () => {
                        setReactivating(service.id);
                        setNotice(null);
                        try {
                          await setServiceActive(service.id, true);
                          setNotice(`« ${service.name} » est de nouveau proposé aux clientes.`);
                          await fetchServices();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Impossible de réactiver ce service.");
                        } finally {
                          setReactivating(null);
                        }
                      }}
                      className={ui.buttonSecondary}
                    >
                      {reactivating === service.id ? "Réactivation..." : "Réactiver"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </ManagerPage>
  );
}

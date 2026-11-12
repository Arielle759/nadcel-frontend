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
  const { getServices, deleteService } = useServices();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setError(null);
    try {
      setServices(await getServices(id));
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

        {!loading && !error && services.length === 0 && (
          <div className={`${ui.surface} px-6 py-12 text-center`}>
            <p className="font-heading text-2xl font-semibold text-brand">Aucun service</p>
            <p className="mt-2 text-sm text-anthracite/75">Ajoutez votre premier service pour pouvoir recevoir des réservations.</p>
          </div>
        )}

        <ul className="flex flex-col gap-3">
          {services.map((service) => {
            const imageSrc = resolveServiceImage(service);
            return (
              <li key={service.id} className={`${ui.surface} flex flex-wrap items-center gap-4 p-4`}>
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sable/20">
                  {imageSrc && <Image src={imageSrc} alt="" fill sizes="56px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-brand">{service.name}</p>
                  <p className="text-sm text-anthracite/75">
                    {service.category}, {formatDuration(service.duration)}
                  </p>
                  {service.employees_count === 0 && (
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
                  <ConfirmDelete
                    question="Supprimer ce service ?"
                    onConfirm={async () => {
                      await deleteService(service.id);
                      await fetchServices();
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </ManagerPage>
  );
}

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Service, useServices } from "@/hooks/useServices";
import { resolveServiceImage } from "@/lib/serviceImage";
import ManagerPage from "@/components/manager/ManagerPage";
import ServiceForm from "@/components/manager/ServiceForm";

export default function EditServicePage() {
  const { id, serviceId } = useParams<{ id: string; serviceId: string }>();
  const { getServices, updateService } = useServices();
  const [service, setService] = useState<Service | null>(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getServices(id)
      .then((services) => {
        if (!isMounted) return;
        const found = services.find((s) => String(s.id) === serviceId);
        if (found) setService(found);
        else setFetchError("Prestation introuvable.");
      })
      .catch(() => {
        if (isMounted) setFetchError("Impossible de charger la prestation.");
      })
      .finally(() => {
        if (isMounted) setFetching(false);
      });
    return () => {
      isMounted = false;
    };
  }, [getServices, id, serviceId]);

  const back = { href: `/manager/salons/${id}/services`, label: "Prestations" };

  if (fetching || !service) {
    return (
      <ManagerPage title={fetching ? "Chargement..." : "Prestation introuvable"} back={back} width="narrow">
        {fetching ? <div className="h-96 animate-pulse rounded-2xl bg-sage/15" /> : <p className="text-sm text-red-700">{fetchError}</p>}
      </ManagerPage>
    );
  }

  return (
    <ManagerPage title={service.name} back={back} width="narrow">
      <ServiceForm
        initial={{
          name: service.name,
          description: service.description,
          price: Number(service.price),
          duration: service.duration,
          category: service.category,
        }}
        currentImageUrl={resolveServiceImage(service)}
        submitLabel="Enregistrer les modifications"
        onSubmit={async (values) => {
          const updated = await updateService(serviceId, values);
          setService(updated);
        }}
      />
    </ManagerPage>
  );
}

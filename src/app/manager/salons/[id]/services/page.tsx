"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Service, useServices } from "@/hooks/useServices";
import { formatCurrency } from "@/lib/currency";
import { formatDuration } from "@/lib/duration";

export default function ManagerServicesPage() {
  const { id } = useParams<{ id: string }>();
  const { getServices, deleteService } = useServices();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getServices(id);
      setServices(data);
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

  async function handleDelete(serviceId: number) {
    if (!window.confirm("Supprimer ce service ?")) return;
    setDeletingId(serviceId);
    try {
      await deleteService(serviceId);
      await fetchServices();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-8 bg-gradient-to-br from-beige to-sage/20 px-6 py-12 sm:px-16">
      <Link
        href={`/manager/salons/${id}`}
        className="self-start text-sm text-link-sage hover:underline"
      >
        ← Retour au salon
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-forest">Services</h1>
        <Link
          href={`/manager/salons/${id}/services/new`}
          className="rounded-full bg-dark-sage px-5 py-2 text-sm font-medium text-beige transition-colors hover:bg-sage"
        >
          Ajouter un service
        </Link>
      </div>

      {loading && <p className="text-anthracite/75">Chargement des services...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && services.length === 0 && (
        <p className="text-anthracite/75">Aucun service pour ce salon.</p>
      )}

      <ul className="flex flex-col gap-4 border-t-4 border-t-champagne pt-4">
        {services.map((service) => (
          <li
            key={service.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-sage/30 bg-beige p-4"
          >
            <div>
              <p className="font-semibold text-anthracite">
                {service.name} <span className="text-anthracite/75">— {service.category}</span>
              </p>
              <p className="text-sm text-anthracite/75">{service.description}</p>
              <p className="text-sm text-anthracite/75">
                {formatCurrency(service.price)} · {formatDuration(service.duration)}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/manager/salons/${id}/services/${service.id}`}
                className="rounded-full border border-dark-sage px-4 py-2 text-sm font-medium text-link-sage transition-colors hover:bg-sage/10"
              >
                Modifier
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(service.id)}
                disabled={deletingId === service.id}
                className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-90 disabled:opacity-50"
              >
                {deletingId === service.id ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { Service, useServices } from "@/hooks/useServices";

export default function EditEmployeePage() {
  const { id, employeeId } = useParams<{ id: string; employeeId: string }>();
  const router = useRouter();
  const { getEmployees, updateEmployee, loading: saving, error: saveError } = useEmployees();
  const { getServices } = useServices();

  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceIds, setServiceIds] = useState<number[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getEmployees(id)
      .then((employees) => {
        if (!isMounted) return;
        const employee = employees.find((e) => String(e.id) === employeeId);
        if (!employee) {
          setFetchError("Employé introuvable.");
          return;
        }
        setNom(employee.name);
        setTelephone(employee.phone);
        setEmail(employee.user.email);
        setServiceIds(employee.services.map((service) => service.id));
      })
      .catch(() => {
        if (isMounted) setFetchError("Impossible de charger l'employé.");
      })
      .finally(() => {
        if (isMounted) setFetching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [getEmployees, id, employeeId]);

  useEffect(() => {
    let isMounted = true;

    getServices(id)
      .then((data) => {
        if (isMounted) setServices(data);
      })
      .finally(() => {
        if (isMounted) setServicesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [getServices, id]);

  function toggleService(serviceId: number) {
    setServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((sid) => sid !== serviceId)
        : [...current, serviceId]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccess(false);
    try {
      await updateEmployee(employeeId, {
        name: nom,
        phone: telephone,
        service_ids: serviceIds,
      });
      setSuccess(true);
    } catch {
      // error state is exposed via useEmployees
    }
  }

  if (fetching) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-6 py-12 sm:px-16">
        <p className="text-anthracite/75">Chargement de l&apos;employé...</p>
      </main>
    );
  }

  if (fetchError) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-6 py-12 sm:px-16">
        <p className="text-sm text-red-600">{fetchError}</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-12 sm:px-16">
      <button
        type="button"
        onClick={() => router.push(`/manager/salons/${id}/employees`)}
        className="self-start text-sm text-link-sage hover:underline"
      >
        ← Retour aux employés
      </button>

      <h1 className="text-3xl font-semibold tracking-tight text-forest">Modifier l&apos;employé</h1>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-sage/30 bg-beige p-6"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="nom" className="text-sm font-medium">
            Nom
          </label>
          <input
            id="nom"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="rounded-md border border-sage/40 px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="telephone" className="text-sm font-medium">
            Téléphone
          </label>
          <input
            id="telephone"
            type="tel"
            required
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="rounded-md border border-sage/40 px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Email</span>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="rounded-md border border-sage/40 bg-sage/10 px-3 py-2 text-anthracite/75"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Services réalisables</span>
          {servicesLoading && <p className="text-sm text-anthracite/75">Chargement des services...</p>}
          {!servicesLoading && services.length === 0 && (
            <p className="text-sm text-anthracite/75">
              Aucun service disponible. Ajoutez d&apos;abord des services au salon.
            </p>
          )}
          <div className="flex flex-col gap-2">
            {services.map((service) => (
              <label key={service.id} className="flex items-center gap-2 text-sm text-anthracite">
                <input
                  type="checkbox"
                  checked={serviceIds.includes(service.id)}
                  onChange={() => toggleService(service.id)}
                  className="h-4 w-4 rounded border-sage/40"
                />
                {service.name}
              </label>
            ))}
          </div>
        </div>

        {saveError && <p className="text-sm text-red-600">{saveError}</p>}
        {success && <p className="text-sm text-green-600">Employé mis à jour !</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-full bg-dark-sage px-5 py-2 font-medium text-beige transition-colors hover:bg-sage disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </main>
  );
}

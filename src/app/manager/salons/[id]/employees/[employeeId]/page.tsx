"use client";

import { useParams, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { Service, useServices } from "@/hooks/useServices";
import ManagerPage from "@/components/manager/ManagerPage";
import { formatDuration } from "@/lib/duration";
import { ui } from "@/lib/ui";

function EditEmployeeContent() {
  const { id, employeeId } = useParams<{ id: string; employeeId: string }>();
  const justCreated = useSearchParams().get("nouveau") === "1";
  const { getEmployees, updateEmployee } = useEmployees();
  const { getServices } = useServices();

  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceIds, setServiceIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getEmployees(id), getServices(id)])
      .then(([employees, salonServices]) => {
        if (!isMounted) return;
        setServices(salonServices);
        const employee = employees.find((e) => String(e.id) === employeeId);
        if (!employee) {
          setFetchError("Membre de l'équipe introuvable.");
          return;
        }
        setName(employee.name);
        setPhone(employee.phone);
        setServiceIds(employee.services.map((service) => service.id));
      })
      .catch(() => {
        if (isMounted) setFetchError("Impossible de charger ce membre de l'équipe.");
      })
      .finally(() => {
        if (isMounted) setFetching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [getEmployees, getServices, id, employeeId]);

  function toggleService(serviceId: number) {
    setServiceIds((current) =>
      current.includes(serviceId) ? current.filter((sid) => sid !== serviceId) : [...current, serviceId]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateEmployee(employeeId, { name, phone, service_ids: serviceIds });
      setMessage({ ok: true, text: "Modifications enregistrées." });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Enregistrement impossible." });
    } finally {
      setSaving(false);
    }
  }

  const back = { href: `/manager/salons/${id}/employees`, label: "Équipe" };

  if (fetching || fetchError) {
    return (
      <ManagerPage title={fetching ? "Chargement..." : "Introuvable"} back={back} width="narrow">
        {fetching ? <div className="h-96 animate-pulse rounded-2xl bg-sable/15" /> : <p className="text-sm text-red-700">{fetchError}</p>}
      </ManagerPage>
    );
  }

  return (
    <ManagerPage title={name || "Membre de l'équipe"} back={back} width="narrow">
      {justCreated && (
        <p className="mb-6 rounded-2xl bg-sable/20 px-5 py-4 text-sm leading-6 text-brand">
          {name} fait maintenant partie de l&apos;équipe. Cochez les prestations qu&apos;il ou elle réalise, puis enregistrez.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <section className={`${ui.surface} flex flex-col gap-5 p-6 sm:p-8`}>
          <h2 className="font-heading text-2xl font-semibold text-brand">Coordonnées</h2>
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className={ui.label}>
              Nom complet
            </label>
            <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={ui.input} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className={ui.label}>
              Téléphone
            </label>
            <input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={ui.input} />
          </div>
        </section>

        <fieldset className={`${ui.surface} flex flex-col gap-4 p-6 sm:p-8`}>
          <legend className="sr-only">Prestations réalisées</legend>
          <div>
            <p className="font-heading text-2xl font-semibold text-brand">Prestations réalisées</p>
            <p className="mt-1 text-sm text-anthracite/75">
              Les clientes ne peuvent réserver avec ce membre que les prestations cochées.
            </p>
          </div>
          {services.length === 0 ? (
            <p className="text-sm text-anthracite/75">Ce salon n&apos;a pas encore de prestation.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {services.map((service) => {
                const checked = serviceIds.includes(service.id);
                return (
                  <label
                    key={service.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                      checked ? "bg-brand/10 shadow-[0_0_0_2px_var(--color-brand)]" : "bg-beige hover:bg-sable/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleService(service.id)}
                      className="h-4 w-4 shrink-0 accent-[var(--color-brand)]"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-anthracite">{service.name}</span>
                      <span className="block text-xs text-anthracite/70">{formatDuration(service.duration)}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </fieldset>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={saving} className={ui.buttonPrimary}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
          {message && (
            <p role="status" className={`text-sm font-medium ${message.ok ? "text-brand" : "text-red-700"}`}>
              {message.text}
            </p>
          )}
        </div>
      </form>
    </ManagerPage>
  );
}

export default function EditEmployeePage() {
  return (
    <Suspense fallback={null}>
      <EditEmployeeContent />
    </Suspense>
  );
}

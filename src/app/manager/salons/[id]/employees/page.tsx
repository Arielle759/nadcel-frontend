"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Employee, useEmployees } from "@/hooks/useEmployees";
import ManagerPage from "@/components/manager/ManagerPage";
import SalonNav from "@/components/manager/SalonNav";
import ConfirmDelete from "@/components/ConfirmDelete";
import { ui } from "@/lib/ui";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function ManagerEmployeesPage() {
  const { id } = useParams<{ id: string }>();
  const { getEmployees, setEmployeeActive } = useEmployees();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [reactivating, setReactivating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setError(null);
    try {
      const list = await getEmployees(id);
      // Les membres actifs d'abord, les désactivés à la fin.
      setEmployees([...list].sort((a, b) => Number(b.is_active !== false) - Number(a.is_active !== false)));
    } catch {
      setError("Impossible de charger l'équipe.");
    } finally {
      setLoading(false);
    }
  }, [getEmployees, id]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchEmployees();
    });
  }, [fetchEmployees]);

  return (
    <ManagerPage
      title="Équipe"
      description="Chaque rendez-vous est attribué à un membre de l'équipe qui réalise le service et qui est libre à ce moment-là."
      back={{ href: "/manager/salons", label: "Mes salons" }}
      actions={
        <Link href={`/manager/salons/${id}/employees/new`} className={ui.buttonPrimary}>
          Ajouter un membre
        </Link>
      }
    >
      <SalonNav salonId={id} current="employees" />

      <div className="mt-8">
        {loading && <div className="h-40 animate-pulse rounded-2xl bg-sable/15" />}
        {error && <p className="text-sm text-red-700">{error}</p>}
        {notice && (
          <p role="status" className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {notice}
          </p>
        )}

        {!loading && !error && employees.length === 0 && (
          <div className={`${ui.surface} px-6 py-12 text-center`}>
            <p className="font-heading text-2xl font-semibold text-brand">Personne dans l&apos;équipe</p>
            <p className="mt-2 text-sm text-anthracite/75">
              Sans membre de l&apos;équipe, aucun créneau ne peut être proposé aux clientes.
            </p>
          </div>
        )}

        <ul className="grid gap-4 md:grid-cols-2">
          {employees.map((employee) => {
            const active = employee.is_active !== false;
            return (
            <li key={employee.id} className={`${ui.surface} flex flex-col gap-4 p-5 ${active ? "" : "opacity-75"}`}>
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-beige font-semibold text-brand" aria-hidden="true">
                  {initials(employee.name)}
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-brand">
                    <span className="truncate">{employee.name}</span>
                    {!active && (
                      <span className="rounded-full bg-anthracite/10 px-2.5 py-0.5 text-xs font-semibold text-anthracite/80">
                        Désactivé
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-anthracite/75">{employee.phone}</p>
                </div>
              </div>
              {!active ? (
                <p className="rounded-xl bg-beige/60 px-3 py-2 text-sm text-anthracite/80">
                  Ce membre ne reçoit plus de rendez-vous. Son historique est conservé.
                </p>
              ) : employee.services.length > 0 ? (
                <p className="text-sm text-anthracite/80">
                  <span className="font-medium text-anthracite">Réalise : </span>
                  {employee.services.map((service) => service.name).join(", ")}
                </p>
              ) : (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Aucun service associé : ce membre ne reçoit pas encore de rendez-vous.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-1">
                <Link href={`/manager/salons/${id}/employees/${employee.id}`} className={ui.buttonSecondary}>
                  Modifier
                </Link>
                {active ? (
                  <ConfirmDelete
                    label="Désactiver"
                    question="Désactiver ce membre ? Il ne recevra plus de rendez-vous."
                    confirmLabel="Oui, désactiver"
                    busyLabel="Désactivation..."
                    onConfirm={async () => {
                      const result = await setEmployeeActive(employee.id, false);
                      const upcoming = result.upcoming_appointments ?? 0;
                      setNotice(
                        upcoming > 0
                          ? `${employee.name} ne recevra plus de rendez-vous. ${upcoming} rendez-vous à venir lui ${upcoming > 1 ? "sont" : "est"} encore attribué${upcoming > 1 ? "s" : ""} : pensez à le${upcoming > 1 ? "s" : ""} déplacer ou à prévenir les clientes.`
                          : `${employee.name} ne recevra plus de rendez-vous.`
                      );
                      await fetchEmployees();
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    disabled={reactivating === employee.id}
                    onClick={async () => {
                      setReactivating(employee.id);
                      setNotice(null);
                      try {
                        await setEmployeeActive(employee.id, true);
                        setNotice(`${employee.name} peut de nouveau recevoir des rendez-vous.`);
                        await fetchEmployees();
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Impossible de réactiver ce membre.");
                      } finally {
                        setReactivating(null);
                      }
                    }}
                    className={ui.buttonSecondary}
                  >
                    {reactivating === employee.id ? "Réactivation..." : "Réactiver"}
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

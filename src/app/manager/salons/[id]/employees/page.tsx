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
  const { getEmployees, deleteEmployee } = useEmployees();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setError(null);
    try {
      setEmployees(await getEmployees(id));
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
      description="Chaque rendez-vous est attribué à un membre de l'équipe qui réalise la prestation et qui est libre à ce moment-là."
      back={{ href: "/manager/salons", label: "Mes salons" }}
      actions={
        <Link href={`/manager/salons/${id}/employees/new`} className={ui.buttonPrimary}>
          Ajouter un membre
        </Link>
      }
    >
      <SalonNav salonId={id} current="employees" />

      <div className="mt-8">
        {loading && <div className="h-40 animate-pulse rounded-2xl bg-sage/15" />}
        {error && <p className="text-sm text-red-700">{error}</p>}

        {!loading && !error && employees.length === 0 && (
          <div className={`${ui.surface} px-6 py-12 text-center`}>
            <p className="font-heading text-2xl font-semibold text-forest">Personne dans l&apos;équipe</p>
            <p className="mt-2 text-sm text-anthracite/75">
              Sans membre de l&apos;équipe, aucun créneau ne peut être proposé aux clientes.
            </p>
          </div>
        )}

        <ul className="grid gap-4 md:grid-cols-2">
          {employees.map((employee) => (
            <li key={employee.id} className={`${ui.surface} flex flex-col gap-4 p-5`}>
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-beige font-semibold text-forest" aria-hidden="true">
                  {initials(employee.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-forest">{employee.name}</p>
                  <p className="truncate text-sm text-anthracite/75">{employee.phone}</p>
                </div>
              </div>
              {employee.services.length > 0 ? (
                <p className="text-sm text-anthracite/80">
                  <span className="font-medium text-anthracite">Réalise : </span>
                  {employee.services.map((service) => service.name).join(", ")}
                </p>
              ) : (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Aucune prestation associée : ce membre ne reçoit pas encore de rendez-vous.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-1">
                <Link href={`/manager/salons/${id}/employees/${employee.id}`} className={ui.buttonSecondary}>
                  Modifier
                </Link>
                <ConfirmDelete
                  label="Retirer"
                  question="Retirer ce membre de l'équipe ?"
                  onConfirm={async () => {
                    await deleteEmployee(employee.id);
                    await fetchEmployees();
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ManagerPage>
  );
}

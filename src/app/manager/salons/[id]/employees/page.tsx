"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Employee, useEmployees } from "@/hooks/useEmployees";

export default function ManagerEmployeesPage() {
  const { id } = useParams<{ id: string }>();
  const { getEmployees, deleteEmployee } = useEmployees();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployees(id);
      setEmployees(data);
    } catch {
      setError("Impossible de charger les employés.");
    } finally {
      setLoading(false);
    }
  }, [getEmployees, id]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchEmployees();
    });
  }, [fetchEmployees]);

  async function handleDelete(employeeId: number) {
    if (!window.confirm("Supprimer cet employé ?")) return;
    setDeletingId(employeeId);
    try {
      await deleteEmployee(employeeId);
      await fetchEmployees();
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
        <h1 className="text-3xl font-semibold tracking-tight text-forest">Employés</h1>
        <Link
          href={`/manager/salons/${id}/employees/new`}
          className="rounded-full bg-dark-sage px-5 py-2 text-sm font-medium text-beige transition-colors hover:bg-sage"
        >
          Ajouter un employé
        </Link>
      </div>

      {loading && <p className="text-anthracite/75">Chargement des employés...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && employees.length === 0 && (
        <p className="text-anthracite/75">Aucun employé pour ce salon.</p>
      )}

      <ul className="flex flex-col gap-4 border-t-4 border-t-champagne pt-4">
        {employees.map((employee) => (
          <li
            key={employee.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-sage/30 bg-beige p-4"
          >
            <div>
              <p className="font-semibold text-anthracite">{employee.name}</p>
              <p className="text-sm text-anthracite/75">{employee.phone}</p>
              <p className="text-sm text-anthracite/75">{employee.user.email}</p>
              {employee.services.length > 0 && (
                <p className="text-sm text-anthracite/75">
                  {employee.services.map((service) => service.name).join(", ")}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Link
                href={`/manager/salons/${id}/employees/${employee.id}`}
                className="rounded-full border border-dark-sage px-4 py-2 text-sm font-medium text-link-sage transition-colors hover:bg-sage/10"
              >
                Modifier
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(employee.id)}
                disabled={deletingId === employee.id}
                className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-90 disabled:opacity-50"
              >
                {deletingId === employee.id ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

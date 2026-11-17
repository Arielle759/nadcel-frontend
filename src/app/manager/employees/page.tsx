"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api, toErrorMessage } from "@/lib/api";
import type { Employee } from "@/hooks/useEmployees";
import HubPage, { HUB_BUTTON, HUB_CARD, SalonPicker, useChosenSalon } from "@/components/manager/HubPage";

// Toute l'équipe des salons du gérant (ou d'un seul salon), avec un accès
// direct à la fiche de chaque employé et à l'ajout d'un employé.
export default function ManagerEmployeesPage() {
  const { salons, loading: salonsLoading, salonId, choose } = useChosenSalon();
  const targets = salonId ? salons.filter((s) => s.id === salonId) : salons;
  const key = targets.map((s) => s.id).join(",");
  const [state, setState] = useState<{ key: string; employees: Employee[]; error: string | null } | null>(null);

  useEffect(() => {
    if (salonsLoading || key === "") return;
    let active = true;
    Promise.all(
      key.split(",").map((id) => api.get<{ data: Employee[] }>("/employees", { params: { salon_id: id } }).then(({ data }) => data.data))
    )
      .then((lists) => {
        if (active) setState({ key, employees: lists.flat(), error: null });
      })
      .catch((err) => {
        if (active) setState({ key, employees: [], error: toErrorMessage(err, "Impossible de charger l'équipe.") });
      });
    return () => {
      active = false;
    };
  }, [key, salonsLoading]);

  const loading = state?.key !== key;
  const employees = state?.employees ?? [];
  const salonName = (id: number) => salons.find((s) => s.id === id)?.name ?? "";
  const addTarget = targets.length === 1 ? targets[0] : null;
  const activeCount = employees.filter((e) => e.is_active).length;

  return (
    <HubPage
      title="Employés"
      subtitle={
        loading
          ? "Votre équipe et les prestations que chacun réalise."
          : `${activeCount} employé${activeCount > 1 ? "s" : ""} actif${activeCount > 1 ? "s" : ""}${
              addTarget ? "" : ". Choisissez un salon pour ajouter un employé."
            }`
      }
      actions={
        <>
          <SalonPicker salons={salons} salonId={salonId} onChange={choose} />
          {addTarget && (
            <Link href={`/manager/salons/${addTarget.id}/employees/new`} className={HUB_BUTTON}>
              <Plus size={17} aria-hidden="true" />
              Ajouter un employé
            </Link>
          )}
        </>
      }
    >
      {state?.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <section aria-label="Liste des employés" aria-busy={loading} className={`${HUB_CARD} p-2 sm:p-4`}>
        {loading ? (
          <div className="flex flex-col gap-2 p-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-sable/15" />
            ))}
          </div>
        ) : employees.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-anthracite/70">Aucun employé pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead>
                <tr className="text-anthracite">
                  <th scope="col" className="px-3 pb-3 pt-2 font-medium">
                    Employé
                  </th>
                  {targets.length > 1 && (
                    <th scope="col" className="px-3 pb-3 pt-2 font-medium">
                      Salon
                    </th>
                  )}
                  <th scope="col" className="px-3 pb-3 pt-2 font-medium">
                    Téléphone
                  </th>
                  <th scope="col" className="px-3 pb-3 pt-2 font-medium">
                    Prestations
                  </th>
                  <th scope="col" className="px-3 pb-3 pt-2 font-medium">
                    Statut
                  </th>
                  <th scope="col" className="px-3 pb-3 pt-2">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id} className="border-t border-[#ebe4dd] text-anthracite/80">
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e9dfd6] text-sm font-semibold text-brand"
                        >
                          {e.name.trim().charAt(0).toUpperCase()}
                        </span>
                        <span className="font-medium text-anthracite">{e.name}</span>
                      </span>
                    </td>
                    {targets.length > 1 && <td className="px-3 py-3">{salonName(e.salon_id)}</td>}
                    <td className="whitespace-nowrap px-3 py-3 tabular-nums">{e.phone}</td>
                    <td className="max-w-[18rem] px-3 py-3">
                      <span className="line-clamp-2">
                        {e.services.length > 0 ? e.services.map((s) => s.name).join(", ") : "Aucune prestation"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-medium ${
                          e.is_active ? "bg-accent text-white" : "border border-[#d9cfc5] bg-white text-anthracite/70"
                        }`}
                      >
                        {e.is_active ? "actif" : "désactivé"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link href={`/manager/salons/${e.salon_id}/employees/${e.id}`} className="text-sm font-semibold text-accent hover:text-brand">
                        Gérer
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </HubPage>
  );
}

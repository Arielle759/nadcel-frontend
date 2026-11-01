"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminSalon, useAdmin } from "@/hooks/useAdmin";
import ManagerPage from "@/components/manager/ManagerPage";
import PartnerRequestCard from "@/components/admin/PartnerRequestCard";
import { ui } from "@/lib/ui";

export default function AdminPartnerRequestsPage() {
  const { getPendingSalons, changeSalonState } = useAdmin();
  const [requests, setRequests] = useState<AdminSalon[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRequests(await getPendingSalons());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les demandes.");
    }
  }, [getPendingSalons]);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  async function decide(salon: AdminSalon, action: "verify" | "reject") {
    await changeSalonState(salon.id, action);
    setRequests((current) => current?.filter((s) => s.id !== salon.id) ?? null);
    setNotice(
      action === "verify"
        ? `${salon.name} est en ligne. Son gérant accède à son espace dès sa prochaine connexion.`
        : `La demande de ${salon.name} a été refusée.`
    );
  }

  return (
    <ManagerPage
      title="Demandes de partenariat"
      description="Vérifiez chaque salon avant de le mettre en ligne. En cas de doute, appelez le numéro indiqué."
    >
      {notice && (
        <p role="status" className="mb-6 rounded-2xl bg-sable/20 px-5 py-4 text-sm text-brand">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {requests === null ? (
        !error && <div className="h-64 animate-pulse rounded-2xl bg-sable/15" aria-busy="true" aria-label="Chargement" />
      ) : requests.length === 0 ? (
        <div className={`${ui.surface} p-8 text-center`}>
          <p className="font-semibold text-brand">Aucune demande en attente</p>
          <p className="mt-1 text-sm text-anthracite/70">Les nouvelles demandes envoyées depuis « Inscrire mon salon » apparaîtront ici.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {requests.map((salon) => (
            <PartnerRequestCard
              key={salon.id}
              salon={salon}
              onValidate={() => decide(salon, "verify")}
              onReject={() => decide(salon, "reject")}
            />
          ))}
        </ul>
      )}
    </ManagerPage>
  );
}

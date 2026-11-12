"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminSalon, SALON_STATE_LABELS, SalonState, salonState, useAdmin } from "@/hooks/useAdmin";
import ManagerPage from "@/components/manager/ManagerPage";
import ConfirmDelete from "@/components/ConfirmDelete";
import SalonRating from "@/components/SalonRating";
import { ui } from "@/lib/ui";

const FILTERS: { key: SalonState | "all"; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "online", label: "En ligne" },
  { key: "deactivated", label: "Désactivés" },
  { key: "suspended", label: "Suspendus" },
  { key: "pending", label: "En attente" },
  { key: "rejected", label: "Refusés" },
];

const STATE_STYLES: Record<SalonState, string> = {
  online: "bg-sable/25 text-brand",
  deactivated: "bg-anthracite/10 text-anthracite/75",
  pending: "bg-champagne-light/30 text-champagne",
  suspended: "bg-alert/10 text-alert",
  rejected: "bg-anthracite/10 text-anthracite/75",
};

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export default function AdminAllSalonsPage() {
  const { getSalons, changeSalonState } = useAdmin();
  const [salons, setSalons] = useState<AdminSalon[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<SalonState | "all">("all");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    try {
      const page = await getSalons();
      setSalons(page.data);
      setTotal(page.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les salons.");
    }
  }, [getSalons]);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  const counts = useMemo(() => {
    const result: Record<SalonState | "all", number> = { all: 0, online: 0, deactivated: 0, pending: 0, suspended: 0, rejected: 0 };
    for (const salon of salons ?? []) {
      result.all += 1;
      result[salonState(salon)] += 1;
    }
    return result;
  }, [salons]);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return (salons ?? []).filter(
      (salon) =>
        (filter === "all" || salonState(salon) === filter) &&
        (q === "" || normalize(`${salon.name} ${salon.city} ${salon.manager?.name ?? ""}`).includes(q))
    );
  }, [salons, filter, query]);

  function replace(updated: AdminSalon) {
    // La réponse ne contient pas le gérant ni les avis : on garde ceux déjà chargés.
    setSalons((current) => current?.map((s) => (s.id === updated.id ? { ...s, ...updated, manager: s.manager } : s)) ?? null);
  }

  return (
    <ManagerPage title="Salons" description="Tous les salons de la plateforme. Un salon suspendu n'apparaît plus dans les recherches.">
      {error && (
        <p role="alert" className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Filtrer par état" className="flex gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-[0_1px_2px_rgba(90,50,35,0.05),0_8px_24px_rgba(90,50,35,0.07)]">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={`min-h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors ${
                filter === key ? "bg-brand text-beige" : "text-anthracite/75 hover:text-brand"
              }`}
            >
              {label}
              {salons && <span className={`ml-1.5 font-normal ${filter === key ? "text-beige/75" : "text-anthracite/75"}`}>{counts[key]}</span>}
            </button>
          ))}
        </div>
        <label className="lg:w-72">
          <span className="sr-only">Rechercher un salon</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, ville ou gérant"
            className={ui.input}
          />
        </label>
      </div>

      {salons === null ? (
        !error && <div className="h-96 animate-pulse rounded-2xl bg-sable/15" aria-busy="true" aria-label="Chargement" />
      ) : visible.length === 0 ? (
        <div className={`${ui.surface} p-8 text-center`}>
          <p className="font-semibold text-brand">Aucun salon</p>
          <p className="mt-1 text-sm text-anthracite/70">
            {query ? "Aucun salon ne correspond à cette recherche." : "Aucun salon dans cet état pour le moment."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((salon) => (
            <SalonRow
              key={salon.id}
              salon={salon}
              onChange={async (action) => replace(await changeSalonState(salon.id, action))}
            />
          ))}
        </ul>
      )}

      {salons && total > salons.length && (
        <p className="mt-4 text-sm text-anthracite/75">
          {salons.length} salons affichés sur {total}, les plus récents d&apos;abord.
        </p>
      )}
    </ManagerPage>
  );
}

function SalonRow({
  salon,
  onChange,
}: {
  salon: AdminSalon;
  onChange: (action: "verify" | "reactivate" | "suspend") => Promise<void>;
}) {
  const state = salonState(salon);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: "verify" | "reactivate") {
    setBusy(true);
    setError(null);
    try {
      await onChange(action);
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'action a échoué.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className={`${ui.surface} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {state === "online" ? (
            <Link href={`/salons/${salon.id}`} className="font-semibold text-brand hover:text-brand-soft" title="Voir la fiche publique">
              {salon.name}
            </Link>
          ) : (
            <p className="font-semibold text-brand">{salon.name}</p>
          )}
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATE_STYLES[state]}`}>{SALON_STATE_LABELS[state]}</span>
        </div>
        <p className="mt-1 text-sm text-anthracite/75">
          {salon.city}
          {salon.manager ? `, gérant : ${salon.manager.name}` : ""}
        </p>
        {/* Une demande n'a jamais été visible : pas de note à afficher. */}
        {(state === "online" || state === "suspended") && (
          <div className="mt-1">
            <SalonRating average={salon.reviews_avg_rating ?? null} count={salon.reviews_count ?? 0} />
          </div>
        )}
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {state === "online" && (
          <ConfirmDelete
            label="Suspendre"
            question={`Suspendre ${salon.name} ? Il disparaîtra des recherches.`}
            confirmLabel="Oui, suspendre"
            busyLabel="Suspension..."
            onConfirm={() => onChange("suspend")}
          />
        )}
        {state === "suspended" && (
          <button type="button" disabled={busy} onClick={() => run("reactivate")} className={ui.buttonSecondary}>
            {busy ? "Remise en ligne..." : "Remettre en ligne"}
          </button>
        )}
        {state === "pending" && (
          <Link href="/admin/salons" className={ui.buttonSecondary}>
            Examiner la demande
          </Link>
        )}
        {state === "rejected" && (
          <button type="button" disabled={busy} onClick={() => run("verify")} className={ui.buttonSecondary}>
            {busy ? "Validation..." : "Valider finalement"}
          </button>
        )}
        {/* Pas de suppression : un salon suspendu garde ses données et son historique. */}
      </div>
    </li>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { type AdminUser, type Page, type UserRoleName, useAdmin } from "@/hooks/useAdmin";
import { useCurrentUser } from "@/hooks/useAuthState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";
import { ui } from "@/lib/ui";

const ROLE_TABS: { key: UserRoleName | ""; label: string }[] = [
  { key: "", label: "Tous" },
  { key: "client", label: "Clientes" },
  { key: "gerant", label: "Gérants" },
  { key: "admin", label: "Administrateurs" },
];

const ROLE_LABELS: Record<UserRoleName, string> = { client: "Cliente", gerant: "Gérant", admin: "Administrateur", employee: "Employé" };

function activity(user: AdminUser): string {
  const parts: string[] = [];
  if (user.salons_count > 0) parts.push(`${user.salons_count} salon${user.salons_count > 1 ? "s" : ""}`);
  if (user.appointments_count > 0) parts.push(`${user.appointments_count} rendez-vous`);
  return parts.length ? parts.join(", ") : "Aucune activité";
}

// Gestion des comptes : recherche, filtre par rôle, suspension et réactivation.
// Pas de suppression ni de changement de rôle ici : les données et
// l'historique d'un compte suspendu sont conservés.
export default function AdminUsersPage() {
  const { getUsers, setUserSuspended } = useAdmin();
  const me = useCurrentUser();
  const { message: toast, showToast } = useToast();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRoleName | "">("");
  const [status, setStatus] = useState<"" | "active" | "suspended">("");
  const [page, setPage] = useState(1);
  const debounced = useDebouncedValue(search.trim(), 300);
  const queryKey = `${debounced}|${role}|${status}|${page}`;
  const [result, setResult] = useState<{ key: string; data: Page<AdminUser> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getUsers({ page, search: debounced, role, status })
      .then((data) => {
        if (active) {
          setResult({ key: queryKey, data });
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [getUsers, page, debounced, role, status, queryKey]);

  function changeFilter(update: () => void) {
    update();
    setPage(1);
    setConfirming(null);
  }

  async function toggle(user: AdminUser) {
    const suspend = user.suspended_at === null;
    setBusy(user.id);
    try {
      const updated = await setUserSuspended(user.id, suspend);
      setResult((prev) => (prev ? { ...prev, data: { ...prev.data, data: prev.data.data.map((u) => (u.id === updated.id ? updated : u)) } } : prev));
      setConfirming(null);
      showToast(suspend ? `Compte de ${user.name} suspendu.` : `Compte de ${user.name} réactivé.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Action impossible.");
    } finally {
      setBusy(null);
    }
  }

  const loading = result?.key !== queryKey;
  const data = result?.data;

  return (
    <main className="flex flex-1 flex-col px-5 pb-10 pt-4 sm:px-8 md:pt-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <div>
          <h1 className="flex min-h-10 items-center font-sans text-[22px] font-medium tracking-tight text-anthracite">Utilisateurs</h1>
          <p className="mt-1 text-sm text-anthracite/70">
            Un compte suspendu ne peut plus se connecter ; ses données et son historique sont conservés.
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full max-w-sm">
            <span className="sr-only">Rechercher par nom ou e-mail</span>
            <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-anthracite/50" />
            <input
              type="search"
              value={search}
              onChange={(e) => changeFilter(() => setSearch(e.target.value))}
              placeholder="Nom ou e-mail"
              className="min-h-11 w-full rounded-xl border border-sable/50 bg-white pl-10 pr-3 text-sm text-anthracite placeholder:text-anthracite/50 focus-visible:outline-2 focus-visible:outline-accent"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Filtrer par rôle" className="flex rounded-xl bg-beige p-1">
              {ROLE_TABS.map((tab) => (
                <button
                  key={tab.key || "all"}
                  type="button"
                  aria-pressed={role === tab.key}
                  onClick={() => changeFilter(() => setRole(tab.key))}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    role === tab.key ? "bg-brand text-beige" : "text-anthracite/75 hover:text-brand"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <select
              aria-label="Filtrer par statut"
              value={status}
              onChange={(e) => changeFilter(() => setStatus(e.target.value as typeof status))}
              className="min-h-10 rounded-xl border border-sable/50 bg-white px-3 text-sm text-anthracite"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="suspended">Suspendus</option>
            </select>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <section aria-label="Liste des utilisateurs" aria-busy={loading} className="rounded-2xl bg-beige p-2 sm:p-4">
          {!data ? (
            <div className="flex flex-col gap-2 p-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-white/70" />
              ))}
            </div>
          ) : data.data.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-anthracite/70">Aucun compte ne correspond à cette recherche.</p>
          ) : (
            <div className={`overflow-x-auto transition-opacity ${loading ? "opacity-60" : ""}`}>
              <table className="w-full min-w-[46rem] text-left text-sm">
                <thead>
                  <tr className="text-anthracite">
                    <th scope="col" className="px-3 pb-3 pt-2 font-medium">
                      Utilisateur
                    </th>
                    <th scope="col" className="px-3 pb-3 pt-2 font-medium">
                      Rôle
                    </th>
                    <th scope="col" className="px-3 pb-3 pt-2 font-medium">
                      Inscription
                    </th>
                    <th scope="col" className="px-3 pb-3 pt-2 font-medium">
                      Activité
                    </th>
                    <th scope="col" className="px-3 pb-3 pt-2 font-medium">
                      Statut
                    </th>
                    <th scope="col" className="px-3 pb-3 pt-2 text-right font-medium">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((user) => {
                    const roles = user.roles.map((r) => r.name);
                    const isAdmin = roles.includes("admin");
                    const isMe = me?.id === user.id;
                    const suspended = user.suspended_at !== null;
                    return (
                      <tr key={user.id} className="border-t border-sable/40 text-anthracite/80">
                        <td className="max-w-[16rem] px-3 py-3">
                          <span className="block truncate font-medium text-anthracite">{user.name}</span>
                          <span className="block truncate text-xs">{user.email}</span>
                        </td>
                        <td className="px-3 py-3">{roles.map((r) => ROLE_LABELS[r] ?? r).join(", ") || "—"}</td>
                        <td className="whitespace-nowrap px-3 py-3 tabular-nums">{new Date(user.created_at).toLocaleDateString("fr-FR")}</td>
                        <td className="px-3 py-3">{activity(user)}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
                              suspended ? "bg-[#f8b4ab] text-[#8a1f16]" : "bg-sauge-soft text-sauge-ink"
                            }`}
                          >
                            {suspended ? "Suspendu" : "Actif"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          {isAdmin || isMe ? (
                            <span className="text-xs text-anthracite/50">—</span>
                          ) : confirming === user.id ? (
                            <span className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                disabled={busy === user.id}
                                onClick={() => toggle(user)}
                                className={suspended ? ui.buttonSecondary : ui.buttonDanger}
                              >
                                {busy === user.id ? "…" : suspended ? "Confirmer" : "Confirmer la suspension"}
                              </button>
                              <button type="button" onClick={() => setConfirming(null)} className="text-sm font-medium text-anthracite/70 hover:text-brand">
                                Annuler
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirming(user.id)}
                              className={`text-sm font-semibold ${suspended ? "text-accent hover:text-brand" : "text-alert hover:text-red-800"}`}
                            >
                              {suspended ? "Réactiver" : "Suspendre"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {data && data.last_page > 1 && (
          <nav aria-label="Pagination" className="flex items-center justify-between text-sm text-anthracite/75">
            <span>
              Page {data.current_page} sur {data.last_page} · {data.total} comptes
            </span>
            <span className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={`${ui.buttonSecondary} disabled:opacity-50`}>
                Précédent
              </button>
              <button
                type="button"
                disabled={page >= data.last_page}
                onClick={() => setPage((p) => p + 1)}
                className={`${ui.buttonSecondary} disabled:opacity-50`}
              >
                Suivant
              </button>
            </span>
          </nav>
        )}
      </div>
      <Toast message={toast} />
    </main>
  );
}

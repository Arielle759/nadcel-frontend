"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api, toErrorMessage } from "@/lib/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatCurrency } from "@/lib/currency";
import { whatsAppLink } from "@/lib/whatsapp";
import HubPage, { HUB_CARD, SalonPicker, useChosenSalon } from "@/components/manager/HubPage";

interface ManagerClient {
  key: string;
  name: string;
  email: string | null;
  phone: string | null;
  has_account: boolean;
  appointments: number;
  visits: number;
  last_visit: string | null;
  next_visit: string | null;
  spent: number;
}

interface ClientsPage {
  data: ManagerClient[];
  current_page: number;
  last_page: number;
  total: number;
}

const dateFr = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—");

// Clients des salons : avec un compte ou enregistrés par le salon (téléphone,
// WhatsApp, sur place). Les plus fidèles d'abord.
export default function ManagerClientsPage() {
  const { salons, salonId, choose } = useChosenSalon();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const term = useDebouncedValue(search.trim(), 300);
  const key = `${salonId ?? "all"}|${term}|${page}`;
  const [state, setState] = useState<{ key: string; data: ClientsPage | null; error: string | null } | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get<ClientsPage>("/manager/clients", { params: { page, ...(term ? { search: term } : {}), ...(salonId ? { salon_id: salonId } : {}) } })
      .then(({ data }) => {
        if (active) setState({ key, data, error: null });
      })
      .catch((err) => {
        if (active) setState((prev) => ({ key, data: prev?.data ?? null, error: toErrorMessage(err, "Impossible de charger les clients.") }));
      });
    return () => {
      active = false;
    };
  }, [key, page, term, salonId]);

  const loading = state?.key !== key;
  const data = state?.data ?? null;

  return (
    <HubPage
      title="Clients"
      subtitle={data ? `${data.total} client${data.total > 1 ? "s" : ""}, les plus fidèles d'abord.` : "Vos clients, les plus fidèles d'abord."}
      actions={
        <SalonPicker
          salons={salons}
          salonId={salonId}
          onChange={(id) => {
            choose(id);
            setPage(1);
          }}
        />
      }
    >
      <label className="relative block w-full max-w-sm">
        <span className="sr-only">Rechercher un client par nom, e-mail ou téléphone</span>
        <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-anthracite/50" />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Nom, e-mail ou téléphone"
          className="h-10 w-full rounded-lg border border-[#ebe4dd] bg-white pl-10 pr-3 text-sm text-anthracite placeholder:text-anthracite/50 focus-visible:outline-2 focus-visible:outline-accent"
        />
      </label>

      {state?.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <section aria-label="Liste des clients" aria-busy={loading} className={`${HUB_CARD} p-2 sm:p-4`}>
        {!data ? (
          <div className="flex flex-col gap-2 p-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-sable/15" />
            ))}
          </div>
        ) : data.data.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-anthracite/70">
            {term ? "Aucun client ne correspond à cette recherche." : "Aucun client pour le moment."}
          </p>
        ) : (
          <div className={`overflow-x-auto transition-opacity ${loading ? "opacity-60" : ""}`}>
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead>
                <tr className="text-anthracite">
                  {["Client", "Contact", "Visites", "Dernière visite", "Prochain rendez-vous", "Encaissé"].map((h) => (
                    <th key={h} scope="col" className="px-3 pb-3 pt-2 font-medium">
                      {h}
                    </th>
                  ))}
                  <th scope="col" className="px-3 pb-3 pt-2">
                    <span className="sr-only">Contacter</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((c) => {
                  const wa = c.phone ? whatsAppLink(c.phone, `Bonjour ${c.name.split(/\s+/)[0]}, `) : null;
                  return (
                    <tr key={c.key} className="border-t border-[#ebe4dd] text-anthracite/80">
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e9dfd6] text-sm font-semibold text-brand"
                          >
                            {c.name.trim().charAt(0).toUpperCase()}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-anthracite">{c.name}</span>
                            <span className="block whitespace-nowrap text-xs text-anthracite/60">{c.has_account ? "Compte Nadcel" : "Saisi par le salon"}</span>
                          </span>
                        </span>
                      </td>
                      <td className="max-w-[14rem] px-3 py-3">
                        <span className="block truncate tabular-nums">{c.phone ?? "—"}</span>
                        {c.email && <span className="block truncate text-xs text-anthracite/60">{c.email}</span>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums">
                        {c.visits}
                        <span className="text-xs text-anthracite/60"> / {c.appointments} rdv</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">{dateFr(c.last_visit)}</td>
                      <td className="whitespace-nowrap px-3 py-3">{dateFr(c.next_visit)}</td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums">{formatCurrency(c.spent)}</td>
                      <td className="px-3 py-3 text-right">
                        {wa && (
                          <a href={wa} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-accent hover:text-brand">
                            WhatsApp
                            <span className="sr-only"> (nouvel onglet)</span>
                          </a>
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
        <nav aria-label="Pagination" className="flex items-center justify-between text-sm text-anthracite/70">
          <span>
            Page {data.current_page} sur {data.last_page}
          </span>
          <span className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-10 rounded-lg border border-[#ebe4dd] bg-white px-4 font-medium text-anthracite disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              type="button"
              disabled={page >= data.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="h-10 rounded-lg border border-[#ebe4dd] bg-white px-4 font-medium text-anthracite disabled:opacity-50"
            >
              Suivant
            </button>
          </span>
        </nav>
      )}
    </HubPage>
  );
}

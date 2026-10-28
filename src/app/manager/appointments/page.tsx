"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarX2, Search } from "lucide-react";
import {
  AppointmentStatus,
  ManagerAppointment,
  OnSitePaymentMethod,
  useManagerAppointments,
} from "@/hooks/useManagerAppointments";
import CloseAppointmentForm from "@/components/manager/CloseAppointmentForm";
import { PAYMENT_METHOD_LABELS } from "@/components/PaymentStatusBadge";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { formatCurrency } from "@/lib/currency";
import { formatDuration } from "@/components/manager/activityFormat";

type Tab = "to_close" | "upcoming" | "completed" | "cancelled" | "all";

const TABS: { key: Tab; label: string }[] = [
  { key: "to_close", label: "À clôturer" },
  { key: "upcoming", label: "À venir" },
  { key: "completed", label: "Terminés" },
  { key: "cancelled", label: "Annulés" },
  { key: "all", label: "Tous" },
];

const OPEN_STATUSES: AppointmentStatus[] = ["pending", "confirmed", "in_progress"];

function isOpen(a: ManagerAppointment): boolean {
  return OPEN_STATUSES.includes(a.status);
}

function belongsTo(tab: Tab, a: ManagerAppointment, now: number): boolean {
  const start = new Date(a.scheduled_at).getTime();
  switch (tab) {
    case "to_close":
      return isOpen(a) && start <= now;
    case "upcoming":
      return isOpen(a) && start > now;
    case "completed":
      return a.status === "completed";
    case "cancelled":
      return a.status === "cancelled";
    default:
      return true;
  }
}

// Comparaison insensible à la casse et aux accents (« Aminata » = « aminata », « tresse » = « tressé »).
function normalize(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(iso: string, now: number): string {
  const date = new Date(iso);
  const today = new Date(now);
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startOf(date) - startOf(today)) / 86_400_000);
  const formatted = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const relative = diff === 0 ? "Aujourd'hui" : diff === 1 ? "Demain" : diff === -1 ? "Hier" : null;
  return relative ? `${relative}, ${formatted}` : formatted;
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}


export default function ManagerAppointmentsPage() {
  const { getAppointments, updateAppointmentStatus, completeAppointment } = useManagerAppointments();
  const [appointments, setAppointments] = useState<ManagerAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [closingId, setClosingId] = useState<number | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab | null>(null); // null : onglet choisi automatiquement
  const [query, setQuery] = useState("");
  // Heure de référence prise au chargement : un rendez-vous ne se clôture qu'après son début.
  const [loadedAt, setLoadedAt] = useState<number | null>(null);
  const { message: toastMessage, showToast } = useToast();

  useEffect(() => {
    let isMounted = true;

    getAppointments()
      .then((data) => {
        if (isMounted) {
          setAppointments(data);
          setLoadedAt(Date.now());
        }
      })
      .catch(() => {
        if (isMounted) setError("Impossible de charger les rendez-vous.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [getAppointments]);

  const now = loadedAt ?? 0;

  const counts = useMemo(() => {
    const result = {} as Record<Tab, number>;
    for (const { key } of TABS) {
      result[key] = appointments.filter((a) => belongsTo(key, a, now)).length;
    }
    return result;
  }, [appointments, now]);

  // Par défaut : ce qui demande une action (à clôturer), sinon les prochains rendez-vous.
  const activeTab: Tab = tab ?? (counts.to_close > 0 ? "to_close" : "upcoming");

  const groups = useMemo(() => {
    const needle = normalize(query.trim());
    const filtered = appointments
      .filter((a) => belongsTo(activeTab, a, now))
      .filter((a) => !needle || normalize(`${a.client?.name ?? ""} ${a.service?.name ?? ""}`).includes(needle))
      .sort((a, b) => {
        const diff = new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
        return activeTab === "upcoming" ? diff : -diff;
      });

    const byDay = new Map<string, ManagerAppointment[]>();
    for (const a of filtered) {
      const key = dayKey(a.scheduled_at);
      byDay.set(key, [...(byDay.get(key) ?? []), a]);
    }
    return [...byDay.values()];
  }, [appointments, activeTab, query, now]);

  function replace(updated: ManagerAppointment) {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
  }

  async function handleStatusChange(id: number, status: AppointmentStatus) {
    setUpdatingId(id);
    try {
      replace(await updateAppointmentStatus(id, status));
      setCancelingId(null);
      showToast(status === "confirmed" ? "Rendez-vous confirmé." : "Rendez-vous annulé. Le client a été prévenu.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Action impossible.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleClose(id: number, amount: number, method: OnSitePaymentMethod) {
    setUpdatingId(id);
    try {
      replace(await completeAppointment(id, amount, method));
      setClosingId(null);
      showToast("Rendez-vous clôturé et paiement enregistré.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Impossible de clôturer le rendez-vous.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-5 bg-gradient-to-br from-beige via-beige to-sage/15 px-5 py-6 sm:px-8 lg:px-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-forest sm:text-3xl">Rendez-vous</h1>
        <p className="mt-1 text-sm text-anthracite/70">
          Après chaque prestation, clôturez le rendez-vous en notant le paiement reçu sur place.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filtrer les rendez-vous" className="flex gap-1 overflow-x-auto rounded-xl border border-sage/25 bg-white/60 p-1">
          {TABS.map(({ key, label }) => {
            const active = activeTab === key;
            const alert = key === "to_close" && counts.to_close > 0;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setTab(key)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active ? "bg-forest text-beige shadow-sm" : "text-anthracite/70 hover:bg-sage/10"
                }`}
              >
                {label}
                <span
                  className={`min-w-5 rounded-full px-1.5 text-center text-[11px] font-semibold ${
                    active ? "bg-beige/20 text-beige" : alert ? "bg-champagne/20 text-champagne" : "bg-sage/15 text-anthracite/60"
                  }`}
                >
                  {loading ? "…" : counts[key]}
                </span>
              </button>
            );
          })}
        </div>

        <label className="relative w-full lg:w-72">
          <span className="sr-only">Rechercher un client ou une prestation</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-anthracite/45" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Client ou prestation"
            className="w-full rounded-xl border border-sage/30 bg-white/70 py-2 pl-9 pr-3 text-sm outline-none focus:border-dark-sage focus:ring-4 focus:ring-sage/10"
          />
        </label>
      </div>

      {loading && (
        <div className="flex flex-col gap-2" aria-label="Chargement des rendez-vous" aria-busy="true">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-16 animate-pulse rounded-xl border border-sage/20 bg-sage/10" />
          ))}
        </div>
      )}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      {!loading && !error && groups.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-sage/30 py-12 text-center">
          <CalendarX2 size={28} className="text-anthracite/30" aria-hidden="true" />
          <p className="font-medium text-anthracite/75">
            {query ? "Aucun rendez-vous ne correspond à votre recherche." : emptyMessage(activeTab)}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <section key={dayKey(group[0].scheduled_at)} aria-label={dayLabel(group[0].scheduled_at, now)}>
            <h2 className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-[0.12em] text-anthracite/55">
              <span className="first-letter:uppercase">{dayLabel(group[0].scheduled_at, now)}</span>
              <span className="font-normal normal-case tracking-normal text-anthracite/40">
                ({group.length})
              </span>
            </h2>
            <ul className="divide-y divide-sage/15 overflow-hidden rounded-2xl border border-sage/20 bg-white/70 shadow-[0_6px_20px_rgba(45,59,40,0.05)]">
              {group.map((a) => (
                <AppointmentRow
                  key={a.id}
                  appointment={a}
                  now={now}
                  busy={updatingId === a.id}
                  closing={closingId === a.id}
                  canceling={cancelingId === a.id}
                  onConfirm={() => handleStatusChange(a.id, "confirmed")}
                  onStartClose={() => {
                    setCancelingId(null);
                    setClosingId(a.id);
                  }}
                  onClose={(amount, method) => handleClose(a.id, amount, method)}
                  onStopClose={() => setClosingId(null)}
                  onAskCancel={() => {
                    setClosingId(null);
                    setCancelingId(a.id);
                  }}
                  onCancel={() => handleStatusChange(a.id, "cancelled")}
                  onKeep={() => setCancelingId(null)}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {appointments.length >= 100 && (
        <p className="text-xs text-anthracite/50">Affichage des 100 rendez-vous les plus récents.</p>
      )}

      <Toast message={toastMessage} />
    </main>
  );
}

function emptyMessage(tab: Tab): string {
  switch (tab) {
    case "to_close":
      return "Tout est à jour : aucun rendez-vous passé en attente de clôture.";
    case "upcoming":
      return "Aucun rendez-vous à venir pour le moment.";
    case "completed":
      return "Aucun rendez-vous terminé pour l'instant.";
    case "cancelled":
      return "Aucun rendez-vous annulé.";
    default:
      return "Aucun rendez-vous enregistré.";
  }
}

function StatusPill({ appointment, now }: { appointment: ManagerAppointment; now: number }) {
  const past = new Date(appointment.scheduled_at).getTime() <= now;
  const { label, className } = (() => {
    if (isOpen(appointment) && past) return { label: "À clôturer", className: "bg-champagne/15 text-champagne" };
    switch (appointment.status) {
      case "pending":
        return { label: "À confirmer", className: "bg-amber-100 text-amber-800" };
      case "completed":
        return { label: "Terminé", className: "bg-sage/20 text-link-sage" };
      case "cancelled":
        return { label: "Annulé", className: "bg-terracotta/10 text-terracotta" };
      default:
        return { label: "Confirmé", className: "bg-forest/10 text-forest" };
    }
  })();

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

function AppointmentRow({
  appointment: a,
  now,
  busy,
  closing,
  canceling,
  onConfirm,
  onStartClose,
  onClose,
  onStopClose,
  onAskCancel,
  onCancel,
  onKeep,
}: {
  appointment: ManagerAppointment;
  now: number;
  busy: boolean;
  closing: boolean;
  canceling: boolean;
  onConfirm: () => void;
  onStartClose: () => void;
  onClose: (amount: number, method: OnSitePaymentMethod) => void;
  onStopClose: () => void;
  onAskCancel: () => void;
  onCancel: () => void;
  onKeep: () => void;
}) {
  const started = new Date(a.scheduled_at).getTime() <= now;
  const open = isOpen(a);
  const cancelled = a.status === "cancelled";

  return (
    <li className={`flex flex-col gap-3 px-4 py-3 sm:px-5 ${cancelled ? "opacity-60" : ""}`}>
      <div className="grid grid-cols-[4.5rem_1fr] items-center gap-x-4 gap-y-2 md:grid-cols-[4.5rem_minmax(0,1fr)_10rem_8rem_auto]">
        <div className="leading-tight">
          <p className={`text-base font-semibold text-forest ${cancelled ? "line-through" : ""}`}>{timeLabel(a.scheduled_at)}</p>
          {a.duration > 0 && <p className="text-xs text-anthracite/50">{formatDuration(a.duration)}</p>}
        </div>

        <div className="min-w-0">
          <p className="truncate font-semibold text-anthracite">{a.client?.name ?? "Client"}</p>
          <p className="truncate text-sm text-anthracite/65">{a.service?.name ?? "Prestation"}</p>
        </div>

        <p className="col-start-2 truncate text-sm text-anthracite/65 md:col-start-auto">
          <span className="md:hidden">Avec </span>
          {a.employee?.name ?? "Non attribué"}
        </p>

        <div className="col-start-2 md:col-start-auto">
          <StatusPill appointment={a} now={now} />
        </div>

        <div className="col-span-2 flex flex-wrap items-center justify-end gap-2 md:col-span-1">
          {a.status === "completed" && (
            <span className="text-sm font-medium text-anthracite/75">
              {formatCurrency(Number(a.amount_paid ?? a.price))}
              {a.payment_method && <span className="text-anthracite/50"> par {PAYMENT_METHOD_LABELS[a.payment_method]}</span>}
            </span>
          )}

          {open && !closing && !canceling && (
            <>
              {a.status === "pending" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={onConfirm}
                  className="rounded-lg border border-forest/30 px-3 py-1.5 text-xs font-semibold text-forest transition-colors hover:bg-forest/5 disabled:opacity-50"
                >
                  Confirmer
                </button>
              )}
              {a.status !== "pending" && started && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={onStartClose}
                  className="rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-beige transition-colors hover:bg-dark-sage disabled:opacity-50"
                >
                  Clôturer
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={onAskCancel}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-terracotta transition-colors hover:bg-terracotta/10 disabled:opacity-50"
              >
                Annuler
              </button>
            </>
          )}

          {canceling && (
            <span className="flex items-center gap-2 text-xs">
              <span className="text-anthracite/70">Annuler ce rendez-vous ?</span>
              <button
                type="button"
                disabled={busy}
                onClick={onCancel}
                className="rounded-lg bg-terracotta px-3 py-1.5 font-semibold text-white transition-colors hover:brightness-95 disabled:opacity-50"
              >
                Oui, annuler
              </button>
              <button type="button" onClick={onKeep} className="rounded-lg px-2.5 py-1.5 font-medium text-anthracite/65 hover:bg-sage/10">
                Non
              </button>
            </span>
          )}
        </div>
      </div>

      {closing && (
        <CloseAppointmentForm
          appointmentId={a.id}
          defaultAmount={Number(a.price)}
          submitting={busy}
          onSubmit={onClose}
          onCancel={onStopClose}
        />
      )}
    </li>
  );
}

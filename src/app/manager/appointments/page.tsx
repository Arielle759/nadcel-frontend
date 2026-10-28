"use client";

import { useEffect, useState } from "react";
import {
  AppointmentStatus,
  ManagerAppointment,
  OnSitePaymentMethod,
  useManagerAppointments,
} from "@/hooks/useManagerAppointments";
import CloseAppointmentForm from "@/components/manager/CloseAppointmentForm";
import { Calendar, Scissors, UserRound } from "lucide-react";
import AppointmentStatusBadge from "@/components/AppointmentStatusBadge";
import PaymentStatusBadge from "@/components/PaymentStatusBadge";
import EmptyState from "@/components/EmptyState";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import AppointmentDateTime from "@/components/AppointmentDateTime";

export default function ManagerAppointmentsPage() {
  const { getAppointments, updateAppointmentStatus, completeAppointment } =
    useManagerAppointments();
  const [appointments, setAppointments] = useState<ManagerAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [closingId, setClosingId] = useState<number | null>(null);
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

  async function handleStatusChange(id: number, status: AppointmentStatus) {
    setUpdatingId(id);
    try {
      const updated = await updateAppointmentStatus(id, status);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      if (status === "confirmed") {
        showToast("Rendez-vous confirmé avec succès.");
      } else if (status === "cancelled") {
        showToast("Rendez-vous annulé.");
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleClose(id: number, amount: number, method: OnSitePaymentMethod) {
    setUpdatingId(id);
    try {
      const updated = await completeAppointment(id, amount, method);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setClosingId(null);
      showToast("Rendez-vous clôturé et paiement enregistré.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Impossible de clôturer le rendez-vous.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-8 bg-gradient-to-br from-beige to-sage/20 px-6 py-12 sm:px-16">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
          Gestion du salon
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-forest">Rendez-vous</h1>
        <p className="max-w-2xl text-anthracite/70">
          Confirmez les demandes et, une fois la prestation réalisée, clôturez le rendez-vous en notant le paiement reçu sur place.
        </p>
      </div>

      {loading && (
        <div className="space-y-4" aria-label="Chargement des rendez-vous" aria-busy="true">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-40 animate-pulse rounded-2xl border border-sage/20 bg-sage/10" />
          ))}
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && appointments.length === 0 && (
        <EmptyState message="Aucun rendez-vous prévu pour le moment." icon={Calendar} />
      )}

      <div className="flex flex-col gap-5">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex flex-col gap-5 rounded-2xl border border-sage/20 bg-beige p-5 shadow-[0_10px_30px_rgba(45,59,40,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-[0_16px_38px_rgba(45,59,40,0.12)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
          >
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage/15 text-link-sage">
                  <UserRound size={18} aria-hidden="true" />
                </span>
                <p className="text-lg font-semibold text-forest">{appointment.client.name}</p>
              </div>
              <p className="inline-flex items-center gap-2 text-sm text-anthracite/75">
                <Scissors size={16} className="text-terracotta" aria-hidden="true" />
                {appointment.service.name}
              </p>
              <AppointmentDateTime scheduledAt={appointment.scheduled_at} />
              <div className="flex flex-wrap items-center gap-2">
                <AppointmentStatusBadge status={appointment.status} />
                {appointment.status === "completed" && (
                  <PaymentStatusBadge
                    status={appointment.payment_status}
                    method={appointment.payment_method}
                    amount={appointment.amount_paid}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {appointment.status === "pending" && (
                <>
                  <button
                    type="button"
                    disabled={updatingId === appointment.id}
                    onClick={() => handleStatusChange(appointment.id, "confirmed")}
                    className="rounded-full bg-dark-sage px-4 py-2 text-sm font-medium text-beige transition-colors hover:bg-sage disabled:opacity-50"
                  >
                    Confirmer
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === appointment.id}
                    onClick={() => handleStatusChange(appointment.id, "cancelled")}
                    className="rounded-full border border-terracotta px-4 py-2 text-sm font-medium text-terracotta transition-colors hover:bg-terracotta hover:text-white disabled:opacity-50"
                  >
                    Annuler
                  </button>
                </>
              )}

              {appointment.status === "confirmed" &&
                (closingId === appointment.id ? (
                  <CloseAppointmentForm
                    appointmentId={appointment.id}
                    defaultAmount={Number(appointment.price)}
                    submitting={updatingId === appointment.id}
                    onSubmit={(amount, method) => handleClose(appointment.id, amount, method)}
                    onCancel={() => setClosingId(null)}
                  />
                ) : (
                  <>
                    {loadedAt !== null && new Date(appointment.scheduled_at).getTime() <= loadedAt ? (
                      <button
                        type="button"
                        disabled={updatingId === appointment.id}
                        onClick={() => setClosingId(appointment.id)}
                        className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-beige transition-colors hover:bg-dark-sage disabled:opacity-50"
                      >
                        Clôturer
                      </button>
                    ) : (
                      <span className="text-xs text-anthracite/60">Clôture possible après l&apos;heure du rendez-vous</span>
                    )}
                    <button
                      type="button"
                      disabled={updatingId === appointment.id}
                      onClick={() => handleStatusChange(appointment.id, "cancelled")}
                      className="rounded-full border border-terracotta px-4 py-2 text-sm font-medium text-terracotta transition-colors hover:bg-terracotta hover:text-white disabled:opacity-50"
                    >
                      Annuler
                    </button>
                  </>
                ))}
            </div>
          </div>
        ))}
      </div>

      <Toast message={toastMessage} />
    </main>
  );
}

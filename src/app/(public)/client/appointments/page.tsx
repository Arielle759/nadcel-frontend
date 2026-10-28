"use client";

import { useEffect, useState } from "react";
import { Banknote, Calendar, CircleCheckBig, Scissors } from "lucide-react";
import { ClientAppointment, useClientAppointments } from "@/hooks/useClientAppointments";
import AppointmentStatusBadge from "@/components/AppointmentStatusBadge";
import EmptyState from "@/components/EmptyState";
import { useHasMounted } from "@/hooks/useHasMounted";
import { formatDateTime } from "@/lib/date";
import { formatCurrency } from "@/lib/currency";
import AppointmentDateTime from "@/components/AppointmentDateTime";

const CANCELLABLE_STATUSES = new Set(["pending", "confirmed"]);

function isMoreThan24hAway(scheduledAt: string): boolean {
  const appointmentTime = new Date(scheduledAt).getTime();
  return appointmentTime - Date.now() > 24 * 60 * 60 * 1000;
}

export default function ClientAppointmentsPage() {
  const { getMyAppointments, cancelAppointment, submitReview } = useClientAppointments();
  const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());
  const mounted = useHasMounted();

  useEffect(() => {
    let isMounted = true;

    getMyAppointments()
      .then((data) => {
        if (isMounted) setAppointments(data);
      })
      .catch(() => {
        if (isMounted) setError("Impossible de charger vos réservations.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [getMyAppointments]);

  async function handleCancel(id: number) {
    if (!window.confirm("Annuler cette réservation ?")) return;
    setCancellingId(id);
    try {
      const updated = await cancelAppointment(id);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } finally {
      setCancellingId(null);
    }
  }

  function openReviewForm(id: number) {
    setReviewingId(id);
    setReviewNote(5);
    setReviewComment("");
    setReviewError(null);
  }

  function closeReviewForm() {
    setReviewingId(null);
    setReviewError(null);
  }

  async function handleSubmitReview(id: number) {
    setSubmittingReview(true);
    setReviewError(null);
    try {
      await submitReview(id, { rating: reviewNote, comment: reviewComment });
      setReviewedIds((prev) => new Set(prev).add(id));
      setReviewingId(null);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Impossible d'envoyer l'avis.");
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-8 bg-gradient-to-br from-beige to-sage/20 px-6 py-12 sm:px-16">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
          Votre espace
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-forest">Mes réservations</h1>
        <p className="max-w-2xl text-anthracite/70">
          Retrouvez vos prochains rendez-vous et suivez leur confirmation en un coup d&apos;œil.
        </p>
      </div>

      {loading && (
        <div className="space-y-4" aria-label="Chargement des réservations" aria-busy="true">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-44 animate-pulse rounded-2xl border border-sage/20 bg-sage/10" />
          ))}
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && appointments.length === 0 && (
        <EmptyState
          message="Vous n'avez aucune réservation pour le moment."
          icon={Calendar}
        />
      )}

      <div className="flex flex-col gap-5">
        {appointments.map((appointment) => {
          const canCancel =
            mounted &&
            CANCELLABLE_STATUSES.has(appointment.status) &&
            isMoreThan24hAway(appointment.scheduled_at);

          const canReview =
            appointment.status === "completed" &&
            !appointment.review &&
            !reviewedIds.has(appointment.id);

          const isReviewing = reviewingId === appointment.id;

          return (
            <div
              key={appointment.id}
              className="flex flex-col gap-5 rounded-2xl border border-sage/20 bg-beige p-5 shadow-[0_10px_30px_rgba(45,59,40,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-[0_16px_38px_rgba(45,59,40,0.12)] sm:flex-row sm:items-start sm:justify-between sm:p-6"
            >
              <div className="flex flex-1 flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold text-forest">{appointment.salon.name}</p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm text-anthracite/75">
                      <Scissors size={16} className="text-terracotta" aria-hidden="true" />
                      {appointment.service.name}
                    </p>
                  </div>
                  <AppointmentStatusBadge status={appointment.status} />
                </div>
                <AppointmentDateTime scheduledAt={appointment.scheduled_at} />
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-anthracite">
                  <Banknote size={17} className="text-link-sage" aria-hidden="true" />
                  {formatCurrency(Number(appointment.price))}
                </p>
                {appointment.status === "confirmed" && (
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900">
                    <CircleCheckBig size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <p>Votre rendez-vous est prévu le {formatDateTime(appointment.scheduled_at)}.</p>
                  </div>
                )}
              </div>

              {(canCancel || canReview || isReviewing) && (
                <div className="flex flex-col items-stretch gap-2 sm:items-end">
                  {canCancel && (
                    <button
                      type="button"
                      disabled={cancellingId === appointment.id}
                      onClick={() => handleCancel(appointment.id)}
                      className="self-start rounded-full border border-terracotta px-4 py-2 text-sm font-medium text-terracotta transition-colors hover:bg-terracotta hover:text-white disabled:opacity-50 sm:self-end"
                    >
                      {cancellingId === appointment.id ? "Annulation..." : "Annuler"}
                    </button>
                  )}

                  {canReview && !isReviewing && (
                    <button
                      type="button"
                      onClick={() => openReviewForm(appointment.id)}
                      className="self-start rounded-full border border-dark-sage px-4 py-2 text-sm font-medium text-link-sage transition-colors hover:bg-sage/10 sm:self-end"
                    >
                      Laisser un avis
                    </button>
                  )}

                  {isReviewing && (
                    <div className="flex w-full flex-col gap-2 rounded-md border border-sage/40 p-3 sm:w-72">
                      <label
                        htmlFor={`note-${appointment.id}`}
                        className="text-xs font-medium text-anthracite"
                      >
                        Note
                      </label>
                      <select
                        id={`note-${appointment.id}`}
                        value={reviewNote}
                        onChange={(e) => setReviewNote(Number(e.target.value))}
                        className="rounded-md border border-sage/40 px-2 py-1 text-sm"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n} ★
                          </option>
                        ))}
                      </select>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Votre commentaire"
                        rows={3}
                        className="rounded-md border border-sage/40 px-2 py-1 text-sm"
                      />
                      {reviewError && <p className="text-xs text-red-600">{reviewError}</p>}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={submittingReview}
                          onClick={() => handleSubmitReview(appointment.id)}
                          className="rounded-full bg-dark-sage px-4 py-2 text-sm font-medium text-beige transition-colors hover:bg-sage disabled:opacity-50"
                        >
                          {submittingReview ? "Envoi..." : "Envoyer"}
                        </button>
                        <button
                          type="button"
                          onClick={closeReviewForm}
                          className="rounded-full border border-dark-sage px-4 py-2 text-sm font-medium text-link-sage transition-colors hover:bg-sage/10"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

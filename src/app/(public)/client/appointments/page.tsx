"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClientAppointment, useClientAppointments } from "@/hooks/useClientAppointments";
import AppointmentStatusBadge from "@/components/AppointmentStatusBadge";
import { formatCurrency } from "@/lib/currency";
import { formatDuration } from "@/lib/duration";
import { ui } from "@/lib/ui";

const CANCELLATION_HOURS = 24;

type Tab = "upcoming" | "past";

// Même règle que le backend (Appointment::clientCanCancel) : une demande en attente
// s'annule à tout moment, un rendez-vous confirmé jusqu'à 24 h avant.
function clientCanCancel(appointment: ClientAppointment, now: number): boolean {
  if (appointment.status === "pending") return true;
  if (appointment.status !== "confirmed") return false;
  return new Date(appointment.scheduled_at).getTime() - now > CANCELLATION_HOURS * 60 * 60 * 1000;
}

function isUpcoming(appointment: ClientAppointment, now: number): boolean {
  return (
    (appointment.status === "pending" || appointment.status === "confirmed") &&
    new Date(appointment.scheduled_at).getTime() >= now
  );
}

function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return minutes === 0 ? `${hours} h` : `${hours} h ${String(minutes).padStart(2, "0")}`;
}

function StarRating({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Note sur 5" className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} sur 5`}
          onClick={() => onChange(n)}
          className={`flex h-10 w-10 items-center justify-center rounded-full text-2xl transition-colors ${
            n <= value ? "text-champagne" : "text-anthracite/25 hover:text-champagne/60"
          }`}
        >
          <span aria-hidden="true">★</span>
        </button>
      ))}
    </div>
  );
}

export default function ClientAppointmentsPage() {
  const { getMyAppointments, cancelAppointment, submitReview } = useClientAppointments();
  const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
  const [now, setNow] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("upcoming");

  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<{ id: number; message: string } | null>(null);

  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    let isMounted = true;

    getMyAppointments()
      .then((data) => {
        if (!isMounted) return;
        setAppointments(data);
        setNow(Date.now());
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

  const { upcoming, past } = useMemo(() => {
    if (now === null) return { upcoming: [], past: [] };
    const time = (a: ClientAppointment) => new Date(a.scheduled_at).getTime();
    return {
      upcoming: appointments.filter((a) => isUpcoming(a, now)).sort((a, b) => time(a) - time(b)),
      past: appointments.filter((a) => !isUpcoming(a, now)).sort((a, b) => time(b) - time(a)),
    };
  }, [appointments, now]);

  const visible = tab === "upcoming" ? upcoming : past;

  async function handleCancel(id: number) {
    setCancellingId(id);
    setActionError(null);
    try {
      const updated = await cancelAppointment(id);
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: updated.status } : a)));
      setConfirmCancelId(null);
    } catch (err) {
      setActionError({ id, message: err instanceof Error ? err.message : "Impossible d'annuler la réservation." });
    } finally {
      setCancellingId(null);
    }
  }

  function openReviewForm(id: number) {
    setReviewingId(id);
    setReviewNote(5);
    setReviewComment("");
    setActionError(null);
  }

  async function handleSubmitReview(id: number) {
    setSubmittingReview(true);
    setActionError(null);
    try {
      await submitReview(id, { rating: reviewNote, comment: reviewComment });
      setReviewedIds((prev) => new Set(prev).add(id));
      setReviewingId(null);
    } catch (err) {
      setActionError({ id, message: err instanceof Error ? err.message : "Impossible d'envoyer l'avis." });
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col px-6 pb-24 pt-12 sm:px-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h1 className={`${ui.sectionTitleBase} text-forest`}>
            Mes réservations
          </h1>
          <Link href="/salons" className={ui.buttonPrimary}>
            Nouvelle réservation
          </Link>
        </div>

        <div role="tablist" aria-label="Période" className={`${ui.surface} mt-10 inline-flex gap-1 rounded-full p-1`}>
          {(
            [
              ["upcoming", "À venir", upcoming.length],
              ["past", "Passées", past.length],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`min-h-10 rounded-full px-5 text-sm font-semibold transition-colors ${
                tab === key ? "bg-forest text-beige" : "text-anthracite/75 hover:text-forest"
              }`}
            >
              {label} {!loading && <span className={tab === key ? "text-beige/70" : "text-anthracite/50"}>({count})</span>}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4" aria-busy={loading}>
          {loading &&
            [0, 1, 2].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl bg-sage/15" />)}

          {error && <p className="text-sm text-red-700">{error}</p>}

          {!loading && !error && visible.length === 0 && (
            <div className={`${ui.surface} flex flex-col items-center gap-4 px-6 py-14 text-center`}>
              <p className="font-heading text-2xl font-semibold text-forest">
                {tab === "upcoming" ? "Aucun rendez-vous à venir" : "Aucune réservation passée"}
              </p>
              <p className="max-w-md text-sm leading-6 text-anthracite/75">
                {tab === "upcoming"
                  ? "Trouvez un salon près de chez vous et réservez votre prochain moment beauté en moins d'une minute."
                  : "Vos rendez-vous terminés ou annulés apparaîtront ici."}
              </p>
              {tab === "upcoming" && (
                <Link href="/salons" className={ui.buttonPrimary}>
                  Trouver un salon
                </Link>
              )}
            </div>
          )}

          {now !== null &&
            visible.map((appointment) => {
              const date = new Date(appointment.scheduled_at);
              const canCancel = clientCanCancel(appointment, now);
              const tooLateToCancel = appointment.status === "confirmed" && isUpcoming(appointment, now) && !canCancel;
              const canReview =
                appointment.status === "completed" && !appointment.review && !reviewedIds.has(appointment.id);
              const isReviewing = reviewingId === appointment.id;
              const isConfirmingCancel = confirmCancelId === appointment.id;
              const itemError = actionError?.id === appointment.id ? actionError.message : null;

              return (
                <article key={appointment.id} className={`${ui.surface} p-5 sm:p-6`}>
                  <div className="flex gap-5">
                    <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-beige py-3 text-center">
                      <span className="text-xs text-anthracite/70">
                        {date.toLocaleDateString("fr-FR", { weekday: "short" })}
                      </span>
                      <span className="font-heading text-2xl font-semibold leading-tight text-forest">{date.getDate()}</span>
                      <span className="text-xs text-anthracite/70">{date.toLocaleDateString("fr-FR", { month: "short" })}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                        <div className="min-w-0">
                          <Link
                            href={`/salons/${appointment.salon.id}`}
                            className="text-lg font-semibold text-forest transition-colors hover:text-dark-sage"
                          >
                            {appointment.salon.name}
                          </Link>
                          <p className="mt-0.5 text-sm text-anthracite/80">
                            {appointment.service.name}, {formatDuration(appointment.duration ?? appointment.service.duration)}
                          </p>
                        </div>
                        <AppointmentStatusBadge status={appointment.status} />
                      </div>

                      <p className="mt-3 text-sm text-anthracite/80">
                        <span className="font-semibold text-anthracite">{formatTime(date)}</span>
                        {appointment.employee?.name && <>, avec {appointment.employee.name}</>}
                        {", "}
                        {formatCurrency(Number(appointment.price))}
                      </p>

                      {appointment.status === "pending" && (
                        <p className="mt-2 text-sm text-anthracite/70">En attente de confirmation par le salon.</p>
                      )}
                      {tooLateToCancel && (
                        <p className="mt-2 text-sm text-anthracite/70">
                          Moins de {CANCELLATION_HOURS} h avant le rendez-vous : pour annuler, contactez directement le salon.
                        </p>
                      )}
                      {appointment.review && (
                        <p className="mt-2 text-sm text-anthracite/70">
                          Votre avis : <span className="text-champagne">{"★".repeat(appointment.review.rating)}</span>
                        </p>
                      )}
                      {reviewedIds.has(appointment.id) && (
                        <p className="mt-2 text-sm font-medium text-forest">Merci, votre avis a été publié.</p>
                      )}

                      {(canCancel || canReview || appointment.status === "completed" || appointment.status === "cancelled") &&
                        !isReviewing &&
                        !isConfirmingCancel && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {canReview && (
                              <button type="button" onClick={() => openReviewForm(appointment.id)} className={ui.buttonPrimary}>
                                Laisser un avis
                              </button>
                            )}
                            {(appointment.status === "completed" || appointment.status === "cancelled") && (
                              <Link
                                href={`/salons/${appointment.salon.id}/appointments?service=${appointment.service.id}`}
                                className={ui.buttonSecondary}
                              >
                                Réserver à nouveau
                              </Link>
                            )}
                            {canCancel && (
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmCancelId(appointment.id);
                                  setActionError(null);
                                }}
                                className={`${ui.buttonSecondary} text-red-800`}
                              >
                                Annuler
                              </button>
                            )}
                          </div>
                        )}

                      {isConfirmingCancel && (
                        <div className="mt-4 rounded-2xl bg-red-50 p-4">
                          <p className="text-sm font-medium text-red-900">Annuler ce rendez-vous ? Le salon sera prévenu.</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={cancellingId === appointment.id}
                              onClick={() => handleCancel(appointment.id)}
                              className="inline-flex min-h-11 items-center rounded-full bg-red-800 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-900 disabled:opacity-60"
                            >
                              {cancellingId === appointment.id ? "Annulation..." : "Oui, annuler"}
                            </button>
                            <button type="button" onClick={() => setConfirmCancelId(null)} className={ui.buttonSecondary}>
                              Garder le rendez-vous
                            </button>
                          </div>
                        </div>
                      )}

                      {isReviewing && (
                        <div className="mt-4 rounded-2xl bg-beige p-4">
                          <p className="text-sm font-semibold text-forest">Comment s&apos;est passé votre rendez-vous ?</p>
                          <div className="mt-2">
                            <StarRating value={reviewNote} onChange={setReviewNote} />
                          </div>
                          <label htmlFor={`comment-${appointment.id}`} className="sr-only">
                            Votre commentaire
                          </label>
                          <textarea
                            id={`comment-${appointment.id}`}
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Accueil, ponctualité, résultat... (facultatif)"
                            rows={3}
                            className="mt-3 w-full rounded-2xl bg-white px-4 py-3 text-sm text-anthracite outline-none shadow-[0_1px_2px_rgba(45,59,40,0.06)] focus:shadow-[0_0_0_2px_var(--color-forest)]"
                          />
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={submittingReview}
                              onClick={() => handleSubmitReview(appointment.id)}
                              className={ui.buttonPrimary}
                            >
                              {submittingReview ? "Envoi..." : "Publier mon avis"}
                            </button>
                            <button type="button" onClick={() => setReviewingId(null)} className={ui.buttonSecondary}>
                              Plus tard
                            </button>
                          </div>
                        </div>
                      )}

                      {itemError && (
                        <p role="alert" className="mt-3 text-sm text-red-700">
                          {itemError}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </div>
    </main>
  );
}

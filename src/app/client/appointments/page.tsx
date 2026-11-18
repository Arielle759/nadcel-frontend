"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClientAppointment, useClientAppointments } from "@/hooks/useClientAppointments";
import AppointmentStatusBadge from "@/components/AppointmentStatusBadge";
import AddToCalendar from "@/components/AddToCalendar";
import type { CalendarEvent } from "@/lib/calendar";
import { formatCurrency } from "@/lib/currency";
import { formatDuration } from "@/lib/duration";
import { ui } from "@/lib/ui";
import { NextAppointmentCard } from "@/components/client/ClientHighlights";

const LATE_CANCELLATION_HOURS = 24;

// Même règle que le backend (Appointment::clientCanCancel) : annulation en ligne
// possible jusqu'à l'heure du rendez-vous.
function clientCanCancel(appointment: ClientAppointment, now: number): boolean {
  if (appointment.status !== "pending" && appointment.status !== "confirmed") return false;
  return new Date(appointment.scheduled_at).getTime() > now;
}

// Annulation tardive : rendez-vous confirmé, moins de 24 h avant (Appointment::isLateCancellation).
function isLateCancellation(appointment: ClientAppointment, now: number): boolean {
  return (
    appointment.status === "confirmed" &&
    new Date(appointment.scheduled_at).getTime() - now <= LATE_CANCELLATION_HOURS * 60 * 60 * 1000
  );
}

// Un salon suspendu, retiré ou supprimé, ou un service désactivé, ne peut plus
// être réservé : pas de bouton « Réserver à nouveau » (il mènerait à une page
// introuvable).
function stillBookable(a: ClientAppointment): boolean {
  const { salon, service } = a;
  return (
    salon.is_active !== false &&
    salon.is_verified !== false &&
    !salon.deactivated_at &&
    !salon.deleted_at &&
    service.is_active !== false &&
    !service.deleted_at
  );
}

function isUpcoming(appointment: ClientAppointment, now: number): boolean {
  return (
    (appointment.status === "pending" || appointment.status === "confirmed") &&
    new Date(appointment.scheduled_at).getTime() >= now
  );
}

function calendarEventFor(appointment: ClientAppointment): CalendarEvent {
  const start = new Date(appointment.scheduled_at);
  const minutes = appointment.duration ?? appointment.service.duration;
  const { salon } = appointment;
  const location = [salon.name, salon.address, salon.city].filter(Boolean).join(", ");
  const details = [
    `${appointment.service.name}${appointment.employee?.name ? ` avec ${appointment.employee.name}` : ""}.`,
    `Prix : ${formatCurrency(Number(appointment.price))}, à régler au salon.`,
    salon.phone ? `Salon : ${salon.phone}` : null,
    "Réservé sur Nadcel.",
  ]
    .filter(Boolean)
    .join("\n");
  return {
    uid: `rdv-${appointment.id}@nadcel.sn`,
    title: `${appointment.service.name} chez ${salon.name}`,
    start,
    end: new Date(start.getTime() + minutes * 60_000),
    location,
    details,
  };
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
  const [showAllPast, setShowAllPast] = useState(false);

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

  // « Réserver à nouveau » : les dernières prestations terminées, une par
  // couple salon + service, pour reprendre rendez-vous en un clic.
  const rebook = useMemo(() => {
    const seen = new Set<string>();
    const items: ClientAppointment[] = [];
    for (const a of past) {
      const key = `${a.salon.id}-${a.service.id}`;
      if (a.status !== "completed" || seen.has(key) || !stillBookable(a)) continue;
      seen.add(key);
      items.push(a);
      if (items.length === 3) break;
    }
    return items;
  }, [past]);

  async function handleCancel(id: number) {
    setCancellingId(id);
    setActionError(null);
    try {
      const updated = await cancelAppointment(id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: updated.status, cancelled_late: updated.cancelled_late } : a)),
      );
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

  // Confirmation d'annulation (cartes de la liste et carte du prochain rendez-vous).
  const renderCancelConfirm = (appointment: ClientAppointment, late: boolean) => (
    <div className="mt-4 rounded-2xl bg-red-50 p-4">
      <p className="text-sm font-medium text-red-900">Annuler ce rendez-vous ? Le salon sera prévenu.</p>
      {late && (
        <p className="mt-1 text-sm text-red-900/80">
          Il commence dans moins de {LATE_CANCELLATION_HOURS} h : l&apos;annulation sera signalée au salon comme
          tardive. Le créneau sera aussitôt libéré pour une autre cliente.
        </p>
      )}
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
  );

  // Une carte de rendez-vous (à venir ou passé), avec ses actions.
  const renderAppointment = (appointment: ClientAppointment, now: number) => {
    const date = new Date(appointment.scheduled_at);
    const canCancel = clientCanCancel(appointment, now);
    // Seulement une fois confirmé : un rendez-vous en attente peut encore être refusé.
    const canAddToCalendar = appointment.status === "confirmed" && isUpcoming(appointment, now);
    const late = canCancel && isLateCancellation(appointment, now);
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
            <span className="text-2xl font-semibold leading-tight tabular-nums text-brand">{date.getDate()}</span>
            <span className="text-xs text-anthracite/70">{date.toLocaleDateString("fr-FR", { month: "short" })}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <Link
                  href={`/salons/${appointment.salon.id}`}
                  className="text-lg font-semibold text-brand transition-colors hover:text-brand-soft"
                >
                  {appointment.salon.name}
                </Link>
                <p className="mt-0.5 text-sm text-anthracite/80">
                  {appointment.service.name}, {formatDuration(appointment.duration ?? appointment.service.duration)}
                </p>
              </div>
              <AppointmentStatusBadge status={appointment.status} late={appointment.cancelled_late} />
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
            {appointment.review && (
              <p className="mt-2 text-sm text-anthracite/70">
                Votre avis : <span className="text-champagne">{"★".repeat(appointment.review.rating)}</span>
              </p>
            )}
            {reviewedIds.has(appointment.id) && (
              <p className="mt-2 text-sm font-medium text-brand">Merci, votre avis a été publié.</p>
            )}

            {(canCancel || canReview || canAddToCalendar || appointment.status === "completed" || appointment.status === "cancelled") &&
              !isReviewing &&
              !isConfirmingCancel && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {canAddToCalendar && (
                    <AddToCalendar event={calendarEventFor(appointment)} filename={`nadcel-rendez-vous-${appointment.id}.ics`} />
                  )}
                  {canReview && (
                    <button type="button" onClick={() => openReviewForm(appointment.id)} className={ui.buttonPrimary}>
                      Laisser un avis
                    </button>
                  )}
                  {(appointment.status === "completed" || appointment.status === "cancelled") && stillBookable(appointment) && (
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

            {isConfirmingCancel && renderCancelConfirm(appointment, late)}

            {isReviewing && (
              <div className="mt-4 rounded-2xl bg-beige p-4">
                <p className="text-sm font-semibold text-brand">Comment s&apos;est passé votre rendez-vous ?</p>
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
                  className="mt-3 w-full rounded-2xl bg-white px-4 py-3 text-sm text-anthracite outline-none shadow-[0_1px_2px_rgba(90,50,35,0.06)] focus:shadow-[0_0_0_2px_var(--color-brand)]"
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
  };

  return (
    <main className="flex flex-1 flex-col px-5 py-8 sm:px-10 sm:py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-brand sm:text-4xl">Mes rendez-vous</h1>
            <p className="mt-2 text-anthracite/75">Retrouvez vos réservations, annulez-les dans les délais ou laissez un avis.</p>
          </div>
          <Link href="/salons" className={ui.buttonPrimary}>
            Nouvelle réservation
          </Link>
        </div>

        {!loading && now !== null && upcoming[0] && (
          <div className="mt-8">
            <NextAppointmentCard
              appointment={upcoming[0]}
              now={now}
              calendarEvent={upcoming[0].status === "confirmed" ? calendarEventFor(upcoming[0]) : null}
              cancel={
                confirmCancelId === upcoming[0].id ? (
                  <div>
                    {renderCancelConfirm(upcoming[0], isLateCancellation(upcoming[0], now))}
                    {actionError?.id === upcoming[0].id && (
                      <p role="alert" className="mt-2 text-sm text-red-800">
                        {actionError.message}
                      </p>
                    )}
                  </div>
                ) : clientCanCancel(upcoming[0], now) ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmCancelId(upcoming[0].id);
                        setActionError(null);
                      }}
                      className={`${ui.buttonSecondary} text-red-800`}
                    >
                      Annuler le rendez-vous
                    </button>
                  </div>
                ) : null
              }
            />
          </div>
        )}

        {loading && (
          <div className="mt-8 flex flex-col gap-4" aria-busy="true" aria-label="Chargement de vos rendez-vous">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-36 animate-pulse rounded-2xl bg-sable/15" />
            ))}
          </div>
        )}

        {error && <p className="mt-8 text-sm text-red-700">{error}</p>}

        {!loading && !error && now !== null && (
          <>
            {upcoming.length === 0 && (
              <div className={`${ui.surface} mt-8 flex flex-col items-center gap-4 px-6 py-12 text-center`}>
                <p className="font-heading text-2xl font-semibold text-brand">Aucun rendez-vous à venir</p>
                <p className="max-w-md text-sm leading-6 text-anthracite/75">
                  Trouvez un salon près de chez vous et réservez votre prochain moment beauté en moins d&apos;une minute.
                </p>
                <Link href="/salons" className={ui.buttonPrimary}>
                  Trouver un salon
                </Link>
              </div>
            )}

            {rebook.length > 0 && (
              <section aria-labelledby="rebook-title" className="mt-12">
                <h2 id="rebook-title" className="text-xl font-semibold tracking-tight text-brand">
                  Réserver à nouveau
                </h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                  {rebook.map((a) => (
                    <li key={a.id} className={`${ui.surface} flex flex-col p-5`}>
                      <p className="font-semibold text-brand">{a.service.name}</p>
                      <p className="mt-0.5 text-sm text-anthracite/75">{a.salon.name}</p>
                      <p className="mt-2 text-sm tabular-nums text-anthracite/75">
                        {formatDuration(a.duration)}, dernière fois {formatCurrency(Number(a.price))}
                      </p>
                      <Link
                        href={`/salons/${a.salon.id}/appointments?service=${a.service.id}`}
                        className={`${ui.buttonSecondary} mt-4 self-start`}
                      >
                        Réserver
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {upcoming.length > 1 && (
              <section aria-labelledby="upcoming-title" className="mt-12">
                <h2 id="upcoming-title" className="text-xl font-semibold tracking-tight text-brand">
                  Ensuite
                </h2>
                <div className="mt-4 flex flex-col gap-4">{upcoming.slice(1).map((a) => renderAppointment(a, now))}</div>
              </section>
            )}

            {past.length > 0 && (
              <section aria-labelledby="history-title" className="mt-12">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 id="history-title" className="text-xl font-semibold tracking-tight text-brand">
                    Historique
                  </h2>
                  {past.length > 3 && (
                    <button type="button" onClick={() => setShowAllPast((v) => !v)} className={`${ui.textLink} text-sm`}>
                      {showAllPast ? "Voir moins" : `Voir tout (${past.length})`}
                    </button>
                  )}
                </div>
                <div className="mt-4 flex flex-col gap-4">
                  {(showAllPast ? past : past.slice(0, 3)).map((a) => renderAppointment(a, now))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

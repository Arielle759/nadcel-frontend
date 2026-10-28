"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";
import "react-day-picker/style.css";
import { useAppointments } from "@/hooks/useAppointments";
import { MonthAvailability, useAvailability } from "@/hooks/useAvailability";
import type { Service } from "@/hooks/useServices";
import { formatCurrency } from "@/lib/currency";
import { formatDuration } from "@/lib/duration";
import { isAuthenticated } from "@/lib/auth";
import { clearBookingDraft, readBookingDraft, saveBookingDraft } from "@/lib/bookingDraft";
import { ui } from "@/lib/ui";

interface AppointmentFormProps {
  salonId: number;
  salonName: string;
  salonCover?: string | null;
  services: Service[];
  initialServiceId?: number;
}

const STRIP_DAYS = 14;
const CANCELLATION_HOURS = 24;

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toMonthValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseDateInputValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function sameDay(a: Date | undefined, b: Date): boolean {
  return !!a && toDateInputValue(a) === toDateInputValue(b);
}

// "09:30" -> "9 h 30", "14:00" -> "14 h"
function formatSlot(slot: string): string {
  const [hours, minutes] = slot.split(":");
  return minutes === "00" ? `${Number(hours)} h` : `${Number(hours)} h ${minutes}`;
}

function formatLongDate(date: Date): string {
  const label = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function groupSlots(slots: string[]): { label: string; slots: string[] }[] {
  const groups = [
    { label: "Matin", slots: [] as string[] },
    { label: "Après-midi", slots: [] as string[] },
    { label: "Soir", slots: [] as string[] },
  ];
  for (const slot of slots) {
    const hour = Number(slot.split(":")[0]);
    groups[hour < 12 ? 0 : hour < 17 ? 1 : 2].slots.push(slot);
  }
  return groups.filter((group) => group.slots.length > 0);
}

export default function AppointmentForm({ salonId, salonName, services, initialServiceId }: AppointmentFormProps) {
  const { createAppointment, loading, error } = useAppointments();
  const { getMonthAvailability, getDayAvailability } = useAvailability();

  const [serviceId, setServiceId] = useState(() =>
    services.some((s) => s.id === initialServiceId) ? (initialServiceId as number) : (services[0]?.id ?? 0)
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [heure, setHeure] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [success, setSuccess] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [restoredNotice, setRestoredNotice] = useState(false);

  const [availability, setAvailability] = useState<MonthAvailability>({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Heure restaurée depuis un brouillon : appliquée une fois les créneaux du jour chargés.
  const pendingHeure = useRef<string | null>(null);
  const summaryRef = useRef<HTMLElement>(null);

  const today = useMemo(() => startOfToday(), []);
  const stripDays = useMemo(() => Array.from({ length: STRIP_DAYS }, (_, index) => addDays(today, index)), [today]);

  // Mois à interroger : ceux couverts par la bande de jours, plus le mois affiché dans le calendrier.
  const monthsToLoad = useMemo(() => {
    const months = new Set(stripDays.map(toMonthValue));
    if (showCalendar) months.add(toMonthValue(calendarMonth));
    return Array.from(months).sort();
  }, [stripDays, showCalendar, calendarMonth]);
  const monthsKey = monthsToLoad.join(",");

  // Reprise d'une réservation commencée avant la connexion ou l'inscription.
  useEffect(() => {
    queueMicrotask(() => {
      const draft = readBookingDraft();
      if (!draft || draft.salonId !== salonId) return;
      clearBookingDraft();
      if (services.some((s) => s.id === draft.serviceId)) setServiceId(draft.serviceId);
      const draftDate = parseDateInputValue(draft.date);
      if (draftDate >= startOfToday()) {
        pendingHeure.current = draft.heure;
        setSelectedDate(draftDate);
        if (!stripDays.some((day) => sameDay(draftDate, day))) {
          setShowCalendar(true);
          setCalendarMonth(draftDate);
        }
      }
      setRestoredNotice(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!serviceId) return;
    let cancelled = false;
    const months = monthsKey.split(",");

    queueMicrotask(async () => {
      setAvailabilityLoading(true);
      try {
        const results = await Promise.all(months.map((month) => getMonthAvailability(salonId, serviceId, month)));
        if (!cancelled) setAvailability(Object.assign({}, ...results));
      } catch {
        if (!cancelled) setAvailability({});
      } finally {
        if (!cancelled) setAvailabilityLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [salonId, serviceId, monthsKey, getMonthAvailability]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(async () => {
      if (!selectedDate || !serviceId) {
        setAvailableSlots(null);
        return;
      }
      setSlotsLoading(true);
      setSlotsError(null);
      setHeure("");
      try {
        const slots = await getDayAvailability(salonId, toDateInputValue(selectedDate), serviceId);
        if (cancelled) return;
        setAvailableSlots(slots);
        if (pendingHeure.current && slots.includes(pendingHeure.current)) setHeure(pendingHeure.current);
        pendingHeure.current = null;
      } catch (err) {
        if (!cancelled) {
          setAvailableSlots([]);
          setSlotsError(err instanceof Error ? err.message : "Impossible de charger les créneaux.");
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [salonId, serviceId, selectedDate, getDayAvailability]);

  const selectedService = services.find((s) => s.id === serviceId);
  const isDayUnavailable = (date: Date) => availability[toDateInputValue(date)] === false;
  const ready = Boolean(selectedService && selectedDate && heure);

  function chooseService(id: number) {
    if (id === serviceId) return;
    setServiceId(id);
    setSelectedDate(undefined);
    setHeure("");
    setAvailableSlots(null);
    setAuthRequired(false);
  }

  function chooseDate(date: Date | undefined) {
    setSelectedDate(date);
    setAuthRequired(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSuccess(false);
    setAuthRequired(false);
    if (!selectedDate || !heure) return;
    if (!isAuthenticated()) {
      saveBookingDraft({ salonId, serviceId, date: toDateInputValue(selectedDate), heure });
      setAuthRequired(true);
      summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    try {
      await createAppointment({
        salon_id: salonId,
        service_id: serviceId,
        scheduled_at: `${toDateInputValue(selectedDate)}T${heure}:00`,
      });
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // le message d'erreur est exposé par le hook
    }
  }

  if (success && selectedService && selectedDate) {
    return (
      <section aria-live="polite" className={`${ui.surface} mx-auto w-full max-w-xl rounded-3xl p-8 text-center sm:p-10`}>
        <p className="font-heading text-3xl font-semibold text-forest">Demande envoyée</p>
        <p className="mt-4 leading-7 text-anthracite/85">
          {selectedService.name} chez {salonName}, {formatLongDate(selectedDate).toLowerCase()} à {formatSlot(heure)}.
        </p>
        <p className="mt-2 text-sm leading-6 text-anthracite/75">
          Le salon va confirmer votre rendez-vous. Vous recevrez un e-mail, et vous pouvez suivre son état dans votre espace.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/client/appointments" className={ui.buttonPrimary}>
            Voir mes réservations
          </Link>
          <Link href={`/salons/${salonId}`} className={ui.buttonSecondary}>
            Retour au salon
          </Link>
        </div>
      </section>
    );
  }

  const summary = (
    <div className={`${ui.surface} rounded-3xl p-6`}>
      <p className="font-heading text-2xl font-semibold text-forest">Récapitulatif</p>
      <dl className="mt-5 flex flex-col gap-4 text-sm">
        <div>
          <dt className="text-anthracite/70">Salon</dt>
          <dd className="font-medium text-anthracite">{salonName}</dd>
        </div>
        <div>
          <dt className="text-anthracite/70">Prestation</dt>
          <dd className="font-medium text-anthracite">
            {selectedService ? `${selectedService.name}, ${formatDuration(selectedService.duration)}` : "À choisir"}
          </dd>
        </div>
        <div>
          <dt className="text-anthracite/70">Date et heure</dt>
          <dd className="font-medium text-anthracite">
            {selectedDate ? formatLongDate(selectedDate) : "À choisir"}
            {selectedDate && heure ? ` à ${formatSlot(heure)}` : ""}
          </dd>
        </div>
        <div className="flex items-baseline justify-between rounded-2xl bg-beige px-4 py-3">
          <dt className="text-anthracite/70">À régler au salon</dt>
          <dd className="text-lg font-semibold text-forest">
            {selectedService ? formatCurrency(Number(selectedService.price)) : "-"}
          </dd>
        </div>
      </dl>

      {authRequired ? (
        <div className="mt-6 rounded-2xl bg-sage/15 p-4">
          <p className="text-sm leading-6 text-anthracite">
            Connectez-vous pour confirmer. Votre sélection est gardée et vous reviendrez ici ensuite.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/login" className={ui.buttonPrimary}>
              Se connecter
            </Link>
            <Link href="/register" className={ui.buttonSecondary}>
              Créer un compte
            </Link>
          </div>
        </div>
      ) : (
        <button type="submit" form="booking-form" disabled={!ready || loading} className={`${ui.buttonPrimary} mt-6 h-12 w-full text-base`}>
          {loading ? "Envoi en cours..." : "Confirmer la réservation"}
        </button>
      )}
      {!authRequired && error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <p className="mt-4 text-xs leading-5 text-anthracite/70">
        Paiement au salon en espèces, par Wave ou Orange Money. Annulation gratuite depuis votre espace jusqu&apos;à{" "}
        {CANCELLATION_HOURS} h avant le rendez-vous.
      </p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-10 pb-28 lg:grid-cols-[minmax(0,1fr)_340px] lg:pb-0">
      <form id="booking-form" onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-12">
        {restoredNotice && (
          <p className="rounded-2xl bg-sage/15 px-4 py-3 text-sm text-forest">
            Votre sélection a été reprise. Vérifiez le créneau puis confirmez.
          </p>
        )}

        <fieldset className="min-w-0">
          <legend className="font-heading text-2xl font-semibold text-forest">1. Prestation</legend>
          <div className="mt-4 flex flex-col gap-3">
            {services.map((service) => {
              const checked = service.id === serviceId;
              return (
                <label
                  key={service.id}
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl bg-white p-4 transition-all duration-200 ${checked ? "shadow-[0_0_0_2px_var(--color-forest),0_10px_26px_rgba(45,59,40,0.12)]" : "shadow-[0_1px_2px_rgba(45,59,40,0.05),0_8px_24px_rgba(45,59,40,0.06)] hover:shadow-[0_2px_6px_rgba(45,59,40,0.06),0_14px_32px_rgba(45,59,40,0.11)]"}`}
                >
                  <input
                    type="radio"
                    name="service"
                    value={service.id}
                    checked={checked}
                    onChange={() => chooseService(service.id)}
                    className="h-4 w-4 shrink-0 accent-[var(--color-forest)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-forest">{service.name}</span>
                    <span className="block text-sm text-anthracite/75">{formatDuration(service.duration)}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-anthracite">{formatCurrency(Number(service.price))}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="font-heading text-2xl font-semibold text-forest">2. Jour</legend>
          <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2" role="group" aria-label="Prochains jours">
            {stripDays.map((day) => {
              const unavailable = isDayUnavailable(day);
              const selected = sameDay(selectedDate, day);
              return (
                <button
                  key={toDateInputValue(day)}
                  type="button"
                  disabled={unavailable}
                  aria-pressed={selected}
                  aria-label={`${formatLongDate(day)}${unavailable ? ", complet ou fermé" : ""}`}
                  onClick={() => chooseDate(day)}
                  className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border py-3 transition-colors ${
                    selected
                      ? "border-forest bg-forest text-beige"
                      : unavailable
                        ? "cursor-not-allowed border-transparent bg-sage/10 text-anthracite/40"
                        : "border-transparent bg-white text-anthracite shadow-[0_1px_2px_rgba(45,59,40,0.05),0_6px_16px_rgba(45,59,40,0.06)] hover:shadow-[0_2px_6px_rgba(45,59,40,0.07),0_10px_22px_rgba(45,59,40,0.12)]"
                  }`}
                >
                  <span className="text-xs">{day.toLocaleDateString("fr-FR", { weekday: "short" })}</span>
                  <span className="text-lg font-semibold">{day.getDate()}</span>
                  <span className="text-xs">{day.toLocaleDateString("fr-FR", { month: "short" })}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <button
              type="button"
              onClick={() => setShowCalendar((open) => !open)}
              aria-expanded={showCalendar}
              className={`${ui.buttonSecondary} min-h-10 px-5`}
            >
              {showCalendar ? "Masquer le calendrier" : "Choisir une date plus lointaine"}
            </button>
            {availabilityLoading && <span className="text-anthracite/70">Mise à jour des disponibilités...</span>}
          </div>
          {showCalendar && (
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={chooseDate}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              disabled={[{ before: today }, isDayUnavailable]}
              locale={fr}
              className={`appointment-calendar ${ui.surface} mt-4 w-fit p-4`}
            />
          )}
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="font-heading text-2xl font-semibold text-forest">3. Heure</legend>
          <div className="mt-4" aria-live="polite">
            {!selectedDate && <p className="text-sm text-anthracite/75">Choisissez d&apos;abord un jour.</p>}
            {selectedDate && slotsLoading && <p className="text-sm text-anthracite/75">Recherche des créneaux libres...</p>}
            {selectedDate && !slotsLoading && availableSlots?.length === 0 && !slotsError && (
              <p className="text-sm text-anthracite/75">Plus aucun créneau libre ce jour-là. Essayez un autre jour.</p>
            )}
            {slotsError && <p className="text-sm text-red-700">{slotsError}</p>}
            {selectedDate && !slotsLoading && availableSlots && availableSlots.length > 0 && (
              <div className="flex flex-col gap-5">
                {groupSlots(availableSlots).map((group) => (
                  <div key={group.label}>
                    <p className="text-sm font-semibold text-anthracite/75">{group.label}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {group.slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          aria-pressed={heure === slot}
                          onClick={() => {
                            setHeure(slot);
                            setAuthRequired(false);
                          }}
                          className={`min-h-11 min-w-20 rounded-full border px-4 text-sm font-medium transition-colors ${
                            heure === slot
                              ? "border-forest bg-forest text-beige"
                              : "border-transparent bg-white text-anthracite shadow-[0_1px_2px_rgba(45,59,40,0.05),0_6px_16px_rgba(45,59,40,0.06)] hover:shadow-[0_2px_6px_rgba(45,59,40,0.07),0_10px_22px_rgba(45,59,40,0.12)]"
                          }`}
                        >
                          {formatSlot(slot)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </fieldset>
      </form>

      <aside ref={summaryRef} aria-label="Récapitulatif de la réservation" className="lg:sticky lg:top-28 lg:self-start">
        {summary}
      </aside>

      {/* Mobile : confirmation toujours accessible en bas de l'écran. */}
      {!authRequired && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-beige/95 px-6 py-3 shadow-[0_-8px_24px_rgba(45,59,40,0.10)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <p className="min-w-0 text-sm text-anthracite/80">
              {ready && selectedDate ? (
                <>
                  <span className="block font-semibold text-forest">{formatSlot(heure)}</span>
                  {formatLongDate(selectedDate)}
                </>
              ) : (
                "Choisissez un jour et une heure"
              )}
            </p>
            <button type="submit" form="booking-form" disabled={!ready || loading} className={`${ui.buttonPrimary} shrink-0`}>
              {loading ? "Envoi..." : "Confirmer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

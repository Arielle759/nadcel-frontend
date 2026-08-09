"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";
import "react-day-picker/style.css";
import { useAppointments } from "@/hooks/useAppointments";
import { MonthAvailability, useAvailability } from "@/hooks/useAvailability";
import type { Service } from "@/hooks/useServices";
import { assetUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { formatDateTime } from "@/lib/date";
import { formatDuration } from "@/lib/duration";
import { isAuthenticated } from "@/lib/auth";

interface AppointmentFormProps {
  salonId: number;
  salonName: string;
  salonCover?: string | null;
  services: Service[];
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toMonthValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export default function AppointmentForm({ salonId, salonName, salonCover, services }: AppointmentFormProps) {
  const { createAppointment, loading, error } = useAppointments();
  const { getMonthAvailability, getDayAvailability } = useAvailability();

  const [serviceId, setServiceId] = useState(services[0]?.id ?? 0);
  const [displayMonth, setDisplayMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [heure, setHeure] = useState("");
  const [success, setSuccess] = useState(false);

  const [monthAvailability, setMonthAvailability] = useState<MonthAvailability>({});
  const [monthLoading, setMonthLoading] = useState(false);

  const [availableSlots, setAvailableSlots] = useState<string[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [authRequired, setAuthRequired] = useState(false);

  useEffect(() => {
    if (!serviceId) return;
    let cancelled = false;

    async function fetchMonthAvailability() {
      setMonthLoading(true);
      try {
        const data = await getMonthAvailability(salonId, serviceId, toMonthValue(displayMonth));
        if (!cancelled) setMonthAvailability(data);
      } catch {
        if (!cancelled) setMonthAvailability({});
      } finally {
        if (!cancelled) setMonthLoading(false);
      }
    }

    queueMicrotask(() => {
      fetchMonthAvailability();
    });

    return () => {
      cancelled = true;
    };
  }, [salonId, serviceId, displayMonth, getMonthAvailability]);

  useEffect(() => {
    let cancelled = false;

    async function fetchDayAvailability() {
      if (!selectedDate || !serviceId) {
        setAvailableSlots(null);
        return;
      }
      setSlotsLoading(true);
      setSlotsError(null);
      setHeure("");
      try {
        const slots = await getDayAvailability(salonId, toDateInputValue(selectedDate), serviceId);
        if (!cancelled) setAvailableSlots(slots);
      } catch (err) {
        if (!cancelled) {
          setAvailableSlots([]);
          setSlotsError(err instanceof Error ? err.message : "Impossible de charger les créneaux.");
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }

    queueMicrotask(() => {
      fetchDayAvailability();
    });

    return () => {
      cancelled = true;
    };
  }, [salonId, serviceId, selectedDate, getDayAvailability]);

  function handleServiceChange(id: number) {
    setServiceId(id);
    setSelectedDate(undefined);
    setHeure("");
    setAvailableSlots(null);
  }

  function isDayUnavailable(date: Date): boolean {
    return monthAvailability[toDateInputValue(date)] === false;
  }

  const selectedService = services.find((s) => s.id === serviceId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccess(false);
    setAuthRequired(false);
    if (!selectedDate || !heure) return;
    if (!isAuthenticated()) {
      setAuthRequired(true);
      return;
    }
    try {
      const scheduledAt = `${toDateInputValue(selectedDate)}T${heure}:00`;
      await createAppointment({
        salon_id: salonId,
        service_id: serviceId,
        scheduled_at: scheduledAt,
      });
      setSuccess(true);
    } catch {
      // error state is exposed via the hook
    }
  }

  return (
    <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
      {/* Colonne gauche — formulaire (logique inchangée) */}
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-4 rounded-lg border border-sage/30 bg-beige p-6 lg:max-w-md"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="service" className="text-sm font-medium">
            Service
          </label>
          <select
            id="service"
            required
            value={serviceId}
            onChange={(e) => handleServiceChange(Number(e.target.value))}
            className="rounded-md border border-sage/40 px-3 py-2"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({formatCurrency(s.price)})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Date</span>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            disabled={[{ before: startOfToday() }, isDayUnavailable]}
            locale={fr}
            className="appointment-calendar self-start rounded-md border border-sage/40 bg-beige p-3"
          />
          {monthLoading && (
            <p className="text-xs text-anthracite/75">Chargement des disponibilités...</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Heure</span>

          {!selectedDate && (
            <p className="text-sm text-anthracite/75">Choisissez d&apos;abord une date.</p>
          )}

          {selectedDate && slotsLoading && (
            <p className="text-sm text-anthracite/75">Chargement des créneaux...</p>
          )}

          {selectedDate && !slotsLoading && availableSlots && availableSlots.length === 0 && (
            <p className="text-sm text-anthracite/75">
              Aucun créneau disponible ce jour, choisissez une autre date.
            </p>
          )}

          {selectedDate && !slotsLoading && availableSlots && availableSlots.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setHeure(slot)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    heure === slot
                      ? "border-dark-sage bg-dark-sage text-beige"
                      : "border-sage/40 text-anthracite hover:bg-sage/10"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}

          {slotsError && <p className="text-xs text-red-600">{slotsError}</p>}
        </div>

        {authRequired && (
          <p className="text-sm text-red-600">
            Connectez-vous ou créez un compte pour finaliser votre réservation.{" "}
            <Link href="/login" className="text-terracotta underline hover:brightness-90">
              Se connecter
            </Link>{" "}
            ou{" "}
            <Link href="/register" className="text-terracotta underline hover:brightness-90">
              Créer un compte
            </Link>
          </p>
        )}
        {!authRequired && error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">Réservation confirmée !</p>}

        {selectedService && selectedDate && heure && (
          <div className="flex flex-col gap-1 rounded-md border border-dark-sage/30 bg-sage/10 p-4">
            <h3 className="text-sm font-semibold text-forest">Résumé de votre réservation</h3>
            <p className="text-sm text-anthracite">Salon : {salonName}</p>
            <p className="text-sm text-anthracite">Service : {selectedService.name}</p>
            <p className="text-sm text-anthracite">Durée : {formatDuration(selectedService.duration)}</p>
            <p className="text-sm text-anthracite">Prix : {formatCurrency(selectedService.price)}</p>
            <p className="text-sm text-anthracite">
              Date et heure : {formatDateTime(`${toDateInputValue(selectedDate)}T${heure}:00`)}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedDate || !heure}
          className="mt-2 rounded-full bg-dark-sage px-5 py-2 font-medium text-beige transition-colors hover:bg-sage disabled:opacity-50"
        >
          {loading ? "Envoi en cours..." : "Confirmer réservation"}
        </button>
      </form>

      {/* Colonne droite — fiche service sticky */}
      <aside className="w-full lg:sticky lg:top-8 lg:max-w-sm lg:flex-none">
        <div className="overflow-hidden rounded-lg border border-sage/30 bg-beige shadow-md">
          {/* Photo de couverture du salon */}
          {assetUrl(salonCover) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={assetUrl(salonCover)}
              alt={salonName}
              className="aspect-video w-full object-cover"
            />
          )}

          <div className="flex flex-col gap-4 p-5">
            {/* Détails du service sélectionné */}
            {selectedService ? (
              <div className="flex flex-col gap-2">
                <h3 className="font-fraunces text-lg font-semibold text-forest">
                  {selectedService.name}
                </h3>
                {selectedService.description && (
                  <p className="text-sm leading-relaxed text-anthracite/75">
                    {selectedService.description}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-base font-semibold text-champagne">
                    {formatCurrency(selectedService.price)}
                  </span>
                  <span className="text-sm text-anthracite/60">
                    {formatDuration(selectedService.duration)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-anthracite/50">
                Sélectionnez un service pour voir les détails.
              </p>
            )}

            {/* Date et heure sélectionnées */}
            <div className="rounded-md border border-dark-sage/20 bg-sage/10 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-forest/60">
                Date &amp; heure
              </p>
              {selectedDate && heure ? (
                <p className="text-sm font-medium text-anthracite">
                  {formatDateTime(`${toDateInputValue(selectedDate)}T${heure}:00`)}
                </p>
              ) : (
                <p className="text-sm text-anthracite/50">Choisissez une date et une heure</p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

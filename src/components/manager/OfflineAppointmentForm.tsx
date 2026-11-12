"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useManagerSalons } from "@/hooks/useManagerSalons";
import { Service, useServices } from "@/hooks/useServices";
import { useAvailability } from "@/hooks/useAvailability";
import {
  ManagerAppointment,
  OfflineBookingSource,
  useManagerAppointments,
} from "@/hooks/useManagerAppointments";
import { BOOKING_SOURCE_LABELS } from "@/lib/bookingSources";
import { formatCurrency } from "@/lib/currency";
import { formatDuration } from "@/lib/duration";
import { hasOptions, serviceDurationLabel, servicePriceLabel } from "@/lib/serviceOptions";
import { ui } from "@/lib/ui";

const SOURCES: OfflineBookingSource[] = ["whatsapp", "instagram", "facebook", "tiktok", "phone", "walk_in"];

function todayValue(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function slotLabel(slot: string): string {
  const [h, m] = slot.split(":");
  return m === "00" ? `${Number(h)} h` : `${Number(h)} h ${m}`;
}

// Saisie d'un rendez-vous pris hors de Nadcel (WhatsApp, réseaux sociaux, téléphone, sur place).
// Les créneaux proposés sont les mêmes que pour une réservation en ligne.
export default function OfflineAppointmentForm({
  onCreated,
  onCancel,
}: {
  onCreated: (appointment: ManagerAppointment) => void;
  onCancel: () => void;
}) {
  const { salons, loading: salonsLoading } = useManagerSalons();
  const { getServices } = useServices();
  const { getDayAvailability } = useAvailability();
  const { createOfflineAppointment } = useManagerAppointments();

  const bookableSalons = useMemo(() => salons.filter((s) => s.is_verified && s.is_active && !s.deactivated_at), [salons]);
  const [salonChoice, setSalonChoice] = useState<number | null>(null);
  const salonId = salonChoice ?? bookableSalons[0]?.id ?? null;

  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [optionId, setOptionId] = useState<number | null>(null);
  const [date, setDate] = useState(todayValue);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [time, setTime] = useState("");

  const [source, setSource] = useState<OfflineBookingSource>("whatsapp");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!salonId) return;
    let active = true;
    queueMicrotask(async () => {
      try {
        const data = await getServices(salonId);
        if (!active) return;
        setServices(data);
        setServiceId((current) => (current && data.some((s) => s.id === current) ? current : (data[0]?.id ?? null)));
      } catch {
        if (active) setServices([]);
      }
    });
    return () => {
      active = false;
    };
  }, [salonId, getServices]);

  useEffect(() => {
    const current = services.find((s) => s.id === serviceId);
    if (!salonId || !serviceId || !date || (current && hasOptions(current) && !optionId)) {
      queueMicrotask(() => setSlots([]));
      return;
    }
    let active = true;
    queueMicrotask(async () => {
      setSlotsLoading(true);
      setTime("");
      try {
        const data = await getDayAvailability(salonId, date, serviceId, optionId);
        if (active) setSlots(data);
      } catch {
        if (active) setSlots([]);
      } finally {
        if (active) setSlotsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [salonId, serviceId, optionId, date, getDayAvailability, services]);

  const service = services.find((s) => s.id === serviceId);
  const needsOption = Boolean(service && hasOptions(service));
  const ready = Boolean(salonId && serviceId && (!needsOption || optionId) && time && clientName.trim() && clientPhone.trim());

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!salonId || !serviceId || !time) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await createOfflineAppointment({
        salon_id: salonId,
        service_id: serviceId,
        service_option_id: needsOption ? optionId : null,
        scheduled_at: `${date}T${time}:00`,
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
        source,
        notes: notes.trim() || undefined,
      });
      onCreated(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer le rendez-vous.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!salonsLoading && bookableSalons.length === 0) {
    return (
      <div className={`${ui.surface} p-6`}>
        <p className="text-sm text-anthracite/80">Votre salon doit être validé avant de pouvoir enregistrer des rendez-vous.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`${ui.surface} flex flex-col gap-6 p-6 sm:p-8`} aria-labelledby="offline-title">
      <div>
        <h2 id="offline-title" className="font-heading text-2xl font-semibold text-brand">
          Nouveau rendez-vous
        </h2>
        <p className="mt-1 text-sm text-anthracite/75">
          Pour une réservation reçue par WhatsApp, sur un réseau social, par téléphone ou au salon. Le créneau est bloqué pour les réservations en ligne.
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className={`${ui.label} mb-2`}>Reçu par</legend>
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((s) => (
            <label
              key={s}
              className={`flex min-h-11 cursor-pointer items-center rounded-full px-5 text-sm font-semibold transition-colors ${
                source === s ? "bg-brand text-beige" : "bg-beige text-anthracite hover:bg-sable/20"
              }`}
            >
              <input type="radio" name="source" value={s} checked={source === s} onChange={() => setSource(s)} className="sr-only" />
              {BOOKING_SOURCE_LABELS[s]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="client-name" className={ui.label}>
            Nom de la cliente
          </label>
          <input id="client-name" required value={clientName} onChange={(e) => setClientName(e.target.value)} className={ui.input} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="client-phone" className={ui.label}>
            Téléphone
          </label>
          <input
            id="client-phone"
            type="tel"
            required
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="77 123 45 67"
            className={ui.input}
          />
        </div>
      </div>

      <div className={`grid gap-5 ${bookableSalons.length > 1 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {bookableSalons.length > 1 && (
          <div className="flex flex-col gap-2">
            <label htmlFor="salon" className={ui.label}>
              Salon
            </label>
            <select id="salon" value={salonId ?? ""} onChange={(e) => setSalonChoice(Number(e.target.value))} className={ui.input}>
              {bookableSalons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label htmlFor="service" className={ui.label}>
            Service
          </label>
          <select
            id="service"
            required
            value={serviceId ?? ""}
            onChange={(e) => {
              setServiceId(Number(e.target.value));
              setOptionId(null);
            }}
            className={ui.input}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({serviceDurationLabel(s)}, {servicePriceLabel(s)})
              </option>
            ))}
          </select>
        </div>
        {service && needsOption && (
          <div className="flex flex-col gap-2">
            <label htmlFor="service-option" className={ui.label}>
              {service.option_label || "Longueur"}
            </label>
            <select
              id="service-option"
              required
              value={optionId ?? ""}
              onChange={(e) => setOptionId(Number(e.target.value) || null)}
              className={ui.input}
            >
              <option value="" disabled>
                Choisir
              </option>
              {service.options!.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label} ({formatDuration(o.duration)}, {formatCurrency(Number(o.price))})
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label htmlFor="date" className={ui.label}>
            Jour
          </label>
          <input id="date" type="date" required min={todayValue()} value={date} onChange={(e) => setDate(e.target.value)} className={ui.input} />
        </div>
      </div>

      <div className="flex flex-col gap-2" aria-live="polite">
        <span className={ui.label}>Heure</span>
        {slotsLoading && <p className="text-sm text-anthracite/70">Recherche des créneaux libres...</p>}
        {!slotsLoading && slots?.length === 0 && (
          <p className="text-sm text-anthracite/70">Aucun créneau libre ce jour-là pour ce service.</p>
        )}
        {!slotsLoading && slots && slots.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                aria-pressed={time === slot}
                onClick={() => setTime(slot)}
                className={`min-h-10 min-w-16 rounded-full px-4 text-sm font-medium transition-colors ${
                  time === slot ? "bg-brand text-beige" : "bg-beige text-anthracite hover:bg-sable/20"
                }`}
              >
                {slotLabel(slot)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="notes" className={ui.label}>
          Note (facultatif)
        </label>
        <input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Mèches fournies par la cliente..." className={ui.input} />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={!ready || submitting} className={ui.buttonPrimary}>
          {submitting ? "Enregistrement..." : service && time ? `Enregistrer à ${slotLabel(time)}` : "Enregistrer le rendez-vous"}
        </button>
        <button type="button" onClick={onCancel} className={ui.buttonSecondary}>
          Annuler
        </button>
      </div>
    </form>
  );
}

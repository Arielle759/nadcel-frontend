"use client";

import { FormEvent, useState } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import type { Service } from "@/hooks/useServices";

interface AppointmentFormProps {
  salonId: number;
  services: Service[];
}

export default function AppointmentForm({ salonId, services }: AppointmentFormProps) {
  const { createAppointment, loading, error } = useAppointments();
  const [service, setService] = useState(services[0]?.name ?? "");
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccess(false);
    try {
      await createAppointment({ salon_id: salonId, service, date, heure });
      setSuccess(true);
    } catch {
      // error state is exposed via the hook
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-sage/30 bg-beige p-6"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="service" className="text-sm font-medium">
          Service
        </label>
        <select
          id="service"
          required
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="rounded-md border border-sage/40 px-3 py-2"
        >
          {services.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-sm font-medium">
          Date
        </label>
        <input
          id="date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-sage/40 px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="heure" className="text-sm font-medium">
          Heure
        </label>
        <input
          id="heure"
          type="time"
          required
          value={heure}
          onChange={(e) => setHeure(e.target.value)}
          className="rounded-md border border-sage/40 px-3 py-2"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Réservation confirmée !</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-full bg-dark-sage px-5 py-2 font-medium text-beige transition-colors hover:bg-sage disabled:opacity-50"
      >
        {loading ? "Envoi en cours..." : "Confirmer réservation"}
      </button>
    </form>
  );
}

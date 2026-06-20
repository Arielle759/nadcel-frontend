"use client";

import { useEffect, useState } from "react";
import { ClientAppointment, useClientAppointments } from "@/hooks/useClientAppointments";
import AppointmentStatusBadge from "@/components/AppointmentStatusBadge";

const CANCELLABLE_STATUSES = new Set(["pending", "confirmed"]);

function isMoreThan24hAway(date: string, heure: string): boolean {
  const appointmentTime = new Date(`${date}T${heure}`).getTime();
  return appointmentTime - Date.now() > 24 * 60 * 60 * 1000;
}

export default function ClientAppointmentsPage() {
  const { getMyAppointments, cancelAppointment } = useClientAppointments();
  const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

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
      await cancelAppointment(id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, statut: "cancelled" } : a))
      );
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-12 sm:px-16">
      <h1 className="text-3xl font-semibold tracking-tight">Mes réservations</h1>

      {loading && <p className="text-anthracite/70">Chargement...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && appointments.length === 0 && (
        <p className="text-anthracite/70">Vous n&apos;avez aucune réservation.</p>
      )}

      <div className="flex flex-col gap-4">
        {appointments.map((appointment) => {
          const canCancel =
            CANCELLABLE_STATUSES.has(appointment.statut) &&
            isMoreThan24hAway(appointment.date, appointment.heure);

          return (
            <div
              key={appointment.id}
              className="flex flex-col gap-3 rounded-lg border border-sage/30 bg-beige p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-anthracite">{appointment.salon}</p>
                <p className="text-sm text-anthracite/70">
                  {appointment.service} — {appointment.date} à {appointment.heure}
                </p>
                <AppointmentStatusBadge status={appointment.statut} />
              </div>

              {canCancel && (
                <button
                  type="button"
                  disabled={cancellingId === appointment.id}
                  onClick={() => handleCancel(appointment.id)}
                  className="self-start rounded-full border border-red-600 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
                >
                  {cancellingId === appointment.id ? "Annulation..." : "Annuler"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

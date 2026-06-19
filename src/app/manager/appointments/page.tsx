"use client";

import { useEffect, useState } from "react";
import {
  AppointmentStatus,
  ManagerAppointment,
  useManagerAppointments,
} from "@/hooks/useManagerAppointments";
import AppointmentStatusBadge from "@/components/AppointmentStatusBadge";

export default function ManagerAppointmentsPage() {
  const { getAppointments, updateAppointmentStatus, cancelAppointment } =
    useManagerAppointments();
  const [appointments, setAppointments] = useState<ManagerAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    getAppointments()
      .then((data) => {
        if (isMounted) setAppointments(data);
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
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleCancel(id: number) {
    setUpdatingId(id);
    try {
      await cancelAppointment(id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, statut: "cancelled" } : a))
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-12 sm:px-16">
      <h1 className="text-3xl font-semibold tracking-tight">Rendez-vous</h1>

      {loading && <p className="text-zinc-600 dark:text-zinc-400">Chargement...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && appointments.length === 0 && (
        <p className="text-zinc-600 dark:text-zinc-400">Aucun rendez-vous pour le moment.</p>
      )}

      <div className="flex flex-col gap-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex flex-col gap-3 rounded-lg border border-black/[.08] p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[.145]"
          >
            <div className="flex flex-col gap-1">
              <p className="font-semibold">{appointment.client}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {appointment.service} — {appointment.date} à {appointment.heure}
              </p>
              <AppointmentStatusBadge status={appointment.statut} />
            </div>

            <div className="flex gap-2">
              {appointment.statut === "pending" && (
                <>
                  <button
                    type="button"
                    disabled={updatingId === appointment.id}
                    onClick={() => handleStatusChange(appointment.id, "confirmed")}
                    className="rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
                  >
                    Confirmer
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === appointment.id}
                    onClick={() => handleCancel(appointment.id)}
                    className="rounded-full border border-red-600 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
                  >
                    Annuler
                  </button>
                </>
              )}

              {appointment.statut === "confirmed" && (
                <>
                  <button
                    type="button"
                    disabled={updatingId === appointment.id}
                    onClick={() => handleStatusChange(appointment.id, "completed")}
                    className="rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
                  >
                    Marquer terminé
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === appointment.id}
                    onClick={() => handleCancel(appointment.id)}
                    className="rounded-full border border-red-600 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
                  >
                    Annuler
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

import { useCallback, useState } from "react";
import { api } from "@/lib/api";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface ManagerAppointment {
  id: number;
  client: string;
  service: string;
  date: string;
  heure: string;
  statut: AppointmentStatus;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
}

interface UseManagerAppointmentsResult {
  getAppointments: () => Promise<ManagerAppointment[]>;
  updateAppointmentStatus: (
    id: number | string,
    status: AppointmentStatus
  ) => Promise<ManagerAppointment>;
  cancelAppointment: (id: number | string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useManagerAppointments(): UseManagerAppointmentsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAppointments = useCallback(async (): Promise<ManagerAppointment[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<PaginatedResponse<ManagerAppointment>>("/appointments");
      return data.data;
    } catch {
      setError("Impossible de charger les rendez-vous.");
      throw new Error("Impossible de charger les rendez-vous.");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAppointmentStatus = useCallback(
    async (id: number | string, status: AppointmentStatus): Promise<ManagerAppointment> => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.put<ManagerAppointment>(`/appointments/${id}`, {
          statut: status,
        });
        return data;
      } catch {
        setError("Impossible de mettre à jour le statut.");
        throw new Error("Impossible de mettre à jour le statut.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const cancelAppointment = useCallback(async (id: number | string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/appointments/${id}`);
    } catch {
      setError("Impossible d'annuler le rendez-vous.");
      throw new Error("Impossible d'annuler le rendez-vous.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { getAppointments, updateAppointmentStatus, cancelAppointment, loading, error };
}

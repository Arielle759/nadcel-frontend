import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import type { AppointmentStatus } from "@/hooks/useManagerAppointments";

export interface ClientAppointment {
  id: number;
  salon: string;
  service: string;
  date: string;
  heure: string;
  statut: AppointmentStatus;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
}

interface UseClientAppointmentsResult {
  getMyAppointments: () => Promise<ClientAppointment[]>;
  cancelAppointment: (id: number | string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useClientAppointments(): UseClientAppointmentsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMyAppointments = useCallback(async (): Promise<ClientAppointment[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<PaginatedResponse<ClientAppointment>>("/appointments");
      return data.data;
    } catch {
      setError("Impossible de charger vos réservations.");
      throw new Error("Impossible de charger vos réservations.");
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelAppointment = useCallback(async (id: number | string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/appointments/${id}`);
    } catch {
      setError("Impossible d'annuler la réservation.");
      throw new Error("Impossible d'annuler la réservation.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { getMyAppointments, cancelAppointment, loading, error };
}

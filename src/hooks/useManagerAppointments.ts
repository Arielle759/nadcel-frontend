import { useCallback, useState } from "react";
import { api, toErrorMessage } from "@/lib/api";
import type { Service } from "@/hooks/useServices";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid";
export type PaymentMethod = "cash" | "card";

export interface ManagerAppointmentClient {
  id: number;
  name: string;
  email: string;
}

export interface ManagerAppointment {
  id: number;
  client: ManagerAppointmentClient;
  service: Service;
  scheduled_at: string;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
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
  markAppointmentPaid: (
    id: number | string,
    method: PaymentMethod
  ) => Promise<ManagerAppointment>;
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
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de charger les rendez-vous.");
      setError(message);
      throw new Error(message);
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
          status,
        });
        return data;
      } catch (err) {
        const message = toErrorMessage(err, "Impossible de mettre à jour le statut.");
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const markAppointmentPaid = useCallback(
    async (id: number | string, method: PaymentMethod): Promise<ManagerAppointment> => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.patch<ManagerAppointment>(`/appointments/${id}/pay`, {
          payment_method: method,
        });
        return data;
      } catch (err) {
        const message = toErrorMessage(err, "Impossible de mettre à jour le paiement.");
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    getAppointments,
    updateAppointmentStatus,
    markAppointmentPaid,
    loading,
    error,
  };
}

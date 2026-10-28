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
// Moyens de paiement sur place. "cash" et "card" ne sont conservés que pour l'affichage
// d'éventuelles anciennes données.
export type PaymentMethod = "especes" | "wave" | "orange_money" | "cash" | "card";
export type OnSitePaymentMethod = "especes" | "wave" | "orange_money";

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
  price: string | number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  amount_paid: string | number | null;
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
  completeAppointment: (
    id: number | string,
    amountPaid: number,
    method: OnSitePaymentMethod
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

  // Clôture : le client est venu, le gérant note le montant encaissé sur place et le moyen utilisé.
  const completeAppointment = useCallback(
    async (
      id: number | string,
      amountPaid: number,
      method: OnSitePaymentMethod
    ): Promise<ManagerAppointment> => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.patch<ManagerAppointment>(`/appointments/${id}/complete`, {
          amount_paid: amountPaid,
          payment_method: method,
        });
        return data;
      } catch (err) {
        const message = toErrorMessage(err, "Impossible de clôturer le rendez-vous.");
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
    completeAppointment,
    loading,
    error,
  };
}

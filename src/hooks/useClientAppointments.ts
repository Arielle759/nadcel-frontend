import { useCallback, useState } from "react";
import { api, toErrorMessage } from "@/lib/api";
import type { AppointmentStatus, PaymentStatus } from "@/hooks/useManagerAppointments";

export interface ClientAppointmentSalon {
  id: number;
  name: string;
}

export interface ClientAppointmentService {
  id: number;
  name: string;
  duration: number;
}

export interface ClientAppointmentEmployee {
  id: number;
  name: string;
}

export interface ClientAppointmentReview {
  id: number;
  rating: number;
  comment: string;
}

export interface ClientAppointment {
  id: number;
  scheduled_at: string;
  duration: number;
  status: AppointmentStatus;
  price: string;
  payment_status: PaymentStatus;
  salon: ClientAppointmentSalon;
  service: ClientAppointmentService;
  employee: ClientAppointmentEmployee;
  review: ClientAppointmentReview | null;
}

export interface CreateReviewData {
  rating: number;
  comment: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
}

interface UseClientAppointmentsResult {
  getMyAppointments: () => Promise<ClientAppointment[]>;
  cancelAppointment: (id: number | string) => Promise<ClientAppointment>;
  submitReview: (id: number | string, data: CreateReviewData) => Promise<void>;
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
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de charger vos réservations.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelAppointment = useCallback(
    async (id: number | string): Promise<ClientAppointment> => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.put<ClientAppointment>(`/appointments/${id}`, {
          status: "cancelled",
        });
        return data;
      } catch (err) {
        const message = toErrorMessage(err, "Impossible d'annuler la réservation.");
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const submitReview = useCallback(
    async (id: number | string, data: CreateReviewData): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await api.post("/reviews", { appointment_id: id, ...data });
      } catch (err) {
        const message = toErrorMessage(err, "Impossible d'envoyer l'avis.");
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { getMyAppointments, cancelAppointment, submitReview, loading, error };
}

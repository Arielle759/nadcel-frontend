import { useState } from "react";
import { api, toErrorMessage } from "@/lib/api";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface AppointmentSalon {
  id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  logo: string | null;
  cover: string | null;
  rating: string | null;
  is_active: boolean;
  is_verified: boolean;
}

export interface AppointmentService {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: number;
  category: string;
  image: string | null;
  is_active: boolean;
}

export interface AppointmentEmployee {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface Appointment {
  id: number;
  client_id: number;
  salon_id: number;
  service_id: number;
  employee_id: number | null;
  scheduled_at: string;
  duration: number;
  status: AppointmentStatus;
  price: string;
  notes: string | null;
  payment_status: "unpaid" | "paid";
  created_at: string;
  updated_at: string;
  salon: AppointmentSalon;
  service: AppointmentService;
  employee: AppointmentEmployee | null;
  review: unknown | null;
}

export interface CreateAppointmentData {
  salon_id: number;
  service_id: number;
  scheduled_at: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
}

interface UseAppointmentsResult {
  createAppointment: (data: CreateAppointmentData) => Promise<Appointment>;
  getAppointments: () => Promise<Appointment[]>;
  loading: boolean;
  error: string | null;
}

export function useAppointments(): UseAppointmentsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    setLoading(true);
    setError(null);
    try {
      const { data: appointment } = await api.post<Appointment>("/appointments", data);
      return appointment;
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de créer la réservation.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  async function getAppointments(): Promise<Appointment[]> {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<PaginatedResponse<Appointment>>("/appointments");
      return data.data;
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de charger les réservations.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  return { createAppointment, getAppointments, loading, error };
}

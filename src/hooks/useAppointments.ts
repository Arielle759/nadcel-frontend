import { useState } from "react";
import { api } from "@/lib/api";

export interface Appointment {
  id: number;
  salon_id: number;
  service: string;
  date: string;
  heure: string;
}

export interface CreateAppointmentData {
  salon_id: number;
  service: string;
  date: string;
  heure: string;
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
    } catch {
      setError("Impossible de créer la réservation.");
      throw new Error("Impossible de créer la réservation.");
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
    } catch {
      setError("Impossible de charger les réservations.");
      throw new Error("Impossible de charger les réservations.");
    } finally {
      setLoading(false);
    }
  }

  return { createAppointment, getAppointments, loading, error };
}

import { useCallback, useState } from "react";
import { api, toErrorMessage } from "@/lib/api";

export interface AdminStatsSalons {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
}

export interface AdminStatsAppointments {
  confirmed: number;
  completed: number;
  pending: number;
  cancelled: number;
}

export interface AdminStatsUsersByRole {
  role: string;
  count: number;
}

export interface AdminStatsUsers {
  by_role: AdminStatsUsersByRole[];
  without_role: number;
}

export interface AdminStatsRevenue {
  generated: number;
  collected: number;
  outstanding: number;
}

export interface AdminStats {
  salons: AdminStatsSalons;
  appointments: AdminStatsAppointments;
  revenue: AdminStatsRevenue;
  users: AdminStatsUsers;
}

export interface AdminSalonManager {
  id: number;
  name: string;
  email: string;
}

export interface AdminSalon {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  is_verified: boolean;
  is_active: boolean;
  manager?: AdminSalonManager;
}

export interface AdminReviewClient {
  id: number;
  name: string;
}

export interface AdminReviewSalon {
  id: number;
  name: string;
}

export interface AdminReview {
  id: number;
  client_id: number;
  appointment_id: number;
  salon_id: number;
  rating: number;
  comment: string;
  manager_response: string | null;
  manager_responded_at: string | null;
  created_at: string;
  client: AdminReviewClient;
  salon: AdminReviewSalon;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
}

interface UseAdminResult {
  getStats: () => Promise<AdminStats>;
  getPendingSalons: () => Promise<AdminSalon[]>;
  getAllSalons: () => Promise<AdminSalon[]>;
  validateSalon: (id: number | string) => Promise<AdminSalon>;
  rejectSalon: (id: number | string) => Promise<AdminSalon>;
  suspendSalon: (id: number | string) => Promise<AdminSalon>;
  reactivateSalon: (id: number | string) => Promise<AdminSalon>;
  deleteSalon: (id: number | string) => Promise<void>;
  getReviews: () => Promise<AdminReview[]>;
  deleteReview: (id: number | string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useAdmin(): UseAdminResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStats = useCallback(async (): Promise<AdminStats> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<AdminStats>("/admin/stats");
      return data;
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de charger les statistiques.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getPendingSalons = useCallback(async (): Promise<AdminSalon[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<PaginatedResponse<AdminSalon>>("/admin/salons/pending");
      return data.data;
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de charger les salons en attente.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllSalons = useCallback(async (): Promise<AdminSalon[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<PaginatedResponse<AdminSalon>>("/admin/salons");
      return data.data;
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de charger les salons.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const validateSalon = useCallback(async (id: number | string): Promise<AdminSalon> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.patch<AdminSalon>(`/admin/salons/${id}/verify`);
      return data;
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de valider le salon.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectSalon = useCallback(async (id: number | string): Promise<AdminSalon> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.patch<AdminSalon>(`/admin/salons/${id}/reject`);
      return data;
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de rejeter le salon.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const suspendSalon = useCallback(async (id: number | string): Promise<AdminSalon> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.patch<AdminSalon>(`/admin/salons/${id}/suspend`);
      return data;
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de suspendre le salon.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reactivateSalon = useCallback(async (id: number | string): Promise<AdminSalon> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.patch<AdminSalon>(`/admin/salons/${id}/reactivate`);
      return data;
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de réactiver le salon.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSalon = useCallback(async (id: number | string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/admin/salons/${id}`);
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de supprimer le salon.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getReviews = useCallback(async (): Promise<AdminReview[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<PaginatedResponse<AdminReview>>("/reviews");
      return data.data;
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de charger les avis.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReview = useCallback(async (id: number | string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/admin/reviews/${id}`);
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de supprimer l'avis.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getStats,
    getPendingSalons,
    getAllSalons,
    validateSalon,
    rejectSalon,
    suspendSalon,
    reactivateSalon,
    deleteSalon,
    getReviews,
    deleteReview,
    loading,
    error,
  };
}

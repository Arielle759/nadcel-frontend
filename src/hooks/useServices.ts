import { useCallback, useState } from "react";
import { api } from "@/lib/api";

export interface Service {
  id: number;
  salon_id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceData {
  salon_id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

export interface UpdateServiceData {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
}

interface UseServicesResult {
  getServices: (salonId: number | string) => Promise<Service[]>;
  createService: (data: CreateServiceData) => Promise<Service>;
  updateService: (id: number | string, data: UpdateServiceData) => Promise<Service>;
  deleteService: (id: number | string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useServices(): UseServicesResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getServices = useCallback(async (salonId: number | string): Promise<Service[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<PaginatedResponse<Service>>("/services", {
        params: { salon_id: salonId },
      });
      return data.data;
    } catch {
      setError("Impossible de charger les services.");
      throw new Error("Impossible de charger les services.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createService = useCallback(async (data: CreateServiceData): Promise<Service> => {
    setLoading(true);
    setError(null);
    try {
      const { data: service } = await api.post<Service>("/services", data);
      return service;
    } catch {
      setError("Impossible de créer le service.");
      throw new Error("Impossible de créer le service.");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateService = useCallback(
    async (id: number | string, data: UpdateServiceData): Promise<Service> => {
      setLoading(true);
      setError(null);
      try {
        const { data: service } = await api.put<Service>(`/services/${id}`, data);
        return service;
      } catch {
        setError("Impossible de mettre à jour le service.");
        throw new Error("Impossible de mettre à jour le service.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteService = useCallback(async (id: number | string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/services/${id}`);
    } catch {
      setError("Impossible de supprimer le service.");
      throw new Error("Impossible de supprimer le service.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { getServices, createService, updateService, deleteService, loading, error };
}

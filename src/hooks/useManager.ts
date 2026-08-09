import { useCallback, useState } from "react";
import { api, toErrorMessage } from "@/lib/api";
import type { SalonDetail } from "@/lib/salons";
import type { AdminStatsAppointments, AdminStatsRevenue } from "@/hooks/useAdmin";

export interface ManagerStats {
  salons_count: number;
  appointments: AdminStatsAppointments;
  revenue: AdminStatsRevenue;
}

export interface UpdateSalonData {
  name: string;
  description: string;
  address: string;
  city: string;
  cover?: File | null;
}

function toSalonFormData(data: {
  name: string;
  description: string;
  address: string;
  city: string;
  cover?: File | null;
}): FormData {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("address", data.address);
  formData.append("city", data.city);
  if (data.cover) formData.append("cover", data.cover);
  return formData;
}

export interface CreateSalonData {
  name: string;
  address: string;
  city: string;
  phone: string;
  description: string;
}

interface UseManagerResult {
  getSalonStats: () => Promise<ManagerStats>;
  createSalon: (data: CreateSalonData) => Promise<SalonDetail>;
  updateSalon: (id: number | string, data: UpdateSalonData) => Promise<SalonDetail>;
  deleteSalon: (id: number | string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useManager(): UseManagerResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSalonStats = useCallback(async (): Promise<ManagerStats> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<ManagerStats>("/manager/stats");
      return data;
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de charger les statistiques.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSalon = useCallback(async (data: CreateSalonData): Promise<SalonDetail> => {
    setLoading(true);
    setError(null);
    try {
      const { data: salon } = await api.post<SalonDetail>("/salons", data);
      return salon;
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de créer le salon.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSalon = useCallback(
    async (id: number | string, data: UpdateSalonData): Promise<SalonDetail> => {
      setLoading(true);
      setError(null);
      try {
        let salon: SalonDetail;
        if (data.cover) {
          // PHP never populates uploaded-file data on a raw PUT request body,
          // multipart or not — Laravel's documented workaround is to POST
          // with a `_method` override field instead.
          const formData = toSalonFormData(data);
          formData.append("_method", "PUT");
          const { data: updated } = await api.post<SalonDetail>(`/salons/${id}`, formData, {
            // The shared `api` instance defaults to Content-Type:
            // application/json, which overrides axios's usual FormData
            // auto-detection — clearing it lets the browser set its own
            // multipart boundary.
            headers: { "Content-Type": undefined },
          });
          salon = updated;
        } else {
          const { name, description, address, city } = data;
          const { data: updated } = await api.put<SalonDetail>(`/salons/${id}`, {
            name,
            description,
            address,
            city,
          });
          salon = updated;
        }
        return salon;
      } catch (err) {
        const message = toErrorMessage(err, "Impossible de mettre à jour le salon.");
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteSalon = useCallback(async (id: number | string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/salons/${id}`);
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de supprimer le salon.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { getSalonStats, createSalon, updateSalon, deleteSalon, loading, error };
}

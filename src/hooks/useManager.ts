import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import type { SalonDetail } from "@/lib/salons";

export interface SalonStats {
  nombreSalons: number;
  rdvAujourdhui: number;
  avis: number;
}

export interface UpdateSalonData {
  nom: string;
  description: string;
  adresse: string;
  services: string[];
}

interface UseManagerResult {
  getSalonStats: () => Promise<SalonStats>;
  updateSalon: (id: number | string, data: UpdateSalonData) => Promise<SalonDetail>;
  deleteSalon: (id: number | string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useManager(): UseManagerResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSalonStats = useCallback(async (): Promise<SalonStats> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<SalonStats>("/manager/stats");
      return data;
    } catch {
      setError("Impossible de charger les statistiques.");
      throw new Error("Impossible de charger les statistiques.");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSalon = useCallback(
    async (id: number | string, data: UpdateSalonData): Promise<SalonDetail> => {
      setLoading(true);
      setError(null);
      try {
        const { data: salon } = await api.put<SalonDetail>(`/salons/${id}`, data);
        return salon;
      } catch {
        setError("Impossible de mettre à jour le salon.");
        throw new Error("Impossible de mettre à jour le salon.");
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
    } catch {
      setError("Impossible de supprimer le salon.");
      throw new Error("Impossible de supprimer le salon.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { getSalonStats, updateSalon, deleteSalon, loading, error };
}

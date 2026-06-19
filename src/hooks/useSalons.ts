import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface Salon {
  id: number;
  nom: string;
  description: string;
}

interface UseSalonsResult {
  salons: Salon[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
}

export function useSalons(): UseSalonsResult {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<PaginatedResponse<Salon>>("/salons");
      setSalons(data.data);
    } catch {
      setError("Impossible de charger les salons.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  return { salons, loading, error, refetch: fetchSalons };
}

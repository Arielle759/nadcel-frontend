import { useCallback, useEffect, useState } from "react";
import { api, toErrorMessage } from "@/lib/api";

export interface Salon {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  cover: string | null;
  logo: string | null;
  rating: string | null;
  reviews_avg_rating: string | null;
  reviews_count: number;
  is_verified: boolean;
  is_active: boolean;
  service_categories: string[];
}

export interface SalonSearchParams {
  q?: string;
  per_page?: number;
}

interface UseSalonsResult {
  salons: Salon[];
  total: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  total?: number;
}

export function useSalons(params: SalonSearchParams = {}): UseSalonsResult {
  const { q, per_page } = params;
  const [salons, setSalons] = useState<Salon[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<PaginatedResponse<Salon>>("/salons", {
        params: { q, per_page },
      });
      setSalons(data.data);
      setTotal(data.total ?? data.data.length);
    } catch (err) {
      setError(toErrorMessage(err, "Impossible de charger les salons."));
    } finally {
      setLoading(false);
    }
  }, [q, per_page]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchSalons();
    });
  }, [fetchSalons]);

  return { salons, total, loading, error, refetch: fetchSalons };
}

import { useCallback, useEffect, useState } from "react";
import { api, toErrorMessage } from "@/lib/api";
import type { Salon } from "@/hooks/useSalons";

interface UseManagerSalonsResult {
  salons: Salon[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
}

export function useManagerSalons(): UseManagerSalonsResult {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<PaginatedResponse<Salon>>("/manager/salons");
      setSalons(data.data);
    } catch (err) {
      setError(toErrorMessage(err, "Impossible de charger les salons."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchSalons();
    });
  }, [fetchSalons]);

  return { salons, loading, error, refetch: fetchSalons };
}

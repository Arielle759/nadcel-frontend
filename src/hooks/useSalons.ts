import { useEffect, useState } from "react";
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
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
}

export function useSalons(): UseSalonsResult {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSalons() {
      try {
        const { data } = await api.get<PaginatedResponse<Salon>>("/salons");
        if (isMounted) setSalons(data.data);
      } catch {
        if (isMounted) setError("Impossible de charger les salons.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSalons();

    return () => {
      isMounted = false;
    };
  }, []);

  return { salons, loading, error };
}

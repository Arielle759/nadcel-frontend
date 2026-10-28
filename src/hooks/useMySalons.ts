import { useCallback, useEffect, useState } from "react";
import { api, toErrorMessage } from "@/lib/api";

export type PartnerRequestStatus = "pending" | "verified" | "suspended" | "rejected";

export interface MySalon {
  id: number;
  name: string;
  city: string;
  status: PartnerRequestStatus;
  created_at: string;
}

// Salons de l'utilisateur connecté et état de sa demande de partenariat
// (GET /my-salons, accessible aussi à un client dont la demande est en attente).
export function useMySalons(enabled: boolean) {
  const [salons, setSalons] = useState<MySalon[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<MySalon[]>("/my-salons");
      setSalons(data);
    } catch (err) {
      setError(toErrorMessage(err, "Impossible de vérifier votre demande."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    queueMicrotask(() => {
      load();
    });
  }, [enabled, load]);

  return { salons, loading: enabled && loading, error, reload: load };
}

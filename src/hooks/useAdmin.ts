import { useCallback } from "react";
import { api, toErrorMessage } from "@/lib/api";

// La plateforme ne voit aucun montant : chaque salon encaisse lui-même, sur place.
export interface AdminStats {
  salons: { online: number; pending: number; suspended: number; rejected: number };
  users: { clients: number; new_clients: number; managers: number };
  appointments: {
    this_month: number;
    last_month_same_period: number;
    trend: number | null; // en %, null sans période de comparaison
    cancellation_rate: number | null; // en %, sur les 30 derniers jours
    online_share: number | null; // en %, sur les 30 derniers jours
  };
  to_review: { pending_salons: number; low_reviews: number };
  monthly: AdminMonth[];
}

export interface AdminMonth {
  month: string; // "2026-03"
  appointments: number;
  new_clients: number;
  is_partial: boolean;
}

export type SalonState = "online" | "pending" | "suspended" | "rejected";

export interface AdminSalon {
  id: number;
  name: string;
  description: string | null;
  address: string;
  city: string;
  phone: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  reviews_count?: number;
  reviews_avg_rating?: number | string | null;
  manager?: { id: number; name: string; email: string } | null;
}

export interface AdminReview {
  id: number;
  rating: number;
  comment: string | null;
  manager_response: string | null;
  created_at: string;
  client: { id: number; name: string } | null;
  salon: { id: number; name: string } | null;
}

export interface Page<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export function salonState(salon: Pick<AdminSalon, "is_verified" | "is_active">): SalonState {
  if (salon.is_verified) return salon.is_active ? "online" : "suspended";
  return salon.is_active ? "pending" : "rejected";
}

export const SALON_STATE_LABELS: Record<SalonState, string> = {
  online: "En ligne",
  pending: "En attente",
  suspended: "Suspendu",
  rejected: "Refusé",
};

// Le message d'erreur de l'API (ex. « Seul un salon en ligne peut être suspendu. »)
// est affiché tel quel ; sinon un message par défaut en français.
async function call<T>(request: () => Promise<{ data: T }>, fallback: string): Promise<T> {
  try {
    const { data } = await request();
    return data;
  } catch (err) {
    throw new Error(toErrorMessage(err, fallback));
  }
}

export function useAdmin() {
  const getStats = useCallback(
    () => call(() => api.get<AdminStats>("/admin/stats"), "Impossible de charger le tableau de bord."),
    []
  );

  const getPendingSalons = useCallback(
    async () =>
      (await call(() => api.get<Page<AdminSalon>>("/admin/salons/pending"), "Impossible de charger les demandes.")).data,
    []
  );

  const getSalons = useCallback(
    (status?: SalonState) =>
      call(
        () => api.get<Page<AdminSalon>>("/admin/salons", { params: { per_page: 100, ...(status ? { status } : {}) } }),
        "Impossible de charger les salons."
      ),
    []
  );

  const changeSalonState = useCallback(
    (id: number, action: "verify" | "reject" | "suspend" | "reactivate") =>
      call(() => api.patch<AdminSalon>(`/admin/salons/${id}/${action}`), "L'action n'a pas pu être enregistrée."),
    []
  );

  const deleteSalon = useCallback(
    async (id: number) => {
      await call(() => api.delete(`/admin/salons/${id}`), "Impossible de supprimer le salon.");
    },
    []
  );

  const getReviews = useCallback(
    (page = 1, maxRating?: number) =>
      call(
        () =>
          api.get<Page<AdminReview>>("/reviews", {
            params: { page, per_page: 30, ...(maxRating ? { max_rating: maxRating } : {}) },
          }),
        "Impossible de charger les avis."
      ),
    []
  );

  const deleteReview = useCallback(
    async (id: number) => {
      await call(() => api.delete(`/admin/reviews/${id}`), "Impossible de supprimer l'avis.");
    },
    []
  );

  return { getStats, getPendingSalons, getSalons, changeSalonState, deleteSalon, getReviews, deleteReview };
}

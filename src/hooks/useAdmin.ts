import type { BookingSource } from "@/hooks/useManagerAppointments";
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
    // Détail par canal sur les 30 derniers jours (absent avec une ancienne API).
    sources?: { source: BookingSource; count: number; share: number }[];
    recent_total?: number;
  };
  to_review: { pending_salons: number; low_reviews: number };
  monthly: AdminMonth[];
  // Derniers rendez-vous enregistrés et salons en ligne par ville (absents d'une ancienne API).
  recent_appointments?: AdminRecentAppointment[];
  cities?: { city: string; count: number; share: number }[];
}

export interface AdminRecentAppointment {
  id: number;
  salon: string | null;
  service: string | null;
  option_label: string | null;
  scheduled_at: string;
  price: number;
  status: string;
}

// « employee » : rôle prévu dans la base mais attribué à aucun compte par l'application.
export type UserRoleName = "client" | "gerant" | "admin" | "employee";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  suspended_at: string | null;
  roles: { id: number; name: UserRoleName }[];
  appointments_count: number;
  salons_count: number;
}

export interface AdminMonth {
  month: string; // "2026-03"
  appointments: number;
  new_clients: number;
  is_partial: boolean;
}

export type SalonState = "online" | "deactivated" | "pending" | "suspended" | "rejected";

export interface AdminSalon {
  id: number;
  name: string;
  description: string | null;
  address: string;
  city: string;
  phone: string | null;
  is_verified: boolean;
  is_active: boolean;
  deactivated_at?: string | null; // retiré de la plateforme par son gérant
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

export function salonState(salon: Pick<AdminSalon, "is_verified" | "is_active" | "deactivated_at">): SalonState {
  if (salon.is_verified && salon.is_active && salon.deactivated_at) return "deactivated";
  if (salon.is_verified) return salon.is_active ? "online" : "suspended";
  return salon.is_active ? "pending" : "rejected";
}

export const SALON_STATE_LABELS: Record<SalonState, string> = {
  online: "En ligne",
  deactivated: "Désactivé par le gérant",
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

  const getUsers = useCallback(
    (params: { page?: number; search?: string; role?: UserRoleName | ""; status?: "active" | "suspended" | "" }) =>
      call(
        () =>
          api.get<Page<AdminUser>>("/admin/users", {
            params: Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== undefined)),
          }),
        "Impossible de charger les utilisateurs."
      ),
    []
  );

  const setUserSuspended = useCallback(
    (id: number, suspended: boolean) =>
      call(() => api.patch<AdminUser>(`/admin/users/${id}/${suspended ? "suspend" : "reactivate"}`), "L'action n'a pas pu être enregistrée."),
    []
  );

  return { getStats, getPendingSalons, getSalons, changeSalonState, getReviews, getUsers, setUserSuspended };
}

import { api } from "@/lib/api";
import type { Service } from "@/hooks/useServices";
import type { OpeningHours } from "@/lib/openingHours";

export interface SalonDetail {
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
  opening_hours: OpeningHours | null;
  services: Service[];
}

export async function getSalon(id: string): Promise<SalonDetail | null> {
  try {
    const { data } = await api.get<SalonDetail>(`/salons/${id}`);
    return data;
  } catch {
    return null;
  }
}

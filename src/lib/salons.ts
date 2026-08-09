import { api } from "@/lib/api";
import type { Service } from "@/hooks/useServices";

export interface SalonDetail {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  cover: string | null;
  logo: string | null;
  rating: string | null;
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

import { api } from "@/lib/api";
import type { Service } from "@/hooks/useServices";

export interface SalonDetail {
  id: number;
  nom: string;
  description: string;
  adresse: string;
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

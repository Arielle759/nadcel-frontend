import { api } from "@/lib/api";

export interface SalonDetail {
  id: number;
  nom: string;
  description: string;
  adresse: string;
  services: string[];
}

export async function getSalon(id: string): Promise<SalonDetail | null> {
  try {
    const { data } = await api.get<SalonDetail>(`/salons/${id}`);
    return data;
  } catch {
    return null;
  }
}

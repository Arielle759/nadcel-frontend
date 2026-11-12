import { useCallback } from "react";
import { api, toErrorMessage } from "@/lib/api";

export type MonthAvailability = Record<string, boolean>;

interface UseAvailabilityResult {
  getMonthAvailability: (
    salonId: number | string,
    serviceId: number | string,
    month: string,
    optionId?: number | null
  ) => Promise<MonthAvailability>;
  getDayAvailability: (
    salonId: number | string,
    date: string,
    serviceId: number | string,
    optionId?: number | null
  ) => Promise<string[]>;
}

export function useAvailability(): UseAvailabilityResult {
  const getMonthAvailability = useCallback(
    async (
      salonId: number | string,
      serviceId: number | string,
      month: string,
      optionId?: number | null
    ): Promise<MonthAvailability> => {
      try {
        const { data } = await api.get<MonthAvailability>(`/salons/${salonId}/availability`, {
          params: { service_id: serviceId, month, ...(optionId ? { option_id: optionId } : {}) },
        });
        return data;
      } catch (err) {
        throw new Error(toErrorMessage(err, "Impossible de charger les disponibilités."));
      }
    },
    []
  );

  const getDayAvailability = useCallback(
    async (
      salonId: number | string,
      date: string,
      serviceId: number | string,
      optionId?: number | null
    ): Promise<string[]> => {
      try {
        const { data } = await api.get<string[]>(`/salons/${salonId}/availability/${date}`, {
          params: { service_id: serviceId, ...(optionId ? { option_id: optionId } : {}) },
        });
        return data;
      } catch (err) {
        throw new Error(toErrorMessage(err, "Impossible de charger les créneaux disponibles."));
      }
    },
    []
  );

  return { getMonthAvailability, getDayAvailability };
}

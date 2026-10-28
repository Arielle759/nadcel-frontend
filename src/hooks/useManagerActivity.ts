import { useEffect, useState } from "react";
import { api, toErrorMessage } from "@/lib/api";

export type ActivityPeriod = "month" | "quarter" | "year";
export type DayPart = "matin" | "apres_midi" | "soir";

export interface ActivityTopService {
  service_id: number;
  name: string;
  count: number;
  share: number;
  revenue: number;
  previous_count: number;
  trend: number | null;
}

export interface ActivityMonth {
  month: string; // YYYY-MM
  total: number;
  revenue: number;
  by_service: Record<string, number>;
  is_partial: boolean;
}

export interface ActivityBusySlot {
  day: number; // 1 = lundi … 7 = dimanche
  part: DayPart;
  count: number;
}

export interface ActivityEmployee {
  employee_id: number;
  name: string;
  count: number;
  revenue: number;
}

export interface ActivityPaymentMethod {
  method: "especes" | "wave" | "orange_money";
  count: number;
  amount: number;
  share: number;
}

export interface ActivityForecast {
  month: string;
  expected: number | null;
  method: "seasonal" | "moving_average" | "insufficient_data";
  months_of_history: number;
  peak_month: { month: string; total: number } | null;
}

export interface ManagerActivity {
  period: { key: ActivityPeriod; days: number; start: string; end: string };
  totals: {
    completed: number;
    revenue: number;
    previous_completed: number;
    previous_revenue: number;
    trend: number | null;
  };
  top_services: ActivityTopService[];
  monthly: ActivityMonth[];
  busy_slots: ActivityBusySlot[];
  employees: ActivityEmployee[];
  loyalty: { clients: number; returning: number; rate: number };
  payment_methods: ActivityPaymentMethod[];
  forecast: ActivityForecast;
}

interface UseManagerActivityResult {
  data: ManagerActivity | null;
  loading: boolean;
  error: string | null;
}

interface FetchState {
  period: ActivityPeriod | null; // période à laquelle correspond la dernière réponse
  data: ManagerActivity | null;
  error: string | null;
}

export function useManagerActivity(period: ActivityPeriod): UseManagerActivityResult {
  const [state, setState] = useState<FetchState>({ period: null, data: null, error: null });

  useEffect(() => {
    let active = true;

    api
      .get<ManagerActivity>("/manager/stats/activity", { params: { period } })
      .then(({ data }) => {
        if (active) setState({ period, data, error: null });
      })
      .catch((err) => {
        if (active) {
          setState((previous) => ({
            period,
            data: previous.data,
            error: toErrorMessage(err, "Impossible de charger l'activité du salon."),
          }));
        }
      });

    return () => {
      active = false;
    };
  }, [period]);

  // Pendant le changement de période, les anciennes données restent affichées.
  return { data: state.data, loading: state.period !== period, error: state.error };
}

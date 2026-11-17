"use client";

import { useState } from "react";
import { useManagerActivity, type ActivityPeriod } from "@/hooks/useManagerActivity";
import ActivitySection from "@/components/manager/ActivitySection";
import HubPage, { SalonPicker, useChosenSalon } from "@/components/manager/HubPage";

// Analyses détaillées : services, prévision, clients fidèles, évolution sur
// 12 mois, moments chargés, encaissements et canaux de réservation.
export default function ManagerStatisticsPage() {
  const { salons, salonId, choose } = useChosenSalon();
  const [period, setPeriod] = useState<ActivityPeriod>("month");
  const activity = useManagerActivity(period, salonId);

  return (
    <HubPage
      title="Statistiques"
      subtitle="Rendez-vous réalisés et encaissements de vos salons, sur la période choisie."
      actions={<SalonPicker salons={salons} salonId={salonId} onChange={choose} />}
    >
      <ActivitySection data={activity.data} loading={activity.loading} error={activity.error} period={period} onPeriodChange={setPeriod} />
    </HubPage>
  );
}

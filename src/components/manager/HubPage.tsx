"use client";

import { useState } from "react";
import { useManagerSalons } from "@/hooks/useManagerSalons";
import type { Salon } from "@/hooks/useSalons";

// Cartes des pages de l'espace gérant : fond très légèrement teinté, fine bordure.
export const HUB_CARD = "rounded-xl border border-[#ebe4dd] bg-[#faf8f6] shadow-[0_1px_3px_rgba(60,40,30,0.06)]";

// Gabarit des pages de l'espace gérant : grand titre en Figtree grasse,
// phrase d'aide, actions à droite.
export default function HubPage({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col px-5 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-sans text-[28px] font-bold leading-tight tracking-tight text-anthracite">{title}</h1>
            {subtitle && <p className="mt-2 text-[15px] text-anthracite/65">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
        {children}
      </div>
    </main>
  );
}

// Salon choisi dans les pages de l'espace gérant, gardé dans ce navigateur
// (confort seulement : sans stockage, on revient à « Tous mes salons »).
const SALON_KEY = "nadcel_dashboard_salon";

function readSavedSalon(): number | null {
  try {
    const raw = typeof window === "undefined" ? null : window.localStorage.getItem(SALON_KEY);
    const id = raw ? Number(raw) : NaN;
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export function useChosenSalon(): {
  salons: Salon[];
  loading: boolean;
  salonId: number | null;
  choose: (id: number | null) => void;
} {
  const { salons: all, loading } = useManagerSalons();
  const [chosen, setChosen] = useState<number | null>(readSavedSalon);
  const salons = all.filter((salon) => salon.is_verified);
  // Un salon mémorisé qui n'appartient plus au gérant est ignoré.
  const salonId = chosen !== null && (loading || salons.some((s) => s.id === chosen)) ? chosen : null;

  function choose(id: number | null) {
    setChosen(id);
    try {
      if (id) window.localStorage.setItem(SALON_KEY, String(id));
      else window.localStorage.removeItem(SALON_KEY);
    } catch {
      // stockage indisponible : le choix vaut pour cette visite seulement
    }
  }

  return { salons, loading, salonId, choose };
}

export function SalonPicker({
  salons,
  salonId,
  onChange,
  allowAll = true,
}: {
  salons: Salon[];
  salonId: number | null;
  onChange: (id: number | null) => void;
  allowAll?: boolean;
}) {
  if (salons.length < 2) return null;
  return (
    <label className="flex items-center">
      <span className="sr-only">Salon affiché</span>
      <select
        value={salonId ?? "all"}
        onChange={(e) => onChange(e.target.value === "all" ? null : Number(e.target.value))}
        className="h-10 rounded-lg border border-[#ebe4dd] bg-white px-3 pr-8 text-sm font-medium text-anthracite focus-visible:outline-2 focus-visible:outline-accent"
      >
        {allowAll && <option value="all">Tous mes salons ({salons.length})</option>}
        {salons.map((salon) => (
          <option key={salon.id} value={salon.id}>
            {salon.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export const HUB_BUTTON =
  "inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-[0_1px_3px_rgba(143,74,50,0.3)] transition-colors hover:bg-cacao";

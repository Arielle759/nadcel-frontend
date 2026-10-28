"use client";

import { FormEvent, useState } from "react";
import type { OnSitePaymentMethod } from "@/hooks/useManagerAppointments";

const METHODS: { value: OnSitePaymentMethod; label: string }[] = [
  { value: "especes", label: "Espèces" },
  { value: "wave", label: "Wave" },
  { value: "orange_money", label: "Orange Money" },
];

// Clôture d'un rendez-vous réalisé : le paiement a eu lieu sur place, le gérant le note.
// Le montant est prérempli avec le prix prévu, qui n'est qu'indicatif.
export default function CloseAppointmentForm({
  appointmentId,
  defaultAmount,
  submitting,
  onSubmit,
  onCancel,
}: {
  appointmentId: number;
  defaultAmount: number;
  submitting: boolean;
  onSubmit: (amount: number, method: OnSitePaymentMethod) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState(String(Math.round(defaultAmount)));
  const [method, setMethod] = useState<OnSitePaymentMethod | null>(null);
  const [error, setError] = useState<string | null>(null);

  const amountId = `amount-${appointmentId}`;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 0) {
      setError("Indiquez un montant valide.");
      return;
    }
    if (!method) {
      setError("Choisissez le moyen de paiement.");
      return;
    }
    setError(null);
    onSubmit(value, method);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-2xl border border-sage/30 bg-white/60 p-4 sm:w-80"
      aria-label="Clôturer le rendez-vous"
    >
      <p className="text-sm font-semibold text-forest">Client venu : enregistrer le paiement</p>

      <div className="flex flex-col gap-1">
        <label htmlFor={amountId} className="text-xs font-semibold text-anthracite/70">
          Montant encaissé (F CFA)
        </label>
        <input
          id={amountId}
          type="number"
          inputMode="numeric"
          min={0}
          step={500}
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-xl border border-sage/35 bg-white px-3 py-2 text-sm outline-none focus:border-dark-sage focus:ring-4 focus:ring-sage/10"
        />
      </div>

      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-xs font-semibold text-anthracite/70">Moyen de paiement</legend>
        <div className="flex flex-wrap gap-2">
          {METHODS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={method === value}
              onClick={() => setMethod(value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                method === value
                  ? "border-forest bg-forest text-beige"
                  : "border-dark-sage/40 text-link-sage hover:bg-sage/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-beige transition-colors hover:bg-dark-sage disabled:opacity-50"
        >
          {submitting ? "Enregistrement..." : "Clôturer le rendez-vous"}
        </button>
        <button type="button" onClick={onCancel} className="text-xs text-anthracite/70 hover:underline">
          Annuler
        </button>
      </div>
    </form>
  );
}

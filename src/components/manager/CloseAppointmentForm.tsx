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
      aria-label="Clôturer le rendez-vous"
      className="flex flex-col gap-3 rounded-xl border border-sage/25 bg-sage/[0.06] px-4 py-3"
    >
      <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={amountId} className="text-[11px] font-semibold uppercase tracking-wide text-anthracite/60">
            Montant encaissé
          </label>
          <div className="flex items-center rounded-lg border border-sage/35 bg-white focus-within:border-dark-sage focus-within:ring-4 focus-within:ring-sage/10">
            <input
              id={amountId}
              type="number"
              inputMode="numeric"
              min={0}
              step={500}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-28 rounded-lg bg-transparent px-3 py-1.5 text-sm outline-none"
            />
            <span className="pr-3 text-xs text-anthracite/55">F CFA</span>
          </div>
        </div>

        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-anthracite/60">
            Payé par
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {METHODS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={method === value}
                onClick={() => setMethod(value)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  method === value
                    ? "border-forest bg-forest text-beige"
                    : "border-sage/40 bg-white text-anthracite/75 hover:border-dark-sage"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg px-3 py-1.5 text-xs font-medium text-anthracite/65 hover:bg-sage/10">
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-forest px-4 py-1.5 text-xs font-semibold text-beige transition-colors hover:bg-dark-sage disabled:opacity-50"
          >
            {submitting ? "Enregistrement..." : "Valider la clôture"}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}

"use client";

import { useState } from "react";
import { ui } from "@/lib/ui";

// Action sensible en deux temps, sans fenêtre du navigateur : un bouton
// discret, puis une vraie confirmation au même endroit. Sert aussi pour
// « Refuser » ou « Suspendre » côté administration.
export default function ConfirmDelete({
  label = "Supprimer",
  question,
  onConfirm,
  confirmLabel = "Oui, supprimer",
  busyLabel = "Suppression...",
}: {
  label?: string;
  question: string;
  onConfirm: () => Promise<void>;
  confirmLabel?: string;
  busyLabel?: string;
}) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      setAsking(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'action a échoué.");
    } finally {
      setBusy(false);
    }
  }

  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} className={ui.buttonDangerGhost}>
        {label}
      </button>
    );
  }

  return (
    <div role="alertdialog" aria-label={question} className="flex flex-wrap items-center gap-2 rounded-2xl bg-red-50 px-3 py-2">
      <span className="text-sm font-medium text-red-900">{question}</span>
      <button type="button" onClick={confirm} disabled={busy} className={ui.buttonDanger}>
        {busy ? busyLabel : confirmLabel}
      </button>
      <button type="button" onClick={() => setAsking(false)} className="min-h-11 rounded-full px-3 text-sm font-semibold text-anthracite/80 hover:text-brand">
        Annuler
      </button>
      {error && <p className="w-full text-sm text-red-800">{error}</p>}
    </div>
  );
}

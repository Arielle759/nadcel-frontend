"use client";

import { useState } from "react";
import type { AdminSalon } from "@/hooks/useAdmin";
import ConfirmDelete from "@/components/ConfirmDelete";
import { ui } from "@/lib/ui";

function sentLabel(iso: string, now: number): string {
  const days = Math.floor((now - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Reçue aujourd'hui";
  if (days === 1) return "Reçue hier";
  return `Reçue il y a ${days} jours`;
}

// Une demande de partenariat : tout ce qu'il faut pour décider, et les deux
// décisions possibles. Le refus passe par une confirmation sur place.
export default function PartnerRequestCard({
  salon,
  onValidate,
  onReject,
  compact = false,
}: {
  salon: AdminSalon;
  onValidate: () => Promise<void>;
  onReject: () => Promise<void>;
  compact?: boolean;
}) {
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Heure figée au montage : le rendu reste pur.
  const [now] = useState(() => Date.now());
  // Au-delà de 48 h, le délai annoncé aux gérants est dépassé.
  const late = now - new Date(salon.created_at).getTime() > 2 * 86_400_000;

  async function validate() {
    setValidating(true);
    setError(null);
    try {
      await onValidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "La validation a échoué.");
      setValidating(false);
    }
  }

  return (
    <li className={compact ? "rounded-xl bg-beige px-4 py-4" : `${ui.surface} p-5 sm:p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className={`font-semibold text-forest ${compact ? "" : "font-heading text-xl"}`}>{salon.name}</p>
          <p className="mt-0.5 text-sm text-anthracite/75">
            {salon.address}, {salon.city}
          </p>
          <p className={`mt-1 text-xs font-medium ${late ? "text-terracotta" : "text-anthracite/60"}`}>
            {sentLabel(salon.created_at, now)}
            {late ? ", délai de 48 h dépassé" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={validate} disabled={validating} className={ui.buttonPrimary}>
            {validating ? "Validation..." : "Valider"}
          </button>
          <ConfirmDelete
            label="Refuser"
            question={`Refuser la demande de ${salon.name} ?`}
            confirmLabel="Oui, refuser"
            busyLabel="Refus..."
            onConfirm={onReject}
          />
        </div>
      </div>

      {!compact && (
        <dl className="mt-5 grid gap-4 rounded-xl bg-beige px-4 py-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-anthracite/60">Demandeur</dt>
            <dd className="mt-0.5 font-medium text-anthracite">{salon.manager?.name ?? "Compte supprimé"}</dd>
            {salon.manager?.email && <dd className="text-anthracite/75">{salon.manager.email}</dd>}
          </div>
          <div>
            <dt className="text-anthracite/60">Téléphone du salon</dt>
            <dd className="mt-0.5 font-medium text-anthracite">
              {salon.phone ? (
                <a href={`tel:${salon.phone.replace(/\s/g, "")}`} className={ui.textLink}>
                  {salon.phone}
                </a>
              ) : (
                "Non renseigné"
              )}
            </dd>
          </div>
          {salon.description && (
            <div className="sm:col-span-2">
              <dt className="text-anthracite/60">Présentation</dt>
              <dd className="mt-0.5 leading-6 text-anthracite/85">{salon.description}</dd>
            </div>
          )}
        </dl>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </li>
  );
}

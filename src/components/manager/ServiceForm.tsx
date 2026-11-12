"use client";

import { FormEvent, useState } from "react";
import ImageUploadInput from "@/components/ImageUploadInput";
import { ui } from "@/lib/ui";
import { SERVICE_CATEGORIES, SERVICE_CATEGORY_GROUPS } from "@/lib/serviceCategories";
import type { ServiceOption } from "@/hooks/useServices";

export interface ServiceFormValues {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  // Choix proposé à la cliente (ex. « Longueur ») ; tableau vide = prix unique.
  option_label: string | null;
  options: ServiceOption[];
  image: File | null;
}

interface OptionRow {
  label: string;
  price: string;
  duration: string;
}

// Raccourci pour les tresses : les quatre longueurs courantes, prix à compléter.
const BRAID_LENGTHS: OptionRow[] = [
  { label: "Épaules", price: "", duration: "180" },
  { label: "Mi-dos", price: "", duration: "240" },
  { label: "Fesses", price: "", duration: "300" },
  { label: "Après les fesses", price: "", duration: "360" },
];
const MAX_OPTIONS = 8;

// Valeur technique de l'option « Autre catégorie » (saisie libre).
const OTHER = "__autre__";
// Jusqu'à 10 h : certaines coiffures (tresses, nattes, locks) prennent une journée.
const DURATIONS = [15, 30, 45, 60, 90, 120, 150, 180, 240, 300, 360, 420, 480, 540, 600];

function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m}`;
}

export default function ServiceForm({
  initial,
  currentImageUrl,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<Omit<ServiceFormValues, "image" | "options">> & {
    options?: ServiceOption[];
  };
  currentImageUrl?: string;
  submitLabel: string;
  onSubmit: (values: ServiceFormValues) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price !== undefined ? String(initial.price) : "");
  const [duration, setDuration] = useState(String(initial?.duration ?? 30));
  const [category, setCategory] = useState(initial?.category ?? "");
  // Catégorie d'un service existant qui n'est pas dans la liste : on la garde
  // comme option, pour ne pas obliger le gérant à la changer.
  const initialCategory = initial?.category?.trim() ?? "";
  const legacyCategory = initialCategory && !SERVICE_CATEGORIES.includes(initialCategory) ? initialCategory : "";
  const [customMode, setCustomMode] = useState(false);
  const [withOptions, setWithOptions] = useState((initial?.options?.length ?? 0) > 0);
  const [optionLabel, setOptionLabel] = useState(initial?.option_label || "Longueur");
  const [optionRows, setOptionRows] = useState<OptionRow[]>(
    () =>
      initial?.options?.map((o) => ({
        label: o.label,
        price: String(Math.round(Number(o.price))),
        duration: String(o.duration),
      })) ?? [],
  );

  function updateRow(index: number, patch: Partial<OptionRow>) {
    setOptionRows((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function toggleOptions(on: boolean) {
    setWithOptions(on);
    if (on && optionRows.length === 0) {
      setOptionRows([
        { label: "", price: price, duration: duration },
        { label: "", price: "", duration: duration },
      ]);
    }
  }
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const durationOptions = DURATIONS.includes(Number(duration)) ? DURATIONS : [...DURATIONS, Number(duration)].sort((a, b) => a - b);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const options: ServiceOption[] = withOptions
      ? optionRows.map((r) => ({
          label: r.label.trim(),
          price: Math.round(Number(r.price)),
          duration: Number(r.duration),
        }))
      : [];
    if (withOptions) {
      if (options.length < 2) {
        setMessage({
          ok: false,
          text: "Ajoutez au moins deux options, ou décochez la case.",
        });
        return;
      }
      if (new Set(options.map((o) => o.label.toLowerCase())).size !== options.length) {
        setMessage({ ok: false, text: "Deux options portent le même nom." });
        return;
      }
    }
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        // Avec des options, le service affiche « dès » le prix le plus bas.
        price: withOptions ? Math.min(...options.map((o) => o.price)) : Math.round(Number(price)),
        duration: withOptions ? Math.min(...options.map((o) => o.duration)) : Number(duration),
        category: category.trim(),
        option_label: withOptions ? optionLabel.trim() || "Longueur" : null,
        options,
        image,
      });
      setMessage({ ok: true, text: "Service enregistré." });
    } catch (err) {
      setMessage({
        ok: false,
        text: err instanceof Error ? err.message : "Enregistrement impossible.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${ui.surface} flex flex-col gap-5 p-6 sm:p-8`}>
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={ui.label}>
          Nom du service
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tresses box braids"
          className={ui.input}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="category" className={ui.label}>
            Catégorie
          </label>
          <select
            id="category"
            required
            value={customMode ? OTHER : category}
            onChange={(e) => {
              if (e.target.value === OTHER) {
                setCustomMode(true);
                setCategory("");
              } else {
                setCustomMode(false);
                setCategory(e.target.value);
              }
            }}
            className={ui.input}
          >
            <option value="" disabled>
              Choisir une catégorie
            </option>
            {legacyCategory && (
              <optgroup label="Catégorie actuelle">
                <option value={legacyCategory}>{legacyCategory}</option>
              </optgroup>
            )}
            {SERVICE_CATEGORY_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value={OTHER}>Autre catégorie…</option>
          </select>
          {customMode && (
            <input
              id="category-other"
              required
              autoFocus
              aria-label="Nom de la catégorie"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Nom de la catégorie"
              className={ui.input}
            />
          )}
        </div>
        {!withOptions && (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor="price" className={ui.label}>
                Prix (F CFA)
              </label>
              <input
                id="price"
                type="number"
                inputMode="numeric"
                min="0"
                step="500"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="15000"
                className={ui.input}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="duration" className={ui.label}>
                Durée
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                aria-describedby={Number(duration) >= 300 ? "duration-hint" : undefined}
                className={ui.input}
              >
                {durationOptions.map((d) => (
                  <option key={d} value={d}>
                    {durationLabel(d)}
                  </option>
                ))}
              </select>
              {Number(duration) >= 300 && (
                <p id="duration-hint" className="text-xs text-anthracite/70">
                  Les clientes ne verront que les heures de début qui permettent de finir avant la fermeture du salon.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <fieldset className="flex flex-col gap-4 rounded-2xl border border-sable/40 p-4 sm:p-5">
        <legend className="px-1 text-sm font-semibold text-brand">Prix selon la longueur ou la taille</legend>
        <label className="flex items-start gap-3 text-sm text-anthracite">
          <input
            type="checkbox"
            checked={withOptions}
            onChange={(e) => toggleOptions(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand)]"
          />
          <span>
            Ce service a plusieurs choix, chacun avec son prix et sa durée (par exemple la longueur des tresses). La cliente choisit en
            réservant.
          </span>
        </label>

        {withOptions && (
          <>
            <div className="flex flex-col gap-2 sm:max-w-xs">
              <label htmlFor="option-label" className={ui.label}>
                Nom du choix
              </label>
              <input
                id="option-label"
                value={optionLabel}
                onChange={(e) => setOptionLabel(e.target.value)}
                placeholder="Longueur"
                maxLength={40}
                className={ui.input}
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="hidden grid-cols-[minmax(0,1fr)_8rem_8rem_2.75rem] gap-2 text-xs font-semibold text-anthracite/75 sm:grid">
                <span>Option</span>
                <span>Prix (F CFA)</span>
                <span>Durée</span>
                <span className="sr-only">Retirer</span>
              </div>
              {optionRows.map((row, index) => (
                <div key={index} className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_8rem_8rem_2.75rem]">
                  <input
                    required
                    aria-label={`Option ${index + 1}`}
                    value={row.label}
                    onChange={(e) => updateRow(index, { label: e.target.value })}
                    placeholder={BRAID_LENGTHS[index]?.label ?? "Option"}
                    maxLength={60}
                    className={`${ui.input} col-span-2 sm:col-span-1`}
                  />
                  <input
                    required
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="500"
                    aria-label={`Prix de l'option ${index + 1}`}
                    value={row.price}
                    onChange={(e) => updateRow(index, { price: e.target.value })}
                    placeholder="15000"
                    className={ui.input}
                  />
                  <select
                    aria-label={`Durée de l'option ${index + 1}`}
                    value={row.duration}
                    onChange={(e) => updateRow(index, { duration: e.target.value })}
                    className={ui.input}
                  >
                    {(DURATIONS.includes(Number(row.duration))
                      ? DURATIONS
                      : [...DURATIONS, Number(row.duration)].sort((a, b) => a - b)
                    ).map((d) => (
                      <option key={d} value={d}>
                        {durationLabel(d)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setOptionRows((rows) => rows.filter((_, i) => i !== index))}
                    aria-label={`Retirer l'option ${row.label || index + 1}`}
                    className="col-span-2 min-h-11 rounded-full text-sm text-anthracite/75 hover:bg-sable/15 hover:text-alert sm:col-span-1"
                  >
                    <span aria-hidden="true" className="hidden sm:inline">
                      ✕
                    </span>
                    <span className="sm:hidden">Retirer</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={optionRows.length >= MAX_OPTIONS}
                onClick={() => setOptionRows((rows) => [...rows, { label: "", price: "", duration: duration }])}
                className={`${ui.buttonSecondary} min-h-10 px-4 text-sm`}
              >
                Ajouter une option
              </button>
              <button
                type="button"
                onClick={() => {
                  setOptionLabel("Longueur");
                  setOptionRows(BRAID_LENGTHS);
                }}
                className={`${ui.buttonSecondary} min-h-10 px-4 text-sm`}
              >
                Longueurs de tresses
              </button>
            </div>
            <p className="text-xs leading-5 text-anthracite/70">
              Le service s&apos;affichera « dès » le prix le plus bas. Les créneaux proposés tiennent compte de la durée de l&apos;option
              choisie.
            </p>
          </>
        )}
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className={ui.label}>
          Description
        </label>
        <textarea
          id="description"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ce que comprend le service, les produits utilisés..."
          className={ui.textarea}
        />
      </div>

      <ImageUploadInput currentImageUrl={currentImageUrl} onChange={setImage} />

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button type="submit" disabled={saving} className={ui.buttonPrimary}>
          {saving ? "Enregistrement..." : submitLabel}
        </button>
        {message && (
          <p role="status" className={`text-sm font-medium ${message.ok ? "text-brand" : "text-red-700"}`}>
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}

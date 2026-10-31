"use client";

import { FormEvent, useState } from "react";
import ImageUploadInput from "@/components/ImageUploadInput";
import { ui } from "@/lib/ui";

export interface ServiceFormValues {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image: File | null;
}

// Catégories proposées (la saisie reste libre) : ce sont aussi les termes que
// la recherche publique et les vignettes de l'accueil savent retrouver.
const CATEGORY_SUGGESTIONS = ["Coiffure", "Coloration", "Soin", "Manucure", "Massage", "Épilation", "Maquillage"];
const DURATIONS = [15, 30, 45, 60, 90, 120, 180];

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
  initial?: Partial<Omit<ServiceFormValues, "image">>;
  currentImageUrl?: string;
  submitLabel: string;
  onSubmit: (values: ServiceFormValues) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price !== undefined ? String(initial.price) : "");
  const [duration, setDuration] = useState(String(initial?.duration ?? 30));
  const [category, setCategory] = useState(initial?.category ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const durationOptions = DURATIONS.includes(Number(duration)) ? DURATIONS : [...DURATIONS, Number(duration)].sort((a, b) => a - b);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        price: Math.round(Number(price)),
        duration: Number(duration),
        category: category.trim(),
        image,
      });
      setMessage({ ok: true, text: "Prestation enregistrée." });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Enregistrement impossible." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${ui.surface} flex flex-col gap-5 p-6 sm:p-8`}>
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={ui.label}>
          Nom de la prestation
        </label>
        <input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Tresses box braids" className={ui.input} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="category" className={ui.label}>
            Catégorie
          </label>
          <input
            id="category"
            required
            list="category-suggestions"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Coiffure"
            className={ui.input}
          />
          <datalist id="category-suggestions">
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
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
          <select id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className={ui.input}>
            {durationOptions.map((d) => (
              <option key={d} value={d}>
                {durationLabel(d)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className={ui.label}>
          Description
        </label>
        <textarea
          id="description"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ce que comprend la prestation, les produits utilisés..."
          className={ui.textarea}
        />
      </div>

      <ImageUploadInput currentImageUrl={currentImageUrl} onChange={setImage} />

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button type="submit" disabled={saving} className={ui.buttonPrimary}>
          {saving ? "Enregistrement..." : submitLabel}
        </button>
        {message && (
          <p role="status" className={`text-sm font-medium ${message.ok ? "text-forest" : "text-red-700"}`}>
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}

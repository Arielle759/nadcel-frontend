"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { resizeImage } from "@/lib/resizeImage";
import { ui } from "@/lib/ui";

export default function ImageUploadInput({
  label = "Photo (facultatif)",
  currentImageUrl,
  onChange,
}: {
  label?: string;
  currentImageUrl?: string;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Un clic sur « Retirer » vide le cadre au lieu de revenir à currentImageUrl.
  const [removed, setRemoved] = useState(false);
  const [preparing, setPreparing] = useState(false);

  // Libère l'URL temporaire quand elle est remplacée ou que le formulaire disparaît.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const original = e.target.files?.[0] ?? null;
    if (!original) return;
    setPreparing(true);
    const file = await resizeImage(original);
    setPreparing(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoved(false);
    onChange(file);
  }

  function handleRemove() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setRemoved(true);
    if (inputRef.current) inputRef.current.value = "";
    onChange(null);
  }

  const displayUrl = removed ? undefined : (previewUrl ?? currentImageUrl);

  return (
    <div className="flex flex-col gap-2">
      <span className={ui.label}>{label}</span>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="sr-only" tabIndex={-1} />
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex aspect-[4/3] w-40 items-center justify-center overflow-hidden rounded-xl bg-sable/15">
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt="Aperçu de la photo" className="h-full w-full object-cover" />
          ) : (
            <span className="px-3 text-center text-xs text-anthracite/75">Aucune photo</span>
          )}
        </div>
        <div className="flex flex-col items-start gap-1">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={preparing} className={ui.buttonSecondary}>
            {preparing ? "Préparation de la photo..." : displayUrl ? "Changer la photo" : "Choisir une photo"}
          </button>
          {displayUrl && (
            <button type="button" onClick={handleRemove} className="px-2 py-1 text-sm font-semibold text-red-800 hover:text-red-900">
              Retirer
            </button>
          )}
          <span className="px-2 text-xs text-anthracite/75">JPG ou PNG, format paysage de préférence. Les photos du téléphone sont acceptées.</span>
        </div>
      </div>
    </div>
  );
}

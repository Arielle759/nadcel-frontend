"use client";

import { ChangeEvent, KeyboardEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

export default function ImageUploadInput({
  label = "Photo (optionnel)",
  currentImageUrl,
  onChange,
}: {
  label?: string;
  currentImageUrl?: string;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Tracks an explicit "remove" click so the frame goes back to empty instead
  // of falling back to currentImageUrl once a preview is cleared.
  const [removed, setRemoved] = useState(false);

  // Revoke the object URL whenever it's replaced or the form unmounts, so we
  // don't leak blob URLs as the user swaps the selected photo around.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
    setRemoved(false);
    onChange(file);
  }

  function handleRemove(e: MouseEvent) {
    e.stopPropagation();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setRemoved(true);
    if (inputRef.current) inputRef.current.value = "";
    onChange(null);
  }

  function handleFrameKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  }

  const displayUrl = removed ? undefined : (previewUrl ?? currentImageUrl);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <div
        role="button"
        tabIndex={0}
        aria-label="Ajouter ou modifier la photo"
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleFrameKeyDown}
        className="relative flex aspect-[4/3] w-full max-w-[220px] cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-sage bg-sage/5 transition-colors hover:bg-sage/10"
      >
        {displayUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt="Aperçu de la photo sélectionnée"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Retirer la photo"
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-terracotta/90 text-white transition-colors hover:bg-terracotta"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 px-4 text-center text-anthracite/60">
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs">Cliquez pour ajouter une photo</span>
          </div>
        )}
      </div>
    </div>
  );
}

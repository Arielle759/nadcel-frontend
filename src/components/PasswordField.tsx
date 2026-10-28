"use client";

import { useState, type ChangeEventHandler } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ui } from "@/lib/ui";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  autoComplete?: "current-password" | "new-password";
  hint?: string;
  minLength?: number;
}

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  hint,
  minLength,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const actionLabel = isVisible ? "Masquer le mot de passe" : "Afficher le mot de passe";

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={ui.label}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          required
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          minLength={minLength}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={`${ui.input} pr-12`}
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={actionLabel}
          title={actionLabel}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-anthracite/60 transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-dark-sage"
        >
          {isVisible ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
        </button>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-anthracite/70">
          {hint}
        </p>
      )}
    </div>
  );
}

"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import PasswordField from "@/components/PasswordField";
import { api } from "@/lib/api";
import { ui } from "@/lib/ui";

// Doit rester aligné sur la règle du backend (min:12).
const PASSWORD_MIN_LENGTH = 12;

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`);
      return;
    }
    if (password !== confirmation) {
      setError("Les deux mots de passe ne sont pas identiques.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, email, password });
      setDone(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setExpired(message.includes("plus valable"));
      setError(message || "Impossible de modifier le mot de passe.");
    } finally {
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className={`${ui.surface} flex flex-col gap-4 rounded-3xl p-6 sm:p-8`}>
        <p className="leading-7 text-anthracite/80">Ce lien est incomplet. Ouvrez le lien reçu par e-mail en entier, ou demandez-en un nouveau.</p>
        <div>
          <Link href="/mot-de-passe-oublie" className={ui.buttonPrimary}>
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div role="status" className={`${ui.surface} flex flex-col gap-4 rounded-3xl p-6 sm:p-8`}>
        <p className="font-heading text-2xl font-semibold text-forest">Mot de passe modifié</p>
        <p className="leading-7 text-anthracite/80">
          Vous pouvez vous connecter avec votre nouveau mot de passe. Par sécurité, vos autres sessions ont été fermées.
        </p>
        <div>
          <Link href="/login" className={ui.buttonPrimary}>
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`${ui.surface} flex flex-col gap-5 rounded-3xl p-6 sm:p-8`}>
      <p className="text-sm text-anthracite/75">
        Compte : <strong className="text-forest">{email}</strong>
      </p>
      <PasswordField
        id="password"
        label="Nouveau mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
        hint={`${PASSWORD_MIN_LENGTH} caractères minimum.`}
      />
      <PasswordField
        id="confirmation"
        label="Confirmer le mot de passe"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        autoComplete="new-password"
      />
      {error && (
        <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}{" "}
          {expired && (
            <Link href="/mot-de-passe-oublie" className="font-semibold underline-offset-2 hover:underline">
              Demander un nouveau lien
            </Link>
          )}
        </div>
      )}
      <button type="submit" disabled={loading} className={`${ui.buttonPrimary} h-12 text-base`}>
        {loading ? "Enregistrement..." : "Enregistrer le mot de passe"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Nouveau mot de passe"
      intro="Choisissez un mot de passe que vous n'utilisez pas ailleurs."
      image="/images/services/login.jpg"
      quote="La beauté, simplement organisée."
    >
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}

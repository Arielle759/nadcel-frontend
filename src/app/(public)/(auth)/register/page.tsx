"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/auth";
import { nextUrlForBookingDraft } from "@/lib/bookingDraft";
import PasswordField from "@/components/PasswordField";
import AuthShell from "@/components/AuthShell";
import { ui } from "@/lib/ui";

// Doit rester aligné sur la règle du backend (routes/api.php : min:12).
const PASSWORD_MIN_LENGTH = 12;

function registrationErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message.toLowerCase() : "";
  if (message.includes("email") && (message.includes("taken") || message.includes("déjà"))) {
    return "Un compte existe déjà avec cet e-mail. Connectez-vous plutôt.";
  }
  if (message.includes("connexion") || message.includes("serveur")) {
    return "Impossible de contacter le serveur. Vérifiez votre connexion.";
  }
  return "Impossible de créer le compte. Vérifiez vos informations.";
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`);
      return;
    }
    if (password !== passwordConfirmation) {
      setError("Les deux mots de passe ne sont pas identiques.");
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password });
      router.push(nextUrlForBookingDraft());
    } catch (err) {
      setError(registrationErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Créez votre compte"
      intro="Gratuit, sans engagement. Réservez ensuite dans tous les salons Nadcel avec le même compte."
      image="/images/register.jpg"
      quote="Prenez soin de vous, en toute simplicité."
    >
      <form onSubmit={handleSubmit} className={`${ui.surface} flex flex-col gap-5 rounded-3xl p-6 sm:p-8`}>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className={ui.label}>
            Nom complet
          </label>
          <input
            id="name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Awa Diop"
            className={ui.input}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className={ui.label}>
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            className={ui.input}
          />
        </div>

        <PasswordField
          id="password"
          label="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          hint={`${PASSWORD_MIN_LENGTH} caractères minimum. Une phrase courte est facile à retenir.`}
        />

        <PasswordField
          id="passwordConfirmation"
          label="Confirmer le mot de passe"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          autoComplete="new-password"
        />

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className={`${ui.buttonPrimary} mt-1 h-12 text-base`}>
          {loading ? "Création du compte..." : "Créer mon compte"}
        </button>

        <p className="text-xs leading-5 text-anthracite/70">
          En créant un compte, vous acceptez les{" "}
          <Link href="/cgu" className={ui.textLink}>
            conditions générales
          </Link>{" "}
          et la{" "}
          <Link href="/confidentialite" className={ui.textLink}>
            politique de confidentialité
          </Link>
          .
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-anthracite/75">
        Déjà un compte ?{" "}
        <Link href="/login" className={ui.textLink}>
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}

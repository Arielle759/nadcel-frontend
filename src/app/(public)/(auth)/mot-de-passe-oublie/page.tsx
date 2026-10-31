"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import { api } from "@/lib/api";
import { ui } from "@/lib/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer le lien pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Mot de passe oublié"
      intro="Indiquez l'e-mail de votre compte : nous vous envoyons un lien pour choisir un nouveau mot de passe."
      image="/images/services/login.jpg"
      quote="La beauté, simplement organisée."
    >
      {sent ? (
        <div role="status" className={`${ui.surface} flex flex-col gap-4 rounded-3xl p-6 sm:p-8`}>
          <p className="font-heading text-2xl font-semibold text-forest">Vérifiez votre boîte e-mail</p>
          <p className="leading-7 text-anthracite/80">
            Si un compte existe avec <strong className="text-forest">{email}</strong>, un lien vient d&apos;y être envoyé. Il est
            valable une heure. Pensez à regarder dans les courriers indésirables.
          </p>
          <div>
            <Link href="/login" className={ui.buttonPrimary}>
              Retour à la connexion
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={`${ui.surface} flex flex-col gap-5 rounded-3xl p-6 sm:p-8`}>
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
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} className={`${ui.buttonPrimary} h-12 text-base`}>
            {loading ? "Envoi..." : "Recevoir le lien"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-anthracite/75">
        Vous vous en souvenez ?{" "}
        <Link href="/login" className={ui.textLink}>
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}

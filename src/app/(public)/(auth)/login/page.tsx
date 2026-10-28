"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { homePathFor, login } from "@/lib/auth";
import { nextUrlForBookingDraft } from "@/lib/bookingDraft";
import PasswordField from "@/components/PasswordField";
import AuthShell from "@/components/AuthShell";
import { ui } from "@/lib/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { user } = await login({ email, password });
      // Le gérant et l'administrateur arrivent directement dans leur espace ;
      // le client reprend sa réservation en cours, ou revient à l'accueil.
      const home = homePathFor(user);
      router.replace(home === "/" ? nextUrlForBookingDraft(home) : home);
    } catch {
      setError("E-mail ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Bienvenue sur Nadcel"
      intro="Connectez-vous pour retrouver vos rendez-vous, ou l'espace de votre salon."
      image="/images/services/login.jpg"
      quote="La beauté, simplement organisée."
    >
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

        <PasswordField
          id="password"
          label="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className={`${ui.buttonPrimary} mt-1 h-12 text-base`}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-anthracite/75">
        Pas encore de compte ?{" "}
        <Link href="/register" className={ui.textLink}>
          Créer un compte
        </Link>
      </p>
    </AuthShell>
  );
}

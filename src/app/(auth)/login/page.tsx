"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { login } from "@/lib/auth";
import PasswordField from "@/components/PasswordField";

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
      await login({ email, password });
      router.push("/");
    } catch {
      setError("Identifiants invalides.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-gradient-to-br from-beige to-sage/20 px-4 py-12 sm:px-8">
        <div className="flex w-full max-w-sm flex-col gap-2 text-center">
          <h1 className="text-3xl font-semibold text-forest">Bienvenue sur Nadcel</h1>
          <p className="text-anthracite/75">
            Connectez-vous pour gérer vos rendez-vous et vos salons.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm flex flex-col gap-4 rounded-lg border border-sage/30 border-t-4 border-t-champagne bg-beige p-8"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-sage/40 px-3 py-2"
            />
          </div>

          <PasswordField
            id="password"
            label="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-dark-sage px-5 py-2 text-beige font-medium transition-colors hover:bg-sage disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <p className="text-center text-sm text-anthracite/75">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-link-sage hover:underline">
              Créer un compte
            </Link>
          </p>
        </form>
      </div>

      <div className="relative hidden w-full md:block md:w-1/2">
        <Image
          src="/images/services/login.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-8">
          <h2 className="text-3xl font-semibold text-beige">La beauté, simplifiée</h2>
          <p className="text-beige/90">
            Réservez en ligne dans les meilleurs salons du Sénégal, ou gérez votre
            établissement en toute simplicité.
          </p>
        </div>
      </div>
    </div>
  );
}

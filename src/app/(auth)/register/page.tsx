"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { register } from "@/lib/auth";
import PasswordField from "@/components/PasswordField";

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

    if (password !== passwordConfirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password });
      router.push("/");
    } catch {
      setError("Impossible de créer le compte. Vérifiez vos informations.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-gradient-to-br from-beige to-sage/20 px-4 py-12 sm:px-8">
        <div className="flex w-full max-w-sm flex-col gap-2 text-center">
          <h1 className="text-3xl font-semibold text-forest">Rejoignez Nadcel</h1>
          <p className="text-anthracite/75">
            Créez votre compte pour réserver en quelques clics dans les meilleurs salons.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm flex flex-col gap-4 rounded-lg border border-sage/30 border-t-4 border-t-champagne bg-beige p-8"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium">
              Nom
            </label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-sage/40 px-3 py-2"
            />
          </div>

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
            autoComplete="new-password"
          />

          <PasswordField
            id="passwordConfirmation"
            label="Confirmer le mot de passe"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            autoComplete="new-password"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-dark-sage px-5 py-2 text-beige font-medium transition-colors hover:bg-sage disabled:opacity-50"
          >
            {loading ? "Création du compte..." : "Créer mon compte"}
          </button>

          <p className="text-center text-sm text-anthracite/75">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-link-sage hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      </div>

      <div className="relative hidden w-full md:block md:w-1/2">
        <Image
          src="/images/register.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-8">
          <h2 className="text-3xl font-semibold text-beige">Rejoignez Nadcel</h2>
          <p className="text-beige/90">
            Créez votre compte en quelques secondes et accédez aux meilleurs salons de
            beauté du Sénégal.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { register } from "@/lib/auth";
import PasswordField from "@/components/PasswordField";
import { ArrowRight, CheckCircle2, Mail, Sparkles, UserRound } from "lucide-react";

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
    <div className="flex flex-1 flex-col bg-gradient-to-br from-beige via-beige to-sage/20 lg:flex-row">
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-14 sm:px-8 lg:py-20">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">Votre espace beauté</span>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-forest">Rejoignez Nadcel</h1>
            <p className="mt-3 leading-7 text-anthracite/70">
            Créez votre compte pour réserver en quelques clics dans les meilleurs salons.
            </p>
          </div>

        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-5 rounded-3xl border border-sage/20 bg-beige/90 p-6 shadow-[0_20px_55px_rgba(45,59,40,0.1)] sm:p-8"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-semibold text-anthracite/80">
              Nom
            </label>
            <div className="relative"><UserRound size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-link-sage" /><input id="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom complet" className="w-full rounded-xl border border-sage/35 bg-white/70 py-3 pl-11 pr-4 outline-none transition-all focus:border-dark-sage focus:bg-white focus:ring-4 focus:ring-sage/10" /></div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-anthracite/80">
              Email
            </label>
            <div className="relative"><Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-link-sage" /><input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" className="w-full rounded-xl border border-sage/35 bg-white/70 py-3 pl-11 pr-4 outline-none transition-all focus:border-dark-sage focus:bg-white focus:ring-4 focus:ring-sage/10" /></div>
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

          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 font-semibold text-beige shadow-md transition-all hover:-translate-y-0.5 hover:bg-dark-sage disabled:translate-y-0 disabled:opacity-50"
          >
            {loading ? "Création du compte..." : "Créer mon compte"}
            {!loading && <ArrowRight size={17} aria-hidden="true" />}
          </button>

          <p className="text-center text-sm text-anthracite/75">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-semibold text-link-sage hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
        </div>
      </div>

      <div className="relative hidden min-h-[780px] w-full overflow-hidden lg:block lg:w-[48%]">
        <Image
          src="/images/register.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/45 to-forest/10" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 p-10 xl:p-14">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-beige/20 bg-beige/10 px-4 py-2 text-sm text-beige backdrop-blur-sm"><Sparkles size={16} />Votre expérience commence ici</span>
          <h2 className="max-w-lg text-4xl font-semibold leading-tight text-beige">Prenez soin de vous, en toute simplicité.</h2>
          <div className="space-y-2 text-sm text-beige/80">
            <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-champagne" />Création de compte rapide</p>
            <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-champagne" />Réservations accessibles à tout moment</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { isAuthenticated, register } from "@/lib/auth";
import { useManager } from "@/hooks/useManager";
import { useHasMounted } from "@/hooks/useHasMounted";
import PasswordField from "@/components/PasswordField";

export default function BecomePartnerPage() {
  const router = useRouter();
  const mounted = useHasMounted();
  const alreadyAuthenticated = mounted && isAuthenticated();
  const { createSalon } = useManager();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [salonName, setSalonName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      if (!alreadyAuthenticated) {
        await register({ name, email, password, role: 'gerant' });
      }
      const salon = await createSalon({
        name: salonName,
        address,
        city,
        phone,
        description,
      });
      router.push(`/manager/dashboard?newSalon=${salon.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Impossible de créer le salon.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) {
    return (
      <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-beige to-sage/20 px-6 py-12">
        <p className="text-anthracite/75">Chargement...</p>
      </main>
    );
  }

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <main className="flex flex-1 flex-col items-center gap-8 bg-gradient-to-br from-beige to-sage/20 px-6 py-12 sm:px-16">
        <div className="flex max-w-xl flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-forest">
            Rejoignez les salons partenaires de NADCEL
          </h1>
          <p className="text-anthracite/75">
            Créez la fiche de votre salon en quelques minutes. Une fois soumise, elle sera
            examinée par notre équipe avant d&apos;être visible par les clients.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-xl flex-col gap-6 rounded-lg border border-sage/30 border-t-4 border-t-champagne bg-beige p-6"
        >
          {!alreadyAuthenticated && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-anthracite/75">
                Votre compte
              </h2>
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
            </div>
          )}

          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-anthracite/75">
              Votre salon
            </h2>
            <div className="flex flex-col gap-1">
              <label htmlFor="salonName" className="text-sm font-medium">
                Nom du salon
              </label>
              <input
                id="salonName"
                required
                value={salonName}
                onChange={(e) => setSalonName(e.target.value)}
                className="rounded-md border border-sage/40 px-3 py-2"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="address" className="text-sm font-medium">
                Adresse
              </label>
              <input
                id="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-md border border-sage/40 px-3 py-2"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="city" className="text-sm font-medium">
                Ville
              </label>
              <input
                id="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-md border border-sage/40 px-3 py-2"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="phone" className="text-sm font-medium">
                Téléphone
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-md border border-sage/40 px-3 py-2"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-md border border-sage/40 px-3 py-2"
              />
            </div>
          </div>

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-dark-sage px-5 py-2 font-medium text-beige transition-colors hover:bg-sage disabled:opacity-50"
          >
            {submitting ? "Envoi en cours..." : "Inscrire mon salon"}
          </button>
        </form>
      </main>

      <div className="hidden w-full flex-col items-center justify-start gap-6 bg-gradient-to-br from-beige to-sage/30 p-8 pt-16 md:flex md:w-1/2">
        <Image
          src="/images/logo-full.png"
          alt="Nadcel"
          width={640}
          height={640}
          className="h-auto w-full max-w-xs"
        />
        <div className="flex max-w-sm flex-col gap-2 text-center">
          <h2 className="text-2xl font-semibold text-forest">Nadcel</h2>
          <p className="text-lg text-anthracite/75">
            La plateforme de référence pour les salons de beauté et spas au Sénégal 
            visibilité, gestion simplifiée, clients satisfaits.
          </p>
        </div>
      </div>
    </div>
  );
}

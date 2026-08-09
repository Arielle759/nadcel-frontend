"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { isAuthenticated, register } from "@/lib/auth";
import { useManager } from "@/hooks/useManager";
import { useHasMounted } from "@/hooks/useHasMounted";
import PasswordField from "@/components/PasswordField";
import { ArrowRight, CheckCircle2, Mail, MapPin, Phone, Sparkles, Store, UserRound } from "lucide-react";

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
    <div className="flex flex-1 flex-col bg-gradient-to-br from-beige via-beige to-sage/20 lg:flex-row">
      <main className="flex flex-1 flex-col items-center px-5 py-8 sm:px-8 lg:px-10 lg:py-9">
        <div className="mb-5 w-full max-w-3xl text-center lg:text-left">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-terracotta"><Sparkles size={16} />Développez votre activité</span>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-forest sm:text-4xl">
            Rejoignez les salons partenaires Nadcel
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-anthracite/70">
            Créez la fiche de votre salon en quelques minutes. Une fois soumise, elle sera
            examinée par notre équipe avant d&apos;être visible par les clients.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-3xl flex-col gap-5 rounded-3xl border border-sage/20 bg-beige/90 p-5 shadow-[0_20px_55px_rgba(45,59,40,0.1)] sm:p-6"
        >
          {!alreadyAuthenticated && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-3 border-b border-sage/20 pb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest text-xs font-bold text-beige">1</span>
                <div><h2 className="font-semibold text-forest">Votre compte</h2><p className="text-xs text-anthracite/55">Vos informations de connexion</p></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="name" className="text-sm font-semibold text-anthracite/80">
                  Nom
                </label>
                <div className="relative"><UserRound size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-link-sage" /><input
                  id="name"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-sage/35 bg-white/70 py-2.5 pl-11 pr-4 outline-none transition-all focus:border-dark-sage focus:ring-4 focus:ring-sage/10"
                /></div>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-sm font-semibold text-anthracite/80">
                  Email
                </label>
                <div className="relative"><Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-link-sage" /><input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-sage/35 bg-white/70 py-2.5 pl-11 pr-4 outline-none transition-all focus:border-dark-sage focus:ring-4 focus:ring-sage/10"
                /></div>
              </div>
              <div className="sm:col-span-2">
              <PasswordField
                id="password"
                label="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              </div>
              </div>
            </section>
          )}

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-3 border-b border-sage/20 pb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-champagne text-xs font-bold text-forest">{alreadyAuthenticated ? "1" : "2"}</span>
              <div><h2 className="font-semibold text-forest">Votre salon</h2><p className="text-xs text-anthracite/55">Les informations visibles par vos futurs clients</p></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="salonName" className="text-sm font-semibold text-anthracite/80">
                Nom du salon
              </label>
              <div className="relative"><Store size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-link-sage" /><input
                id="salonName"
                required
                value={salonName}
                onChange={(e) => setSalonName(e.target.value)}
                className="w-full rounded-xl border border-sage/35 bg-white/70 py-2.5 pl-11 pr-4 outline-none transition-all focus:border-dark-sage focus:ring-4 focus:ring-sage/10"
              /></div>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="address" className="text-sm font-semibold text-anthracite/80">
                Adresse
              </label>
              <div className="relative"><MapPin size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-link-sage" /><input
                id="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-sage/35 bg-white/70 py-2.5 pl-11 pr-4 outline-none transition-all focus:border-dark-sage focus:ring-4 focus:ring-sage/10"
              /></div>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="city" className="text-sm font-semibold text-anthracite/80">
                Ville
              </label>
              <input
                id="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-sage/35 bg-white/70 px-4 py-2.5 outline-none transition-all focus:border-dark-sage focus:ring-4 focus:ring-sage/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="phone" className="text-sm font-semibold text-anthracite/80">
                Téléphone
              </label>
              <div className="relative"><Phone size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-link-sage" /><input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-sage/35 bg-white/70 py-2.5 pl-11 pr-4 outline-none transition-all focus:border-dark-sage focus:ring-4 focus:ring-sage/10"
              /></div>
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label htmlFor="description" className="text-sm font-semibold text-anthracite/80">
                Description
              </label>
              <textarea
                id="description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Présentez votre univers, vos spécialités et ce qui rend votre salon unique."
                className="resize-none rounded-xl border border-sage/35 bg-white/70 px-4 py-2.5 outline-none transition-all focus:border-dark-sage focus:ring-4 focus:ring-sage/10"
              />
            </div>
            </div>
          </section>

          {submitError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-2.5 font-semibold text-beige shadow-md transition-all hover:-translate-y-0.5 hover:bg-dark-sage disabled:translate-y-0 disabled:opacity-50"
          >
            {submitting ? "Envoi en cours..." : "Inscrire mon salon"}
            {!submitting && <ArrowRight size={18} aria-hidden="true" />}
          </button>
        </form>
      </main>

      <aside className="relative hidden min-h-[760px] w-full overflow-hidden bg-forest lg:sticky lg:top-[72px] lg:flex lg:h-[calc(100vh-72px)] lg:w-[40%] lg:flex-col lg:justify-end">
        <Image
          src="/images/services/coiffure.jpg"
          alt="Professionnelle dans un salon de beauté"
          fill
          priority
          sizes="40vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/55 to-forest/10" />
        <div className="relative p-9 xl:p-12">
          <Image src="/images/logo-icon.png" alt="" width={60} height={44} className="mb-6 h-11 w-auto brightness-0 invert" />
          <h2 className="text-3xl font-semibold text-beige">Faites rayonner votre savoir-faire.</h2>
          <p className="mt-3 leading-7 text-beige/65">Rejoignez une plateforme pensée pour simplifier votre quotidien et développer votre visibilité.</p>
          <div className="mt-6 space-y-3 text-sm text-beige/80">
            <p className="flex items-center gap-3"><CheckCircle2 size={18} className="text-champagne" />Une vitrine professionnelle en ligne</p>
            <p className="flex items-center gap-3"><CheckCircle2 size={18} className="text-champagne" />Une gestion centralisée des rendez-vous</p>
            <p className="flex items-center gap-3"><CheckCircle2 size={18} className="text-champagne" />Une présence auprès de nouveaux clients</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { hasRole, isAuthenticated, logout, register } from "@/lib/auth";
import { useManager } from "@/hooks/useManager";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useMySalons, type MySalon } from "@/hooks/useMySalons";
import PasswordField from "@/components/PasswordField";
import { ui } from "@/lib/ui";

const PASSWORD_MIN_LENGTH = 12;

const STEPS = [
  { title: "Vous envoyez votre demande", description: "Votre compte et les informations de votre salon, en quelques minutes." },
  { title: "Notre équipe la vérifie", description: "Sous 48 heures ouvrées. Nous pouvons vous appeler pour confirmer." },
  { title: "Vous ouvrez votre espace gérant", description: "Prestations, équipe, horaires : votre salon devient réservable." },
];

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function StatusCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-live="polite" className={`${ui.surface} rounded-3xl p-8 sm:p-10`}>
      <h2 className="font-heading text-3xl font-semibold text-forest">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 leading-7 text-anthracite/80">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  children,
  hint,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={ui.label}>
        {label}
      </label>
      {children}
      {hint && <p className="text-sm text-anthracite/70">{hint}</p>}
    </div>
  );
}

export default function BecomePartnerPage() {
  const router = useRouter();
  const mounted = useHasMounted();
  const authenticated = mounted && isAuthenticated();
  const { createSalon } = useManager();
  const { salons, loading: salonsLoading } = useMySalons(authenticated);

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
  const [submitted, setSubmitted] = useState<string | null>(null);

  const pending: MySalon | undefined = salons.find((s) => s.status === "pending");
  const verified = salons.find((s) => s.status === "verified");
  const rejected = salons.find((s) => s.status === "rejected");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!authenticated && password.length < PASSWORD_MIN_LENGTH) {
      setSubmitError(`Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`);
      return;
    }

    setSubmitting(true);
    try {
      if (!authenticated) {
        await register({ name, email, password });
      }
      await createSalon({ name: salonName, address, city, phone, description });
      setSubmitted(salonName);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Impossible d'envoyer la demande.");
    } finally {
      setSubmitting(false);
    }
  }

  function reconnect() {
    logout();
    router.push("/login");
  }

  let content: React.ReactNode;

  if (!mounted || salonsLoading) {
    content = <div className="h-96 animate-pulse rounded-3xl bg-sage/15" aria-busy="true" aria-label="Chargement" />;
  } else if (submitted) {
    content = (
      <StatusCard title="Demande envoyée">
        <p>
          Merci ! La demande pour <strong className="text-forest">{submitted}</strong> est entre les mains de notre équipe.
          Nous revenons vers vous sous 48 heures ouvrées.
        </p>
        <p className="text-sm text-anthracite/70">
          Vous pouvez suivre son état sur cette page. Dès la validation, votre espace gérant s&apos;ouvre.
        </p>
        <div>
          <Link href="/" className={ui.buttonPrimary}>
            Retour à l&apos;accueil
          </Link>
        </div>
      </StatusCard>
    );
  } else if (verified) {
    content = (
      <StatusCard title="Votre salon est partenaire">
        <p>
          <strong className="text-forest">{verified.name}</strong> est validé et visible par les clientes.
        </p>
        {hasRole("gerant") ? (
          <div>
            <Link href="/manager/dashboard" className={ui.buttonPrimary}>
              Ouvrir mon espace gérant
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-anthracite/70">
              Reconnectez-vous une fois pour activer votre accès gérant.
            </p>
            <div>
              <button type="button" onClick={reconnect} className={ui.buttonPrimary}>
                Me reconnecter
              </button>
            </div>
          </>
        )}
      </StatusCard>
    );
  } else if (pending) {
    content = (
      <StatusCard title="Demande en cours d'examen">
        <p>
          La demande pour <strong className="text-forest">{pending.name}</strong> ({pending.city}) a été envoyée le{" "}
          {formatDate(pending.created_at)}. Notre équipe la vérifie sous 48 heures ouvrées.
        </p>
        <p className="text-sm text-anthracite/70">
          Une seule demande peut être examinée à la fois. Pour toute question : contact@nadcel.sn
        </p>
      </StatusCard>
    );
  } else {
    content = (
      <form onSubmit={handleSubmit} className={`${ui.surface} flex flex-col gap-10 rounded-3xl p-6 sm:p-10`}>
        {rejected && (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            Votre précédente demande pour {rejected.name} n&apos;a pas été retenue. Vous pouvez en envoyer une nouvelle
            avec des informations complètes, ou nous écrire à contact@nadcel.sn.
          </p>
        )}

        {!authenticated && (
          <fieldset className="flex flex-col gap-5">
            <legend className="mb-5 font-heading text-2xl font-semibold text-forest">Votre compte</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="name" label="Nom complet">
                <input id="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={ui.input} />
              </Field>
              <Field id="email" label="E-mail">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={ui.input}
                />
              </Field>
            </div>
            <PasswordField
              id="password"
              label="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={PASSWORD_MIN_LENGTH}
              hint={`${PASSWORD_MIN_LENGTH} caractères minimum.`}
            />
            <p className="text-sm text-anthracite/70">
              Déjà un compte ?{" "}
              <Link href="/login" className={ui.textLink}>
                Connectez-vous
              </Link>{" "}
              puis revenez sur cette page.
            </p>
          </fieldset>
        )}

        <fieldset className="flex flex-col gap-5">
          <legend className="mb-5 font-heading text-2xl font-semibold text-forest">Votre salon</legend>
          <Field id="salonName" label="Nom du salon">
            <input id="salonName" required value={salonName} onChange={(e) => setSalonName(e.target.value)} className={ui.input} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
            <Field id="address" label="Adresse" hint="Rue et quartier, par exemple : 12 rue Carnot, Plateau">
              <input
                id="address"
                required
                autoComplete="street-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={ui.input}
              />
            </Field>
            <Field id="city" label="Ville">
              <input id="city" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dakar" className={ui.input} />
            </Field>
          </div>
          <Field id="phone" label="Téléphone du salon" hint="Utilisé par notre équipe pour vérifier votre demande.">
            <input
              id="phone"
              type="tel"
              required
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="77 123 45 67"
              className={ui.input}
            />
          </Field>
          <Field id="description" label="Présentation (facultatif)">
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Vos spécialités, l'ambiance du salon, ce que vos clientes apprécient."
              className={`${ui.input} h-auto py-3`}
            />
          </Field>
        </fieldset>

        {submitError && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {submitError}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button type="submit" disabled={submitting} className={`${ui.buttonPrimary} h-12 text-base sm:w-fit sm:px-8`}>
            {submitting ? "Envoi en cours..." : "Envoyer ma demande"}
          </button>
          <p className="text-xs leading-5 text-anthracite/70">
            Inscription gratuite. En envoyant cette demande, vous acceptez les{" "}
            <Link href="/cgu" className={ui.textLink}>
              conditions générales
            </Link>
            .
          </p>
        </div>
      </form>
    );
  }

  return (
    <main className="flex flex-1 flex-col px-6 pb-24 pt-12 sm:px-10">
      <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <h1 className="text-4xl font-semibold tracking-tight text-forest sm:text-[2.75rem] sm:leading-[1.1]">
            Inscrire mon salon
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-anthracite/75">
            Recevez des réservations en ligne et gérez votre agenda depuis un seul espace. L&apos;inscription est gratuite.
          </p>
          <div className="mt-10">{content}</div>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
          <div className="relative hidden aspect-[4/3] overflow-hidden rounded-3xl lg:block">
            <Image src="/images/services/coiffure.jpg" alt="" fill sizes="380px" className="object-cover" />
          </div>
          <div className={`${ui.surface} rounded-3xl p-6`}>
            <p className="font-heading text-xl font-semibold text-forest">Comment ça se passe</p>
            <ol className="mt-5 flex flex-col gap-5">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-beige font-semibold text-forest">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-anthracite">{step.title}</p>
                    <p className="mt-1 text-sm leading-6 text-anthracite/75">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </main>
  );
}

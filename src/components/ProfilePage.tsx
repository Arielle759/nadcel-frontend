"use client";

import { FormEvent, useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import ManagerPage from "@/components/manager/ManagerPage";
import PasswordField from "@/components/PasswordField";
import { ui } from "@/lib/ui";

const PASSWORD_MIN_LENGTH = 12;

type Feedback = { ok: boolean; text: string } | null;

function FeedbackLine({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <p role={feedback.ok ? "status" : "alert"} className={`text-sm font-medium ${feedback.ok ? "text-success" : "text-alert"}`}>
      {feedback.text}
    </p>
  );
}

// « Mon profil », commun aux trois espaces (cliente, gérant, administrateur).
export default function ProfilePage() {
  const { getProfile, updateProfile, changePassword } = useProfile();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoFeedback, setInfoFeedback] = useState<Feedback>(null);

  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);

  useEffect(() => {
    let active = true;
    getProfile()
      .then((user) => {
        if (!active) return;
        setEmail(user.email);
        setName(user.name);
        setPhone(user.phone ?? "");
      })
      .catch((err) => active && setLoadError(err instanceof Error ? err.message : "Chargement impossible."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [getProfile]);

  async function saveInfo(e: FormEvent) {
    e.preventDefault();
    setSavingInfo(true);
    setInfoFeedback(null);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() || null });
      setInfoFeedback({ ok: true, text: "Informations enregistrées." });
    } catch (err) {
      setInfoFeedback({ ok: false, text: err instanceof Error ? err.message : "Enregistrement impossible." });
    } finally {
      setSavingInfo(false);
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordFeedback(null);
    // Vérifications immédiates, avant d'appeler le serveur.
    if (password.length < PASSWORD_MIN_LENGTH) {
      setPasswordFeedback({ ok: false, text: `Le nouveau mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.` });
      return;
    }
    if (password !== confirmation) {
      setPasswordFeedback({ ok: false, text: "Les deux nouveaux mots de passe ne sont pas identiques." });
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({ current_password: current, password, password_confirmation: confirmation });
      setCurrent("");
      setPassword("");
      setConfirmation("");
      setPasswordFeedback({ ok: true, text: "Mot de passe modifié. Vos autres appareils ont été déconnectés." });
    } catch (err) {
      setPasswordFeedback({ ok: false, text: err instanceof Error ? err.message : "Modification impossible." });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <ManagerPage title="Mon profil" description="Vos informations personnelles et votre mot de passe." width="narrow">
      {loading ? (
        <div className="h-96 animate-pulse rounded-2xl bg-sable/15" aria-busy="true" aria-label="Chargement" />
      ) : loadError ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          <form onSubmit={saveInfo} className={`${ui.surface} flex flex-col gap-5 p-6 sm:p-8`}>
            <h2 className="text-2xl font-semibold text-brand">Informations</h2>
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className={ui.label}>
                Nom complet
              </label>
              <input id="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={ui.input} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className={ui.label}>
                  Téléphone (facultatif)
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="77 123 45 67"
                  className={ui.input}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className={ui.label}>E-mail</span>
                <p className="flex h-12 items-center px-1 text-anthracite/75">{email}</p>
              </div>
            </div>
            <p className="-mt-2 text-sm text-anthracite/65">
              L&apos;e-mail sert à vous connecter : il ne se modifie pas ici. Écrivez à contact@nadcel.sn si besoin.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" disabled={savingInfo} className={ui.buttonPrimary}>
                {savingInfo ? "Enregistrement..." : "Enregistrer"}
              </button>
              <FeedbackLine feedback={infoFeedback} />
            </div>
          </form>

          <form onSubmit={savePassword} className={`${ui.surface} flex flex-col gap-5 p-6 sm:p-8`}>
            <div>
              <h2 className="text-2xl font-semibold text-brand">Mot de passe</h2>
              <p className="mt-1 text-sm text-anthracite/70">
                Après le changement, vous restez connecté ici ; vos autres appareils devront se reconnecter.
              </p>
            </div>
            <PasswordField
              id="current_password"
              label="Mot de passe actuel"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
            />
            <div className="flex flex-col gap-2">
              <div className="grid gap-5 sm:grid-cols-2">
                <PasswordField
                  id="new_password"
                  label="Nouveau mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={PASSWORD_MIN_LENGTH}
                />
                <PasswordField
                  id="new_password_confirmation"
                  label="Confirmation"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <p className="text-sm text-anthracite/70">{PASSWORD_MIN_LENGTH} caractères minimum. Une phrase courte est facile à retenir.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" disabled={savingPassword} className={ui.buttonPrimary}>
                {savingPassword ? "Modification..." : "Changer le mot de passe"}
              </button>
              <FeedbackLine feedback={passwordFeedback} />
            </div>
          </form>
        </div>
      )}
    </ManagerPage>
  );
}

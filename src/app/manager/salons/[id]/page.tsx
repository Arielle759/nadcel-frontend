"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { api, assetUrl } from "@/lib/api";
import { useManager } from "@/hooks/useManager";
import type { SalonDetail } from "@/lib/salons";
import type { OpeningHours } from "@/lib/openingHours";
import ImageUploadInput from "@/components/ImageUploadInput";
import OpeningHoursEditor from "@/components/OpeningHoursEditor";
import ManagerPage from "@/components/manager/ManagerPage";
import SalonNav from "@/components/manager/SalonNav";
import ConfirmDelete from "@/components/ConfirmDelete";
import { ui } from "@/lib/ui";

export default function ManagerSalonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { updateSalon, updateOpeningHours, deleteSalon } = useManager();

  const [salon, setSalon] = useState<SalonDetail | null>(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [openingHours, setOpeningHours] = useState<OpeningHours | null>(null);

  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMessage, setInfoMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [savingHours, setSavingHours] = useState(false);
  const [hoursMessage, setHoursMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    api
      .get<SalonDetail>(`/salons/${id}`)
      .then(({ data }) => {
        if (!isMounted) return;
        setSalon(data);
        setName(data.name);
        setDescription(data.description ?? "");
        setAddress(data.address);
        setCity(data.city);
        setOpeningHours(data.opening_hours);
      })
      .catch(() => {
        if (isMounted) setFetchError("Impossible de charger le salon.");
      })
      .finally(() => {
        if (isMounted) setFetching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMessage(null);
    try {
      const updated = await updateSalon(id, { name, description, address, city, cover });
      setSalon(updated);
      setInfoMessage({ ok: true, text: "Fiche enregistrée." });
    } catch (err) {
      setInfoMessage({ ok: false, text: err instanceof Error ? err.message : "Enregistrement impossible." });
    } finally {
      setSavingInfo(false);
    }
  }

  async function handleSaveHours() {
    setSavingHours(true);
    setHoursMessage(null);
    try {
      const updated = await updateOpeningHours(id, openingHours);
      setSalon(updated);
      setHoursMessage({ ok: true, text: "Horaires enregistrés." });
    } catch (err) {
      setHoursMessage({ ok: false, text: err instanceof Error ? err.message : "Enregistrement impossible." });
    } finally {
      setSavingHours(false);
    }
  }

  async function handleDelete() {
    await deleteSalon(id);
    router.push("/manager/salons");
  }

  if (fetching) {
    return (
      <ManagerPage title="Chargement..." back={{ href: "/manager/salons", label: "Mes salons" }}>
        <div className="h-96 animate-pulse rounded-2xl bg-sage/15" />
      </ManagerPage>
    );
  }

  if (fetchError || !salon) {
    return (
      <ManagerPage title="Salon introuvable" back={{ href: "/manager/salons", label: "Mes salons" }}>
        <p className="text-sm text-red-700">{fetchError ?? "Ce salon n'existe pas ou ne vous appartient pas."}</p>
      </ManagerPage>
    );
  }

  return (
    <ManagerPage title={salon.name} back={{ href: "/manager/salons", label: "Mes salons" }}>
      <SalonNav salonId={id} current="details" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <form onSubmit={handleSubmit} className={`${ui.surface} flex flex-col gap-5 p-6 sm:p-8`}>
          <h2 className="font-heading text-2xl font-semibold text-forest">Fiche du salon</h2>

          <div className="flex flex-col gap-2">
            <label htmlFor="name" className={ui.label}>
              Nom
            </label>
            <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={ui.input} />
          </div>

          <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
            <div className="flex flex-col gap-2">
              <label htmlFor="address" className={ui.label}>
                Adresse
              </label>
              <input id="address" required value={address} onChange={(e) => setAddress(e.target.value)} className={ui.input} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="city" className={ui.label}>
                Ville
              </label>
              <input id="city" required value={city} onChange={(e) => setCity(e.target.value)} className={ui.input} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className={ui.label}>
              Présentation
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={ui.textarea}
            />
          </div>

          <ImageUploadInput label="Photo de couverture" currentImageUrl={assetUrl(salon.cover)} onChange={setCover} />

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button type="submit" disabled={savingInfo} className={ui.buttonPrimary}>
              {savingInfo ? "Enregistrement..." : "Enregistrer la fiche"}
            </button>
            {infoMessage && (
              <p role="status" className={`text-sm font-medium ${infoMessage.ok ? "text-forest" : "text-red-700"}`}>
                {infoMessage.text}
              </p>
            )}
          </div>
        </form>

        <div className="flex flex-col gap-6">
          <section className={`${ui.surface} flex flex-col gap-5 p-6 sm:p-8`} aria-labelledby="hours-title">
            <h2 id="hours-title" className="font-heading text-2xl font-semibold text-forest">
              Horaires d&apos;ouverture
            </h2>
            <OpeningHoursEditor value={openingHours} onChange={setOpeningHours} />
            <div className="flex flex-wrap items-center gap-4">
              <button type="button" onClick={handleSaveHours} disabled={savingHours} className={ui.buttonPrimary}>
                {savingHours ? "Enregistrement..." : "Enregistrer les horaires"}
              </button>
              {hoursMessage && (
                <p role="status" className={`text-sm font-medium ${hoursMessage.ok ? "text-forest" : "text-red-700"}`}>
                  {hoursMessage.text}
                </p>
              )}
            </div>
          </section>

          <section className={`${ui.surface} flex flex-col gap-3 p-6 sm:p-8`} aria-labelledby="danger-title">
            <h2 id="danger-title" className="text-base font-semibold text-anthracite">
              Retirer le salon de Nadcel
            </h2>
            <p className="text-sm leading-6 text-anthracite/75">
              Le salon disparaît des recherches et ne peut plus recevoir de réservations.
            </p>
            <div>
              <ConfirmDelete label="Supprimer ce salon" question="Supprimer définitivement ce salon ?" onConfirm={handleDelete} />
            </div>
          </section>
        </div>
      </div>
    </ManagerPage>
  );
}

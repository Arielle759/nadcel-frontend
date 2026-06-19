"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useManager } from "@/hooks/useManager";
import type { SalonDetail } from "@/lib/salons";

export default function ManagerSalonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { updateSalon, loading: saving, error: saveError } = useManager();

  const [salon, setSalon] = useState<SalonDetail | null>(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [adresse, setAdresse] = useState("");
  const [services, setServices] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchSalon() {
      try {
        const { data } = await api.get<SalonDetail>(`/salons/${id}`);
        if (!isMounted) return;
        setSalon(data);
        setNom(data.nom);
        setDescription(data.description);
        setAdresse(data.adresse);
        setServices(data.services.join(", "));
      } catch {
        if (isMounted) setFetchError("Impossible de charger le salon.");
      } finally {
        if (isMounted) setFetching(false);
      }
    }

    fetchSalon();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccess(false);
    try {
      const updated = await updateSalon(id, {
        nom,
        description,
        adresse,
        services: services
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setSalon(updated);
      setSuccess(true);
    } catch {
      // error state is exposed via useManager
    }
  }

  if (fetching) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-6 py-12 sm:px-16">
        <p className="text-zinc-600 dark:text-zinc-400">Chargement du salon...</p>
      </main>
    );
  }

  if (fetchError || !salon) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-6 py-12 sm:px-16">
        <p className="text-sm text-red-600">{fetchError ?? "Salon introuvable."}</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-12 sm:px-16">
      <button
        type="button"
        onClick={() => router.push("/manager/salons")}
        className="self-start text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Retour à mes salons
      </button>

      <h1 className="text-3xl font-semibold tracking-tight">{salon.nom}</h1>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-black/[.08] p-6 dark:border-white/[.145]"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="nom" className="text-sm font-medium">
            Nom
          </label>
          <input
            id="nom"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="rounded-md border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-black"
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
            className="rounded-md border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-black"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="adresse" className="text-sm font-medium">
            Adresse
          </label>
          <input
            id="adresse"
            required
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            className="rounded-md border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-black"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="services" className="text-sm font-medium">
            Services (séparés par des virgules)
          </label>
          <input
            id="services"
            required
            value={services}
            onChange={(e) => setServices(e.target.value)}
            className="rounded-md border border-black/[.08] px-3 py-2 dark:border-white/[.145] dark:bg-black"
          />
        </div>

        {saveError && <p className="text-sm text-red-600">{saveError}</p>}
        {success && <p className="text-sm text-green-600">Salon mis à jour !</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-full bg-foreground px-5 py-2 font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </main>
  );
}

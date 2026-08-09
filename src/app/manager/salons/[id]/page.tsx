"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { api, assetUrl } from "@/lib/api";
import { useManager } from "@/hooks/useManager";
import type { SalonDetail } from "@/lib/salons";
import ImageUploadInput from "@/components/ImageUploadInput";

export default function ManagerSalonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { updateSalon, loading: saving, error: saveError } = useManager();

  const [salon, setSalon] = useState<SalonDetail | null>(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchSalon() {
      try {
        const { data } = await api.get<SalonDetail>(`/salons/${id}`);
        if (!isMounted) return;
        setSalon(data);
        setName(data.name);
        setDescription(data.description);
        setAddress(data.address);
        setCity(data.city);
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
        name,
        description,
        address,
        city,
        cover,
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
        <p className="text-anthracite/75">Chargement du salon...</p>
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
        className="self-start text-sm text-link-sage hover:underline"
      >
        ← Retour à mes salons
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-forest">{salon.name}</h1>
        <div className="flex gap-2">
          <Link
            href={`/manager/salons/${id}/services`}
            className="rounded-full border border-dark-sage px-5 py-2 text-sm font-medium text-link-sage transition-colors hover:bg-sage/10"
          >
            Gérer services
          </Link>
          <Link
            href={`/manager/salons/${id}/employees`}
            className="rounded-full border border-dark-sage px-5 py-2 text-sm font-medium text-link-sage transition-colors hover:bg-sage/10"
          >
            Gérer employés
          </Link>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-sage/30 bg-beige p-6"
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

        <ImageUploadInput
          label="Photo de couverture (optionnel)"
          currentImageUrl={assetUrl(salon.cover)}
          onChange={setCover}
        />

        {saveError && <p className="text-sm text-red-600">{saveError}</p>}
        {success && <p className="text-sm text-green-600">Salon mis à jour !</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-full bg-dark-sage px-5 py-2 font-medium text-beige transition-colors hover:bg-sage disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </main>
  );
}

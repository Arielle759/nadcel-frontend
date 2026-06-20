"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useServices } from "@/hooks/useServices";

export default function EditServicePage() {
  const { id, serviceId } = useParams<{ id: string; serviceId: string }>();
  const router = useRouter();
  const { getServices, updateService, loading: saving, error: saveError } = useServices();

  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [duree, setDuree] = useState("");
  const [categorie, setCategorie] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getServices(id)
      .then((services) => {
        if (!isMounted) return;
        const service = services.find((s) => String(s.id) === serviceId);
        if (!service) {
          setFetchError("Service introuvable.");
          return;
        }
        setNom(service.name);
        setDescription(service.description);
        setPrix(String(service.price));
        setDuree(String(service.duration));
        setCategorie(service.category);
      })
      .catch(() => {
        if (isMounted) setFetchError("Impossible de charger le service.");
      })
      .finally(() => {
        if (isMounted) setFetching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [getServices, id, serviceId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccess(false);
    try {
      await updateService(serviceId, {
        name: nom,
        description,
        price: Number(prix),
        duration: Number(duree),
        category: categorie,
      });
      setSuccess(true);
    } catch {
      // error state is exposed via useServices
    }
  }

  if (fetching) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-6 py-12 sm:px-16">
        <p className="text-anthracite/70">Chargement du service...</p>
      </main>
    );
  }

  if (fetchError) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-6 py-12 sm:px-16">
        <p className="text-sm text-red-600">{fetchError}</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-12 sm:px-16">
      <button
        type="button"
        onClick={() => router.push(`/manager/salons/${id}/services`)}
        className="self-start text-sm text-dark-sage hover:underline"
      >
        ← Retour aux services
      </button>

      <h1 className="text-3xl font-semibold tracking-tight">Modifier le service</h1>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-sage/30 bg-beige p-6"
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
          <label htmlFor="prix" className="text-sm font-medium">
            Prix (€)
          </label>
          <input
            id="prix"
            type="number"
            min="0"
            step="0.01"
            required
            value={prix}
            onChange={(e) => setPrix(e.target.value)}
            className="rounded-md border border-sage/40 px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="duree" className="text-sm font-medium">
            Durée (min)
          </label>
          <input
            id="duree"
            type="number"
            min="0"
            step="1"
            required
            value={duree}
            onChange={(e) => setDuree(e.target.value)}
            className="rounded-md border border-sage/40 px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="categorie" className="text-sm font-medium">
            Catégorie
          </label>
          <input
            id="categorie"
            required
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            className="rounded-md border border-sage/40 px-3 py-2"
          />
        </div>

        {saveError && <p className="text-sm text-red-600">{saveError}</p>}
        {success && <p className="text-sm text-green-600">Service mis à jour !</p>}

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

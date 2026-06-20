"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useServices } from "@/hooks/useServices";

export default function NewServicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { createService, loading, error } = useServices();

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [duree, setDuree] = useState("");
  const [categorie, setCategorie] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await createService({
        salon_id: Number(id),
        name: nom,
        description,
        price: Number(prix),
        duration: Number(duree),
        category: categorie,
      });
      router.push(`/manager/salons/${id}/services`);
    } catch {
      // error state is exposed via useServices
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-12 sm:px-16">
      <h1 className="text-3xl font-semibold tracking-tight">Ajouter un service</h1>

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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-dark-sage px-5 py-2 font-medium text-beige transition-colors hover:bg-sage disabled:opacity-50"
        >
          {loading ? "Création..." : "Ajouter"}
        </button>
      </form>
    </main>
  );
}

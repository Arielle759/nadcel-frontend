"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useEmployees } from "@/hooks/useEmployees";

export default function NewEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { createEmployee, loading, error } = useEmployees();

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await createEmployee({
        salon_id: Number(id),
        name: nom,
        phone: telephone,
        email,
      });
      router.push(`/manager/salons/${id}/employees`);
    } catch {
      // error state is exposed via useEmployees
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-12 sm:px-16">
      <h1 className="text-3xl font-semibold tracking-tight text-forest">Ajouter un employé</h1>

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
          <label htmlFor="telephone" className="text-sm font-medium">
            Téléphone
          </label>
          <input
            id="telephone"
            type="tel"
            required
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
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

        <p className="text-sm text-anthracite/75">
          Les services réalisables par cet employé pourront être associés séparément après sa
          création.
        </p>

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

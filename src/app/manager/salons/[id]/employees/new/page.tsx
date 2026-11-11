"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import ManagerPage from "@/components/manager/ManagerPage";
import { ui } from "@/lib/ui";

export default function NewEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { createEmployee, loading, error } = useEmployees();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const employee = await createEmployee({ salon_id: Number(id), name, phone });
      // Étape suivante immédiate : choisir les prestations qu'il réalise.
      router.push(`/manager/salons/${id}/employees/${employee.id}?nouveau=1`);
    } catch {
      // message exposé par useEmployees
    }
  }

  return (
    <ManagerPage
      title="Nouveau membre de l'équipe"
      description="Vous choisirez ensuite les services qu'il ou elle réalise."
      back={{ href: `/manager/salons/${id}/employees`, label: "Équipe" }}
      width="narrow"
    >
      <form onSubmit={handleSubmit} className={`${ui.surface} flex flex-col gap-5 p-6 sm:p-8`}>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className={ui.label}>
            Nom complet
          </label>
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={ui.input} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className={ui.label}>
            Téléphone
          </label>
          <input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="77 123 45 67" className={ui.input} />
          <p className="text-sm text-anthracite/70">Les membres de l&apos;équipe n&apos;ont pas de compte : c&apos;est vous qui organisez leur planning.</p>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="pt-2">
          <button type="submit" disabled={loading} className={ui.buttonPrimary}>
            {loading ? "Ajout..." : "Continuer"}
          </button>
        </div>
      </form>
    </ManagerPage>
  );
}

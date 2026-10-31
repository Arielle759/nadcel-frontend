"use client";

import { useParams, useRouter } from "next/navigation";
import { useServices } from "@/hooks/useServices";
import ManagerPage from "@/components/manager/ManagerPage";
import ServiceForm from "@/components/manager/ServiceForm";

export default function NewServicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { createService } = useServices();

  return (
    <ManagerPage
      title="Nouvelle prestation"
      description="Elle sera réservable dès qu'au moins un membre de l'équipe la réalise."
      back={{ href: `/manager/salons/${id}/services`, label: "Prestations" }}
      width="narrow"
    >
      <ServiceForm
        submitLabel="Ajouter la prestation"
        onSubmit={async (values) => {
          await createService({ salon_id: Number(id), ...values });
          router.push(`/manager/salons/${id}/services`);
        }}
      />
    </ManagerPage>
  );
}

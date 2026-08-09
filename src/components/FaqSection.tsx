"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "Qu'est-ce que NADCEL ?",
    answer:
      "NADCEL est une plateforme multi-salons qui connecte les clientes et clients aux salons de beauté et spas au Sénégal. Elle réunit plusieurs salons partenaires au même endroit : vous parcourez leurs services et réservez un rendez-vous en quelques clics, sans avoir à appeler chaque salon individuellement.",
  },
  {
    question: "Comment réserver un rendez-vous ?",
    answer:
      "Parcourez les salons partenaires, choisissez un service, puis sélectionnez une date et un créneau disponibles dans le calendrier du salon. Votre demande de rendez-vous est alors envoyée au salon, qui la confirme de son côté. Il vous suffit d'un compte NADCEL pour finaliser la réservation.",
  },
  {
    question: "Dois-je payer en ligne ?",
    answer:
      "Non. NADCEL ne collecte aucun paiement en ligne : le règlement se fait directement au salon, en espèces ou par carte, au moment de votre prestation.",
  },
  {
    question: "Comment annuler ou modifier une réservation ?",
    answer:
      "Vous pouvez annuler une réservation en attente ou confirmée depuis votre espace « Mes réservations », tant qu'il reste plus de 24h avant le rendez-vous. Pour changer de service, de date ou d'horaire, annulez la réservation existante puis reprenez rendez-vous, ou contactez directement le salon.",
  },
  {
    question: "Comment devenir salon partenaire sur NADCEL ?",
    answer:
      "Rendez-vous sur la page « Inscrire mon salon » et renseignez les informations de votre établissement (nom, adresse, ville, description) ainsi que votre compte gérant. Votre fiche est ensuite examinée par notre équipe avant d'être visible par les clients.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="border-t border-sage/20 px-6 py-16 sm:px-16">
      <h2 className="mb-8 text-center text-3xl font-semibold tracking-tight text-forest">
        Questions fréquentes
      </h2>
      <div className="mx-auto flex max-w-2xl flex-col gap-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.question}
              className={`overflow-hidden rounded-lg border bg-beige transition-colors ${
                isOpen ? "border-sage/30 border-t-4 border-t-champagne" : "border-sage/30"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-medium text-anthracite">{item.question}</span>
                <ChevronDown
                  size={20}
                  className={`shrink-0 text-dark-sage transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-sm text-anthracite/75">{item.answer}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ui } from "@/lib/ui";

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
      "Non. NADCEL ne collecte aucun paiement en ligne : le règlement se fait directement au salon, en espèces, par Wave ou par Orange Money, une fois la prestation faite.",
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
    <section className="px-6 pt-28 sm:px-10">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className={ui.sectionTitle}>Questions fréquentes</h2>
          <p className="mt-4 max-w-md leading-7 text-anthracite/70">Tout ce qu&apos;il faut savoir pour réserver sereinement ou rejoindre Nadcel en tant que salon.</p>
          <a href="mailto:contact@nadcel.sn" className="mt-7 inline-flex items-center gap-2 min-h-11 rounded-full bg-white px-5 text-sm font-semibold text-forest shadow-[0_1px_2px_rgba(45,59,40,0.05),0_8px_24px_rgba(45,59,40,0.07)] transition-shadow hover:shadow-[0_2px_6px_rgba(45,59,40,0.06),0_12px_28px_rgba(45,59,40,0.12)]">Nous contacter</a>
        </div>
        <div className="flex flex-col gap-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.question}
              className={`overflow-hidden rounded-2xl bg-white transition-shadow duration-200 ${
                isOpen
                  ? "shadow-[0_2px_6px_rgba(45,59,40,0.06),0_16px_36px_rgba(45,59,40,0.11)]"
                  : "shadow-[0_1px_2px_rgba(45,59,40,0.05),0_8px_24px_rgba(45,59,40,0.06)] hover:shadow-[0_2px_6px_rgba(45,59,40,0.06),0_12px_30px_rgba(45,59,40,0.09)]"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
              >
                <span className="font-semibold text-forest">{item.question}</span>
                <ChevronDown
                  size={20}
                  className={`shrink-0 text-forest/60 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-sm leading-7 text-anthracite/80 sm:px-6">{item.answer}</div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}

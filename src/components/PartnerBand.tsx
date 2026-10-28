import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import { ui } from "@/lib/ui";

const BENEFITS = [
  {
    title: "Un agenda qui se remplit seul",
    description: "Vos clientes réservent jour et nuit sur les créneaux que vous ouvrez, sans appel manqué.",
  },
  {
    title: "Moins de rendez-vous oubliés",
    description: "Un rappel part automatiquement la veille. Vous confirmez ou refusez chaque demande.",
  },
  {
    title: "Votre activité en clair",
    description: "Chiffre d'affaires encaissé, prestations les plus demandées et prévisions du mois prochain.",
  },
];

export default function PartnerBand() {
  return (
    <section aria-labelledby="partner-title" className="mt-28 bg-forest px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="mb-5 text-sm font-semibold text-champagne-light">Pour les professionnels</p>
        <SectionHeading
          id="partner-title"
          title="Gérez vos rendez-vous."
          muted="Remplissez vos créneaux."
          description="L'inscription est gratuite. Votre fiche est vérifiée par notre équipe avant sa mise en ligne, sous 48 heures ouvrées."
          onDark
        />
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/devenir-partenaire" className={`${ui.buttonOnDark} h-12 px-7`}>
            Inscrire mon salon
          </Link>
          <Link href="/login" className={`${ui.buttonGhostOnDark} h-12 px-7`}>
            Déjà partenaire ? Se connecter
          </Link>
        </div>

        <ul className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {BENEFITS.map(({ title, description }) => (
            <li key={title} className="rounded-2xl bg-beige/[0.06] p-7 ring-1 ring-inset ring-beige/10">
              <h3 className="text-lg font-semibold text-beige">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-beige/75">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

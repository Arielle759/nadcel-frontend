import SectionHeading from "@/components/SectionHeading";
import { ui } from "@/lib/ui";

const STEPS = [
  {
    number: "01",
    title: "Choisissez une prestation",
    description: "Prix et durée sont affichés avant de réserver. Pas de surprise une fois au salon.",
  },
  {
    number: "02",
    title: "Prenez un créneau libre",
    description: "Seuls les horaires encore disponibles vous sont proposés, selon les heures d'ouverture du salon.",
  },
  {
    number: "03",
    title: "Réglez sur place",
    description: "En espèces, par Wave ou Orange Money, une fois la prestation faite. Un rappel vous est envoyé la veille.",
  },
];

export default function FeaturesSection() {
  return (
    <section aria-labelledby="how-it-works" className="px-6 pt-28 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="how-it-works"
          title="Votre rendez-vous,"
          muted="sans passer un appel."
          description="Trois étapes depuis votre téléphone. Le salon confirme ensuite votre rendez-vous, et vous le retrouvez dans votre espace."
        />

        <ol className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {STEPS.map(({ number, title, description }) => (
            <li key={number} className={`${ui.surface} p-7`}>
              <span className="font-heading text-3xl font-semibold text-champagne" aria-hidden="true">
                {number}
              </span>
              <h3 className="mt-5 text-xl font-semibold text-forest">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-anthracite/75">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

import { ui } from "@/lib/ui";

const STEPS = [
  {
    number: "1",
    title: "Choisissez une prestation",
    description: "Prix et durée sont affichés avant de réserver. Pas de surprise une fois au salon.",
  },
  {
    number: "2",
    title: "Prenez un créneau libre",
    description: "Seuls les horaires encore disponibles vous sont proposés, selon les heures d'ouverture du salon.",
  },
  {
    number: "3",
    title: "Réglez sur place",
    description: "En espèces, par Wave ou Orange Money, une fois la prestation faite. Un rappel vous est envoyé la veille.",
  },
];

export default function FeaturesSection() {
  return (
    <section aria-labelledby="how-it-works" className="px-6 pb-20 pt-24 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 id="how-it-works" className={ui.sectionTitle}>
            Votre rendez-vous, sans passer un appel
          </h2>
          <p className="mt-4 leading-7 text-anthracite/75">
            Trois étapes depuis votre téléphone. Le salon confirme ensuite votre rendez-vous, et vous le retrouvez dans votre espace.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {STEPS.map(({ number, title, description }) => (
            <li key={number} className="border-t border-forest/20 pt-6">
              <span className="font-heading text-4xl font-semibold text-champagne" aria-hidden="true">
                {number}
              </span>
              <h3 className="mt-3 text-xl font-semibold text-forest">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-anthracite/75">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

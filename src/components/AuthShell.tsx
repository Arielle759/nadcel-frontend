import Image from "next/image";
import Link from "next/link";

// Ce que la cliente gagne à créer un compte : rappelé à côté du formulaire
// pour que la photo porte aussi de l'information, pas seulement un décor.
const BENEFITS = [
  { title: "Réservez à toute heure", text: "Les créneaux libres des salons, en temps réel." },
  { title: "Payez au salon", text: "Espèces, Wave ou Orange Money. Aucun frais de réservation." },
  { title: "Un rappel la veille", text: "Pour ne plus oublier un rendez-vous." },
];

// Mise en page commune connexion / inscription / mot de passe.
// - Ordinateur : l'écran est rempli exactement (fenêtre moins la barre de
//   navigation), formulaire centré à gauche, photo et avantages à droite.
// - Mobile : un bandeau photo compact avec la phrase d'accroche, puis le
//   formulaire ; pas de grand vide, pas de photo qui repousse le formulaire.
export default function AuthShell({
  title,
  intro,
  image,
  quote,
  children,
  below,
}: {
  title: string;
  intro: string;
  image: string;
  quote: string;
  children: React.ReactNode;
  // Bloc facultatif sous le formulaire (ex. « Vous gérez un salon ? »).
  below?: React.ReactNode;
}) {
  return (
    <div className="grid flex-1 lg:min-h-svh lg:grid-cols-2">
      <div className="flex flex-col px-5 pb-12 pt-5 sm:px-10 lg:pb-10 lg:pt-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Nadcel, retour à l'accueil">
            <Image src="/images/logo-icon.png" alt="" width={55} height={40} className="h-9 w-auto" />
            <span className="font-heading text-2xl font-semibold tracking-tight text-brand">Nadcel</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-anthracite/70 transition-colors hover:text-brand">
            Retour à l&apos;accueil
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center pt-8 lg:pt-0">
          <div className="relative mb-7 h-36 overflow-hidden rounded-3xl lg:hidden">
            <Image src={image} alt="" fill priority sizes="100vw" className="object-cover object-[center_30%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-cacao/85 via-cacao/30 to-transparent" aria-hidden="true" />
            <p className="absolute inset-x-0 bottom-0 p-5 font-heading text-xl font-semibold leading-tight text-beige">{quote}</p>
          </div>

          <h1 className="text-[2.1rem] font-semibold leading-[1.1] tracking-tight text-brand sm:text-[2.6rem]">{title}</h1>
          <p className="mt-3 leading-7 text-anthracite/75">{intro}</p>
          <div className="mt-7">{children}</div>
          {below && <div className="mt-5">{below}</div>}
        </div>
      </div>

      <div className="relative m-3 hidden overflow-hidden rounded-[2rem] lg:block">
        <Image src={image} alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-cacao/95 via-cacao/40 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 p-10 xl:p-12">
          <p className="max-w-md font-heading text-[2rem] font-semibold leading-tight text-beige">{quote}</p>
          <ul className="mt-8 grid gap-3 xl:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <li key={benefit.title} className="rounded-2xl bg-beige/10 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold text-beige">{benefit.title}</p>
                <p className="mt-1 text-sm leading-5 text-beige/75">{benefit.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

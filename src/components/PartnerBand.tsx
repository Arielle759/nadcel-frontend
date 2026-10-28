import Link from "next/link";
import { ui } from "@/lib/ui";

export default function PartnerBand() {
  return (
    <section aria-labelledby="partner-title" className="px-6 pb-20 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 rounded-3xl bg-forest px-8 py-12 text-beige sm:px-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 id="partner-title" className="text-3xl font-semibold tracking-tight text-beige sm:text-4xl">
            Vous gérez un salon ?
          </h2>
          <p className="mt-3 leading-7 text-beige/80">
            Recevez des réservations en ligne, suivez votre agenda et votre chiffre d&apos;affaires au même endroit.
            L&apos;inscription est gratuite et votre fiche est vérifiée par notre équipe avant sa mise en ligne.
          </p>
        </div>
        <Link href="/devenir-partenaire" className={`${ui.buttonOnDark} shrink-0 px-7`}>
          Inscrire mon salon
        </Link>
      </div>
    </section>
  );
}

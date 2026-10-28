import Link from "next/link";
import Image from "next/image";

const SERVICE_CATEGORIES = ["Coiffure", "Coloration", "Manucure", "Massage", "Soin", "Épilation"];
const CITIES = ["Dakar", "Thiès", "Saint-Louis", "Mbour"];

export default function Footer() {
  return (
    <footer className="bg-[#243020] px-6 pb-8 pt-16 text-beige sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex max-w-sm flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-beige/10"><Image src="/images/logo-icon.png" alt="" width={46} height={34} className="h-9 w-auto" /></span>
              <span className="font-heading text-2xl font-semibold">Nadcel</span>
            </Link>
            <p className="text-sm leading-6 text-beige/75">La plateforme qui rapproche les professionnels de la beauté et leurs clients partout au Sénégal.</p>
            <div className="flex flex-col gap-2 text-sm text-beige/75">
              <a href="mailto:contact@nadcel.sn" className="hover:text-beige">contact@nadcel.sn</a>
              <span>Dakar, Sénégal</span>
            </div>
          </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-beige">
            Navigation
          </span>
          <nav className="flex flex-col gap-2.5 text-sm text-beige/75">
            <Link href="/" className="hover:text-beige">
              Accueil
            </Link>
            <Link href="/salons" className="hover:text-beige">
              Salons
            </Link>
            <Link href="/devenir-partenaire" className="hover:text-beige">
              Inscrire mon salon
            </Link>
            <Link href="/a-propos" className="hover:text-beige">Qui sommes-nous</Link>
            <Link href="/cgu" className="hover:text-beige">Conditions générales</Link>
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-beige">Prestations</span>
          <nav className="flex flex-col gap-2.5 text-sm text-beige/75">
            {SERVICE_CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/salons?q=${encodeURIComponent(category)}`}
                className="hover:text-beige"
              >
                {category}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-beige">Villes populaires</span>
          <nav className="flex flex-col gap-2.5 text-sm text-beige/75">
            {CITIES.map((city) => (
              <Link key={city} href={`/salons?q=${encodeURIComponent(city)}`} className="hover:text-beige">
                Salons à {city}
              </Link>
            ))}
          </nav>
        </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-3 text-xs text-beige/60 sm:flex-row">
          <p>© 2026 Nadcel. Tous droits réservés.</p>
          <Link href="/confidentialite" className="hover:text-beige">Politique de confidentialité</Link>
        </div>
      </div>
    </footer>
  );
}

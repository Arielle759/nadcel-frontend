import Link from "next/link";

const SERVICE_CATEGORIES = ["Coiffure", "Coloration", "Manucure", "Massage", "Soin", "Épilation"];
const CITIES = ["Dakar", "Thiès", "Saint-Louis", "Mbour"];

export default function Footer() {
  return (
    <footer className="bg-forest px-6 py-10 text-beige sm:px-16">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <span className="font-heading text-xl font-semibold">Nadcel</span>
          <p className="text-sm text-beige/70">
            Plateforme de réservation pour salons de beauté et spas au Sénégal.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-beige/50">
            Navigation
          </span>
          <nav className="flex flex-col gap-2 text-sm text-beige/80">
            <Link href="/" className="hover:text-beige">
              Accueil
            </Link>
            <Link href="/salons" className="hover:text-beige">
              Salons
            </Link>
            <Link href="/devenir-partenaire" className="hover:text-beige">
              Inscrire mon salon
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-beige/50">
            Contact
          </span>
          <div className="flex flex-col gap-2 text-sm text-beige/80">
            <a href="mailto:contact@nadcel.sn" className="hover:text-beige">
              contact@nadcel.sn
            </a>
            <span>Dakar, Sénégal</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-beige/50">
            À propos de NADCEL
          </span>
          <nav className="flex flex-col gap-2 text-sm text-beige/80">
            <Link href="/a-propos" className="hover:text-beige">
              Qui sommes-nous
            </Link>
            <Link href="/devenir-partenaire" className="hover:text-beige">
              Vous êtes un salon ?
            </Link>
            <Link href="/cgu" className="hover:text-beige">
              CGU
            </Link>
            <Link href="/confidentialite" className="hover:text-beige">
              Politique de confidentialité
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-beige/50">
            Trouvez votre prestation
          </span>
          <nav className="flex flex-col gap-2 text-sm text-beige/80">
            {SERVICE_CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/?q=${encodeURIComponent(category)}`}
                className="hover:text-beige"
              >
                {category}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-beige/50">
            Recherches fréquentes
          </span>
          <nav className="flex flex-col gap-2 text-sm text-beige/80">
            {CITIES.map((city) => (
              <Link key={city} href={`/?q=${encodeURIComponent(city)}`} className="hover:text-beige">
                Salons à {city}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="mt-8 border-t border-beige/20 pt-4">
        <p className="text-xs text-beige/40">© 2026 Nadcel. Tous droits réservés.</p>
      </div>
    </footer>
  );
}

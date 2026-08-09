import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mail, MapPin, Sparkles } from "lucide-react";

const SERVICE_CATEGORIES = ["Coiffure", "Coloration", "Manucure", "Massage", "Soin", "Épilation"];
const CITIES = ["Dakar", "Thiès", "Saint-Louis", "Mbour"];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-forest to-[#1d291a] px-6 pb-8 pt-16 text-beige sm:px-10 lg:px-16">
      <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-sage/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col justify-between gap-6 rounded-3xl border border-beige/10 bg-beige/5 p-6 backdrop-blur-sm sm:p-8 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-champagne"><Sparkles size={16} />Votre prochain rendez-vous</span>
            <h2 className="mt-3 text-2xl font-semibold text-beige sm:text-3xl">Prenez du temps pour vous.</h2>
            <p className="mt-2 text-sm leading-6 text-beige/65">Explorez les salons partenaires et trouvez la prestation qui vous ressemble.</p>
          </div>
          <Link href="/salons" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-champagne px-6 py-3 font-semibold text-forest transition-all hover:-translate-y-0.5 hover:bg-beige">Découvrir les salons<ArrowRight size={18} /></Link>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex max-w-sm flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-beige/10"><Image src="/images/logo-icon.png" alt="" width={46} height={34} className="h-9 w-auto" /></span>
              <span className="font-heading text-2xl font-semibold">Nadcel</span>
            </Link>
            <p className="text-sm leading-6 text-beige/65">La plateforme qui rapproche les professionnels de la beauté et leurs clients partout au Sénégal.</p>
            <div className="flex flex-col gap-2 text-sm text-beige/70">
              <a href="mailto:contact@nadcel.sn" className="inline-flex items-center gap-2 hover:text-beige"><Mail size={15} />contact@nadcel.sn</a>
              <span className="inline-flex items-center gap-2"><MapPin size={15} />Dakar, Sénégal</span>
            </div>
          </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-champagne">
            Navigation
          </span>
          <nav className="flex flex-col gap-2.5 text-sm text-beige/70">
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
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-champagne">Prestations</span>
          <nav className="flex flex-col gap-2.5 text-sm text-beige/70">
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

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-champagne">Villes populaires</span>
          <nav className="flex flex-col gap-2.5 text-sm text-beige/70">
            {CITIES.map((city) => (
              <Link key={city} href={`/?q=${encodeURIComponent(city)}`} className="hover:text-beige">
                Salons à {city}
              </Link>
            ))}
          </nav>
        </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-beige/10 pt-6 text-xs text-beige/45 sm:flex-row">
          <p>© 2026 Nadcel. Tous droits réservés.</p>
          <Link href="/confidentialite" className="hover:text-beige">Politique de confidentialité</Link>
        </div>
      </div>
    </footer>
  );
}

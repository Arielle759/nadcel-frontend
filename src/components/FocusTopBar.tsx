import Image from "next/image";
import Link from "next/link";

// Haut des pages « tunnel » (connexion, inscription, Inscrire mon salon,
// réservation) : pas de navigation complète, seulement le logo et une sortie
// (l'accueil par défaut, ou la page d'où l'on vient).
export default function FocusTopBar({ backHref = "/", backLabel = "Retour à l'accueil" }: { backHref?: string; backLabel?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Link href="/" className="flex items-center gap-2.5" aria-label="Nadcel, retour à l'accueil">
        <Image src="/images/logo-icon.png" alt="" width={55} height={40} className="h-9 w-auto" />
        <span className="font-heading text-2xl font-semibold tracking-tight text-brand">Nadcel</span>
      </Link>
      <Link href={backHref} className="text-sm font-semibold text-anthracite/70 transition-colors hover:text-brand">
        {backLabel}
      </Link>
    </div>
  );
}

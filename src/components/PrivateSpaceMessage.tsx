"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { logout } from "@/lib/auth";

interface PrivateSpaceMessageProps {
  message: string;
  title?: string;
  icon?: LucideIcon;
  // Affiche « Se déconnecter » : utile quand l'utilisateur est connecté
  // mais ne peut pas encore accéder à son espace (salon en attente, refusé…).
  showLogout?: boolean;
}

// Écran plein (sans navbar ni footer) pour les états d'attente des espaces privés :
// vérification de session, chargement, salon en cours de validation.
export default function PrivateSpaceMessage({ message, title, icon: Icon, showLogout = false }: PrivateSpaceMessageProps) {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-8 bg-beige px-6 py-12">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/images/logo-icon.png" alt="" width={55} height={40} className="h-10 w-auto" />
        <span className="font-heading text-xl font-semibold tracking-tight text-forest">Nadcel</span>
      </Link>

      {title ? (
        <div className="flex max-w-md flex-col items-center gap-3 rounded-2xl border border-sage/20 bg-white/60 p-8 text-center shadow-sm">
          {Icon && <Icon size={32} className="text-champagne" aria-hidden="true" />}
          <h1 className="text-xl font-semibold text-forest">{title}</h1>
          <p className="text-sm text-anthracite/75">{message}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className="text-sm font-semibold text-forest transition-colors hover:text-dark-sage">
              Retour à l&apos;accueil
            </Link>
            {showLogout && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-medium text-beige transition-colors hover:bg-dark-sage"
              >
                <LogOut size={16} aria-hidden="true" />
                Se déconnecter
              </button>
            )}
          </div>
        </div>
      ) : (
        <p role="status" className="text-anthracite/75">
          {message}
        </p>
      )}
    </main>
  );
}

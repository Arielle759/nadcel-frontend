"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarDays, LayoutDashboard, LogOut, Menu, UserRound, X } from "lucide-react";
import { logout } from "@/lib/auth";
import { useCurrentUser, useIsAuthenticated } from "@/hooks/useAuthState";

const navLink =
  "rounded-full px-4 py-2 text-anthracite/85 transition-colors hover:bg-sage/10 hover:text-forest";
const partnerButton =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-champagne-light px-5 font-semibold text-forest shadow-sm transition-colors hover:bg-[#cca35a]";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const authed = useIsAuthenticated();
  const user = useCurrentUser();
  const isAdmin = user?.roles?.some((r) => r.name === "admin") ?? false;
  const isGerant = user?.roles?.some((r) => r.name === "gerant") ?? false;
  const dashboardLabel = isAdmin ? "Administration" : isGerant ? "Tableau de bord" : "Mes réservations";
  const dashboardHref = isAdmin
    ? "/admin/dashboard"
    : isGerant
      ? "/manager/dashboard"
      : "/client/appointments";
  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/manager") || pathname.startsWith("/client");
  const showPublicSalonLinks = !isAdmin && !isGerant;
  const showPartnerLink = !authed || (!isAdmin && !isGerant);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    router.replace("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-sage/20 bg-beige/95 backdrop-blur">
      <nav aria-label="Navigation principale" className="mx-auto flex min-h-18 max-w-6xl items-center justify-between gap-5 px-6 py-3 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
          <Image src="/images/logo-icon.png" alt="" width={55} height={40} className="h-10 w-auto" priority />
          <span className="font-heading text-xl font-semibold tracking-tight text-forest">Nadcel</span>
          {isDashboard && (
            <span className="hidden rounded-full bg-sage/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-link-sage sm:inline-flex">
              Espace privé
            </span>
          )}
        </Link>

        {/* Hiérarchie : « Inscrire mon salon » est l'action mise en avant (doré),
            la recherche et le compte restent des liens discrets. */}
        <div className="hidden items-center gap-1 text-sm font-medium lg:flex">
          {showPublicSalonLinks && (
            <Link href="/salons" className={navLink}>
              Trouver un salon
            </Link>
          )}
          {authed && (
            <Link href={dashboardHref} className={`${navLink} inline-flex items-center gap-2`}>
              {isGerant || isAdmin ? <LayoutDashboard size={16} aria-hidden="true" /> : <CalendarDays size={16} aria-hidden="true" />}
              {dashboardLabel}
            </Link>
          )}
          {authed ? (
            <>
              <span className="ml-2 inline-flex items-center gap-2 px-2 text-anthracite/75">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-beige" aria-hidden="true">
                  <UserRound size={15} />
                </span>
                {user?.name ?? "Mon compte"}
              </span>
              <button type="button" onClick={handleLogout} className={`${navLink} inline-flex items-center gap-2`}>
                <LogOut size={16} aria-hidden="true" />
                Déconnexion
              </button>
            </>
          ) : (
            <Link href="/login" className={navLink}>
              Se connecter
            </Link>
          )}
          {showPartnerLink && (
            <Link href="/devenir-partenaire" className={`${partnerButton} ml-2`}>
              Inscrire mon salon
            </Link>
          )}
        </div>

        <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} className="flex h-11 w-11 items-center justify-center rounded-full border border-sage/30 text-forest lg:hidden">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-sage/20 bg-beige px-5 py-4 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 text-sm font-medium">
            {showPublicSalonLinks && <Link href="/salons" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-sage/10">Trouver un salon</Link>}
            {authed && <Link href={dashboardHref} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-sage/10">{dashboardLabel}</Link>}
            {authed ? (
              <button type="button" onClick={handleLogout} className="rounded-xl px-4 py-3 text-left hover:bg-sage/10">Se déconnecter</button>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-sage/10">Se connecter</Link>
            )}
            {showPartnerLink && (
              <Link href="/devenir-partenaire" onClick={() => setMenuOpen(false)} className={`${partnerButton} mt-2 w-full`}>
                Inscrire mon salon
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

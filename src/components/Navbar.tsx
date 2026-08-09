"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarDays, LayoutDashboard, LogOut, Menu, Store, UserRound, X } from "lucide-react";
import { logout } from "@/lib/auth";
import { useCurrentUser, useIsAuthenticated } from "@/hooks/useAuthState";

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
    <header className="sticky top-0 z-50 border-b border-sage/20 bg-beige/90 shadow-[0_4px_24px_rgba(45,59,40,0.06)] backdrop-blur-xl">
      <nav className="mx-auto flex min-h-18 max-w-[1600px] items-center justify-between gap-5 px-5 py-3 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
          <Image src="/images/logo-icon.png" alt="" width={55} height={40} className="h-10 w-auto" priority />
          <span className="font-heading text-xl font-semibold tracking-tight text-forest">Nadcel</span>
          {isDashboard && (
            <span className="hidden rounded-full bg-sage/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-link-sage sm:inline-flex">
              Espace privé
            </span>
          )}
        </Link>

        <div className="hidden items-center gap-2 text-sm font-medium lg:flex">
          {showPublicSalonLinks && (
            <Link href="/salons" className="rounded-full px-4 py-2 text-anthracite/75 transition-colors hover:bg-sage/10 hover:text-forest">
              Nos salons
            </Link>
          )}
          {authed && (
            <Link href={dashboardHref} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-anthracite/75 transition-colors hover:bg-sage/10 hover:text-forest">
              {isGerant || isAdmin ? <LayoutDashboard size={16} /> : <CalendarDays size={16} />}
              {dashboardLabel}
            </Link>
          )}
          {showPartnerLink && (
            <Link href="/devenir-partenaire" className="inline-flex items-center gap-2 rounded-full border border-dark-sage/35 px-4 py-2 text-link-sage transition-colors hover:bg-sage/10">
              <Store size={16} />
              Inscrire mon salon
            </Link>
          )}
          {authed ? (
            <>
              <span className="inline-flex items-center gap-2 px-2 text-anthracite/65">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-beige"><UserRound size={15} /></span>
                {user?.name ?? "Mon compte"}
              </span>
              <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-beige transition-colors hover:bg-dark-sage">
                <LogOut size={16} />
                Déconnexion
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-full bg-forest px-5 py-2 text-beige transition-colors hover:bg-dark-sage">
              Se connecter
            </Link>
          )}
        </div>

        <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} className="flex h-10 w-10 items-center justify-center rounded-full border border-sage/30 text-forest lg:hidden">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-sage/20 bg-beige px-5 py-4 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-2 text-sm font-medium">
            {showPublicSalonLinks && <Link href="/salons" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-sage/10">Nos salons</Link>}
            {authed && <Link href={dashboardHref} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-sage/10">{dashboardLabel}</Link>}
            {showPartnerLink && <Link href="/devenir-partenaire" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-sage/10">Inscrire mon salon</Link>}
            {authed ? (
              <button type="button" onClick={handleLogout} className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 text-beige"><LogOut size={16} />Se déconnecter</button>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="mt-2 rounded-xl bg-forest px-4 py-3 text-center text-beige">Se connecter</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

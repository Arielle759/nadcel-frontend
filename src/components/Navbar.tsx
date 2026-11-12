"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarDays, LayoutDashboard, LogOut, Menu, UserRound, X } from "lucide-react";
import { logout } from "@/lib/auth";
import { useCurrentUser, useIsAuthenticated } from "@/hooks/useAuthState";
import { UNIVERSES, universeHref } from "@/lib/universes";

const navLink =
  "whitespace-nowrap rounded-full px-4 py-2 text-anthracite/85 transition-colors hover:bg-sable/10 hover:text-brand";
// Services listés directement dans la barre (sans menu à ouvrir) : un clic
// mène à la recherche filtrée. Selon la largeur, on en montre 3 ou 5 ; tous
// restent sur l'accueil et dans « Trouver un salon ».
const serviceLink =
  "whitespace-nowrap rounded-full px-3 py-2 text-anthracite/85 transition-colors hover:bg-sable/10 hover:text-brand";
// « Inscrire mon salon » doit rester bien visible pour les gérants : terracotta plein.
const partnerButton =
  "inline-flex whitespace-nowrap min-h-11 items-center justify-center rounded-full bg-accent px-5 font-semibold text-beige shadow-sm transition-colors hover:bg-cacao";

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const authed = useIsAuthenticated();
  const user = useCurrentUser();
  const isAdmin = user?.roles?.some((r) => r.name === "admin") ?? false;
  const isGerant = user?.roles?.some((r) => r.name === "gerant") ?? false;
  const dashboardLabel = isAdmin ? "Administration" : isGerant ? "Tableau de bord" : "Mes rendez-vous";
  const dashboardHref = isAdmin
    ? "/admin/dashboard"
    : isGerant
      ? "/manager/dashboard"
      : "/client/appointments";
  const showPublicSalonLinks = !isAdmin && !isGerant;
  const showPartnerLink = !authed || (!isAdmin && !isGerant);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    router.replace("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-sable/20 bg-beige/95 backdrop-blur">
      <nav aria-label="Navigation principale" className="mx-auto flex min-h-18 max-w-6xl items-center justify-between gap-5 px-6 py-3 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
          <Image src="/images/logo-icon.png" alt="" width={55} height={40} className="h-10 w-auto" priority />
          <span className="font-heading text-xl font-semibold tracking-tight text-brand">Nadcel</span>
        </Link>

        {/* Hiérarchie : « Inscrire mon salon » est l'action mise en avant (doré),
            la recherche et le compte restent des liens discrets. */}
        <div className="hidden items-center gap-1 text-sm font-medium lg:flex">
          {showPublicSalonLinks && (
            <ul aria-label="Services" className="mr-1 flex items-center border-r border-sable/30 pr-2">
              {UNIVERSES.map(({ label, query }, index) => (
                <li key={label} className={index >= 5 ? "hidden" : index >= 3 ? "hidden xl:block" : undefined}>
                  <Link href={universeHref(query)} className={serviceLink}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
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
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-beige" aria-hidden="true">
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

        <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} className="flex h-11 w-11 items-center justify-center rounded-full border border-sable/30 text-brand lg:hidden">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-sable/20 bg-beige px-5 py-4 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 text-sm font-medium">
            {showPublicSalonLinks && (
              <div className="mb-2 border-b border-sable/20 px-4 pb-4">
                <p className="pb-2 text-xs font-semibold uppercase tracking-wide text-anthracite/75">Services</p>
                <ul className="flex flex-wrap gap-2">
                  {UNIVERSES.map(({ label, query }) => (
                    <li key={label}>
                      <Link href={universeHref(query)} onClick={() => setMenuOpen(false)} className="inline-flex min-h-10 items-center rounded-full border border-sable/40 bg-white px-4 text-brand hover:bg-sable/15">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {showPublicSalonLinks && <Link href="/salons" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-sable/10">Trouver un salon</Link>}
            {authed && <Link href={dashboardHref} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-sable/10">{dashboardLabel}</Link>}
            {authed ? (
              <button type="button" onClick={handleLogout} className="rounded-xl px-4 py-3 text-left hover:bg-sable/10">Se déconnecter</button>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-sable/10">Se connecter</Link>
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

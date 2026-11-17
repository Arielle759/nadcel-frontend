"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import AccountMenu from "@/components/AccountMenu";
import NotificationBell from "@/components/NotificationBell";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  // Lien actif aussi sur les sous-pages (ex. /manager/salons/12/services).
  matchSubpaths?: boolean;
  // Pastille de compteur (ex. demandes à traiter).
  badge?: number | null;
}

interface DashboardShellProps {
  title: string; // « Espace gérant », « Administration »
  navItems: DashboardNavItem[];
  // Menu de l'avatar (en haut à droite).
  account: { roleLabel: string; dashboardHref: string; dashboardLabel?: string; profileHref: string };
  // Cloche : nombre d'éléments qui attendent une action, et la liste où les traiter.
  notifications?: { count: number | null; label: string; href: string };
  // Bouton « Voir le site » en bas de la barre latérale.
  showSiteLink?: boolean;
  children: React.ReactNode;
}

// Cadre commun des espaces privés : barre latérale blanche (rubriques de
// l'espace uniquement), rubrique active en chocolat ; en haut à droite, la
// cloche et l'avatar qui porte le profil et la déconnexion. Sur mobile, la
// navigation passe en bandeau horizontal au-dessus du contenu.
export default function DashboardShell({ title, navItems, account, notifications, showSiteLink = false, children }: DashboardShellProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // Sur mobile, la navigation défile horizontalement : on amène la rubrique
  // active dans la zone visible pour qu'elle ne soit jamais coupée.
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollTo({ left: active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2, behavior: "smooth" });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-beige md:flex-row">
      <aside className="z-10 flex w-full flex-col gap-4 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(90,50,35,0.06)] md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:gap-10 md:px-4 md:py-7 md:shadow-[8px_0_32px_rgba(90,50,35,0.05)]">
        <div className="flex items-center justify-between gap-3 px-2">
          <Link href="/" className="flex items-center gap-2.5" title="Voir le site public">
            <Image src="/images/logo-icon.png" alt="" width={55} height={40} className="h-8 w-auto" />
            <span className="font-heading text-xl font-semibold tracking-tight text-brand">Nadcel</span>
          </Link>
        </div>

        <div className="md:flex md:flex-1 md:flex-col">
          <p className="mb-3 hidden px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-anthracite/75 md:block">{title}</p>
          <nav ref={navRef} aria-label={title} className="flex gap-1 overflow-x-auto pr-10 md:pr-0 [mask-image:linear-gradient(to_right,black_85%,transparent)] md:flex-col md:overflow-visible md:[mask-image:none]">
            {navItems.map(({ href, label, icon: Icon, matchSubpaths, badge }) => {
              const active = pathname === href || (matchSubpaths === true && pathname.startsWith(`${href}/`));
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex min-h-11 shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 text-sm font-semibold transition-colors ${
                    active ? "text-beige" : "text-anthracite/75 hover:bg-beige hover:text-brand"
                  }`}
                >
                  {/* Le fond chocolat glisse d'une rubrique à l'autre. */}
                  {active && (
                    <motion.span
                      layoutId="dashboard-nav-active"
                      className="absolute inset-0 rounded-xl bg-brand shadow-[0_6px_16px_rgba(74,51,40,0.25)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      aria-hidden="true"
                    />
                  )}
                  <Icon size={18} className="relative shrink-0" aria-hidden="true" />
                  <span className="relative">{label}</span>
                  {badge ? (
                    <span className="relative ml-auto flex min-w-5 items-center justify-center rounded-full bg-alert px-1.5 text-[11px] font-semibold leading-5 text-white">
                      {badge > 99 ? "99+" : badge}
                      <span className="sr-only"> à traiter</span>
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {showSiteLink && (
            <div className="mt-auto hidden pt-6 md:block">
              {/* Nouvel onglet : l'espace reste ouvert ici, la session (stockée
                  dans le navigateur) est partagée, aucun jeton dans l'adresse. */}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-beige px-4 text-sm font-semibold text-brand transition-colors hover:bg-sable/30"
              >
                Voir le site
                <ArrowUpRight size={16} aria-hidden="true" />
                <span className="sr-only">(nouvel onglet)</span>
              </a>
            </div>
          )}
        </div>
      </aside>

      {/* Changement de rubrique : léger fondu montant. Pas d'animation de sortie
          (voir PageTransition : elle lancerait les appels de la page deux fois). */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative z-20 flex items-center justify-end gap-2 px-5 pt-5 sm:px-10">
          {notifications && <NotificationBell {...notifications} />}
          <AccountMenu {...account} />
        </div>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex min-w-0 flex-1 flex-col"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

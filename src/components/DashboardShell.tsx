"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
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

// Deux mises en page de référence :
// - « hub » (espace gérant, espace client) : barre latérale teintée et bordée,
//   bandeau blanc en haut avec la cloche et l'avatar, pastilles pleines ;
// - « overview » (administration) : barre latérale blanche sans bordure,
//   pastilles claires, pas de bandeau séparé.
export type DashboardLook = "hub" | "overview";

interface DashboardShellProps {
  title: string; // « Espace gérant », « Administration »
  navItems: DashboardNavItem[];
  // Menu de l'avatar (en haut à droite).
  account: { roleLabel: string; dashboardHref: string; dashboardLabel?: string; profileHref: string };
  // Cloche : nombre d'éléments qui attendent une action, et la liste où les traiter.
  notifications?: { count: number | null; label: string; href: string };
  look?: DashboardLook;
  children: React.ReactNode;
}

// Cadre commun des espaces privés : rubriques de l'espace à gauche (rubrique
// active en chocolat) ; en haut à droite, la cloche et l'avatar qui porte le
// profil, « Voir le site » et la déconnexion. Sur mobile, la navigation passe
// en bandeau horizontal au-dessus du contenu.
export default function DashboardShell({ title, navItems, account, notifications, look = "hub", children }: DashboardShellProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const hub = look === "hub";

  // Sur mobile, la navigation défile horizontalement : on amène la rubrique
  // active dans la zone visible pour qu'elle ne soit jamais coupée.
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollTo({ left: active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2, behavior: "smooth" });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white md:flex-row">
      <aside
        className={`z-10 flex w-full flex-col gap-4 px-4 py-4 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:gap-8 md:py-6 ${
          hub ? "border-b border-sable/40 bg-[#faf8f5] md:border-b-0 md:border-r" : "border-b border-sable/30 bg-white md:border-b-0"
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5 px-2" title="Voir le site public">
          <span className={`flex size-10 items-center justify-center rounded-xl ${hub ? "bg-brand" : ""}`}>
            <Image src="/images/logo-icon.png" alt="" width={55} height={40} className={`h-7 w-auto ${hub ? "brightness-0 invert" : ""}`} />
          </span>
          <span className="font-heading text-xl font-semibold tracking-tight text-brand">Nadcel</span>
        </Link>

        <div className="md:flex md:flex-1 md:flex-col">
          <p className="mb-2 hidden px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-anthracite/60 md:block">{title}</p>
          <nav
            ref={navRef}
            aria-label={title}
            className="flex gap-1 overflow-x-auto pr-10 md:pr-0 [mask-image:linear-gradient(to_right,black_85%,transparent)] md:flex-col md:overflow-visible md:[mask-image:none]"
          >
            {navItems.map(({ href, label, icon: Icon, matchSubpaths, badge }) => {
              const active = pathname === href || (matchSubpaths === true && pathname.startsWith(`${href}/`));
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex min-h-11 shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 text-sm font-medium transition-colors ${
                    active ? "text-beige" : `text-anthracite/80 hover:text-brand ${hub ? "hover:bg-white" : "hover:bg-beige"}`
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="dashboard-nav-active"
                      className="absolute inset-0 rounded-xl bg-brand shadow-[0_6px_16px_rgba(74,51,40,0.22)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      aria-hidden="true"
                    />
                  )}
                  <Icon size={18} className="relative shrink-0" aria-hidden="true" />
                  <span className="relative">{label}</span>
                  {badge ? (
                    <span
                      className={`relative ml-auto flex min-w-6 items-center justify-center rounded-md px-1.5 text-[11px] font-semibold leading-5 ${
                        hub ? "bg-accent text-white" : active ? "bg-beige text-brand" : "bg-accent/15 text-accent"
                      }`}
                    >
                      {badge > 99 ? "99+" : badge}
                      <span className="sr-only"> à traiter</span>
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div
          className={`relative z-20 flex items-center justify-end gap-2 px-5 sm:px-8 ${
            hub ? "h-16 border-b border-sable/40 bg-white" : "pt-5"
          }`}
        >
          {notifications && <NotificationBell {...notifications} />}
          <AccountMenu {...account} />
        </div>
        {/* Changement de rubrique : léger fondu montant. Pas d'animation de sortie
            (voir PageTransition : elle lancerait les appels de la page deux fois). */}
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

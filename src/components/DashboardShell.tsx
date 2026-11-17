"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, type LucideIcon } from "lucide-react";
import AccountMenu from "@/components/AccountMenu";
import NotificationBell from "@/components/NotificationBell";
import { useCurrentUser } from "@/hooks/useAuthState";

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

  // Connexion avec un autre compte dans un autre onglet : la session de ce
  // navigateur a changé de propriétaire. Les données affichées (salons,
  // rendez-vous, statistiques) appartiennent à l'ancien compte : on recharge
  // la page pour repartir proprement (la mise en page renvoie ensuite vers
  // l'espace du nouveau compte si ce n'est pas le même rôle). La déconnexion,
  // elle, est gérée par la mise en page de chaque espace (retour à la connexion).
  const userId = useCurrentUser()?.id ?? null;
  const firstUserId = useRef(userId);
  useEffect(() => {
    if (firstUserId.current === null) firstUserId.current = userId;
    else if (userId !== null && userId !== firstUserId.current) window.location.reload();
  }, [userId]);

  // Bouton ☰ du bandeau : réduit la barre latérale aux seules icônes (ordinateur).
  const [collapsed, setCollapsed] = useState(false);
  const compact = hub && collapsed;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white md:flex-row">
      <aside
        className={`z-10 flex w-full flex-col md:sticky md:top-0 md:h-screen md:shrink-0 ${
          hub
            ? `border-b border-[#ebe4dd] bg-[#faf8f6] md:border-b-0 md:border-r ${compact ? "md:w-[76px]" : "md:w-[228px]"}`
            : "gap-4 border-b border-sable/30 bg-white px-4 py-4 md:w-64 md:gap-8 md:border-b-0 md:py-6"
        }`}
      >
        {hub ? (
          <Link href="/" className="flex h-16 shrink-0 items-center gap-2.5 px-5" title="Voir le site public">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent">
              <Image src="/images/logo-icon.png" alt="" width={55} height={40} className="h-5 w-auto brightness-0 invert" />
            </span>
            <span className={`text-xl font-bold tracking-tight text-anthracite ${compact ? "md:sr-only" : ""}`}>Nadcel</span>
          </Link>
        ) : (
          <Link href="/" className="flex items-center gap-2.5 px-2" title="Voir le site public">
            <Image src="/images/logo-icon.png" alt="" width={55} height={40} className="h-7 w-auto" />
            <span className="font-heading text-xl font-semibold tracking-tight text-brand">Nadcel</span>
          </Link>
        )}

        <div className={hub ? "px-3 pb-3 md:flex md:flex-1 md:flex-col md:pt-3" : "md:flex md:flex-1 md:flex-col"}>
          {!hub && (
            <p className="mb-2 hidden px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-anthracite/60 md:block">{title}</p>
          )}
          <nav
            ref={navRef}
            aria-label={title}
            className={`flex overflow-x-auto pr-10 md:pr-0 [mask-image:linear-gradient(to_right,black_85%,transparent)] md:flex-col md:overflow-visible md:[mask-image:none] ${
              hub ? "gap-1.5" : "gap-1"
            }`}
          >
            {navItems.map(({ href, label, icon: Icon, matchSubpaths, badge }) => {
              const active = pathname === href || (matchSubpaths === true && pathname.startsWith(`${href}/`));
              return (
                <Link
                  key={href}
                  href={href}
                  title={compact ? label : undefined}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg text-[15px] font-medium transition-colors ${
                    hub ? `min-h-11 px-3 ${compact ? "md:justify-center md:px-0" : ""}` : "min-h-11 rounded-xl px-3 text-sm"
                  } ${
                    active
                      ? hub
                        ? "bg-accent text-white shadow-[0_2px_6px_rgba(143,74,50,0.25)]"
                        : "text-beige"
                      : `text-anthracite/85 hover:text-anthracite ${hub ? "hover:bg-[#f1ece6]" : "hover:bg-beige"}`
                  }`}
                >
                  {active && !hub && (
                    <motion.span
                      layoutId="dashboard-nav-active"
                      className="absolute inset-0 rounded-xl bg-brand shadow-[0_6px_16px_rgba(74,51,40,0.22)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      aria-hidden="true"
                    />
                  )}
                  <Icon size={19} strokeWidth={1.8} className="relative shrink-0" aria-hidden="true" />
                  <span className={`relative ${compact ? "md:sr-only" : ""}`}>{label}</span>
                  {badge ? (
                    <span
                      className={`relative ml-auto flex min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-semibold leading-5 ${
                        hub
                          ? `bg-[var(--color-chart-2)] text-white ${compact ? "md:absolute md:-right-1 md:-top-1 md:min-w-5 md:text-[10px]" : ""}`
                          : active
                            ? "bg-beige text-brand"
                            : "bg-accent/15 text-accent"
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
          className={`relative z-20 flex items-center gap-2 px-5 sm:px-8 ${hub ? "h-16 border-b border-[#ebe4dd] bg-white" : "justify-end pt-5"}`}
        >
          {hub && (
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              aria-pressed={collapsed}
              className="-ml-2 mr-auto hidden size-10 items-center justify-center rounded-lg text-anthracite/80 transition-colors hover:bg-[#f1ece6] md:flex"
            >
              <Menu size={20} aria-hidden="true" />
              <span className="sr-only">{collapsed ? "Déplier le menu" : "Réduire le menu"}</span>
            </button>
          )}
          {hub && <span className="mr-auto md:hidden" />}
          {notifications && <NotificationBell {...notifications} dot={hub} />}
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

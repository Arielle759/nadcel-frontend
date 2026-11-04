"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { logout } from "@/lib/auth";
import { useCurrentUser } from "@/hooks/useAuthState";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  // Lien actif aussi sur les sous-pages (ex. /manager/salons/12/services).
  matchSubpaths?: boolean;
}

interface DashboardShellProps {
  title: string; // « Espace gérant », « Administration »
  navItems: DashboardNavItem[];
  children: React.ReactNode;
}

// Cadre commun des espaces privés (gérant, administrateur) : barre latérale
// verte avec la navigation en haut et le compte en bas. Sur mobile, la
// navigation passe en bandeau horizontal au-dessus du contenu.
export default function DashboardShell({ title, navItems, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-beige md:flex-row">
      <aside className="flex w-full flex-col gap-4 bg-brand px-4 py-4 text-beige md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:gap-8 md:px-4 md:py-6">
        <div className="flex items-center justify-between gap-3 px-2">
          <Link href="/" className="flex items-center gap-2.5" title="Voir le site public">
            <Image src="/images/logo-icon.png" alt="" width={55} height={40} className="h-8 w-auto" />
            <span className="font-heading text-xl font-semibold tracking-tight text-beige">Nadcel</span>
          </Link>
          <button type="button" onClick={handleLogout} className="text-sm font-semibold text-beige/80 hover:text-beige md:hidden">
            Se déconnecter
          </button>
        </div>

        <div className="md:flex md:flex-1 md:flex-col">
          <p className="mb-2 hidden px-3 text-xs font-medium text-beige/55 md:block">{title}</p>
          <nav aria-label={title} className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {navItems.map(({ href, label, icon: Icon, matchSubpaths }) => {
              const active = pathname === href || (matchSubpaths === true && pathname.startsWith(`${href}/`));
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex min-h-11 shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 text-sm font-semibold transition-colors ${
                    active ? "text-brand" : "text-beige/75 hover:bg-beige/10 hover:text-beige"
                  }`}
                >
                  {/* Le fond ivoire glisse d'une rubrique à l'autre. */}
                  {active && (
                    <motion.span
                      layoutId="dashboard-nav-active"
                      className="absolute inset-0 rounded-xl bg-beige"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      aria-hidden="true"
                    />
                  )}
                  <Icon size={18} className="relative shrink-0" aria-hidden="true" />
                  <span className="relative">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto hidden flex-col gap-1 pt-6 md:flex">
            <p className="truncate px-3 text-sm font-semibold text-beige">{user?.name ?? "Mon compte"}</p>
            <p className="truncate px-3 pb-2 text-xs text-beige/60">{user?.email}</p>
            <Link href="/" className="flex min-h-10 items-center rounded-xl px-3 text-sm font-medium text-beige/75 transition-colors hover:bg-beige/10 hover:text-beige">
              Voir le site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-10 items-center rounded-xl px-3 text-left text-sm font-medium text-beige/75 transition-colors hover:bg-beige/10 hover:text-beige"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </aside>

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
  );
}

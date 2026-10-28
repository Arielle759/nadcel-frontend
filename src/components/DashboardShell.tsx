"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, LogOut, UserRound } from "lucide-react";
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
  initials: string;
  title: string;
  subtitle: string;
  navItems: DashboardNavItem[];
  children: React.ReactNode;
}

// Cadre commun des espaces privés (gérant, administrateur) :
// barre latérale de navigation + barre supérieure, sans navbar ni footer publics.
export default function DashboardShell({ initials, title, subtitle, navItems, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <aside className="flex w-full flex-col gap-4 bg-gradient-to-b from-forest to-[#1f2d1c] px-4 py-4 text-beige shadow-xl md:sticky md:top-0 md:h-screen md:w-72 md:shrink-0 md:gap-7 md:overflow-y-auto md:px-5 md:py-6">
        <Link href="/" className="hidden items-center gap-2.5 px-1 md:flex" title="Voir le site public">
          <Image src="/images/logo-icon.png" alt="" width={55} height={40} className="h-9 w-auto" />
          <span className="font-heading text-xl font-semibold tracking-tight text-beige">Nadcel</span>
        </Link>

        <div className="flex items-center gap-3 rounded-2xl border border-beige/10 bg-beige/5 p-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-champagne text-sm font-bold text-forest">
            {initials}
          </span>
          <div>
            <span className="block font-semibold">{title}</span>
            <span className="text-xs text-beige/55">{subtitle}</span>
          </div>
        </div>

        <nav aria-label={title} className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {navItems.map(({ href, label, icon: Icon, matchSubpaths }) => {
            const active = pathname === href || (matchSubpaths === true && pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active ? "bg-beige text-forest shadow-md" : "text-beige/70 hover:bg-beige/10 hover:text-beige"
                }`}
              >
                <Icon size={18} className="shrink-0" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-end gap-2 border-b border-sage/20 bg-beige/90 px-4 py-3 backdrop-blur-xl sm:gap-3 sm:px-8">
          <span className="mr-auto hidden items-center gap-2 text-sm text-anthracite/70 sm:inline-flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-beige">
              <UserRound size={15} aria-hidden="true" />
            </span>
            {user?.name ?? "Mon compte"}
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-link-sage transition-colors hover:bg-sage/10"
          >
            <ExternalLink size={16} aria-hidden="true" />
            Voir le site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-medium text-beige transition-colors hover:bg-dark-sage"
          >
            <LogOut size={16} aria-hidden="true" />
            Déconnexion
          </button>
        </header>

        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

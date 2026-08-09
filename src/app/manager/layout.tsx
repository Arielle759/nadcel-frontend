"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Building2, Calendar } from "lucide-react";
import { hasRole, isAuthenticated, subscribeToAuthChanges } from "@/lib/auth";
import { useHasMounted } from "@/hooks/useHasMounted";

function isManagerUser(): boolean {
  return isAuthenticated() && (hasRole("gerant") || hasRole("admin"));
}

// Mirrors useHasMounted(): the server never has access to localStorage, so
// getServerSnapshot must agree with the pre-mount client render (`false`).
function useIsManager(): boolean {
  return useSyncExternalStore(subscribeToAuthChanges, isManagerUser, () => false);
}

const NAV_ITEMS = [
  { href: "/manager/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/manager/salons", label: "Mes salons", icon: Building2 },
  { href: "/manager/appointments", label: "Mes réservations", icon: Calendar },
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useHasMounted();
  const isManager = useIsManager();

  useEffect(() => {
    if (mounted && !isManager) {
      router.replace("/");
    }
  }, [mounted, isManager, router]);

  if (!mounted || !isManager) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="text-anthracite/75">Vérification des autorisations...</p>
      </main>
    );
  }

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="flex w-full flex-col gap-4 bg-gradient-to-b from-forest to-[#1f2d1c] px-4 py-4 text-beige shadow-xl md:sticky md:top-0 md:h-screen md:w-72 md:shrink-0 md:gap-7 md:px-5 md:py-8">
        <div className="flex items-center gap-3 rounded-2xl border border-beige/10 bg-beige/5 p-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-champagne text-sm font-bold text-forest">
            GE
          </span>
          <div>
            <span className="block font-semibold">Espace gérant</span>
            <span className="text-xs text-beige/55">Pilotage du salon</span>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active ? "bg-beige text-forest shadow-md" : "text-beige/70 hover:bg-beige/10 hover:text-beige"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}

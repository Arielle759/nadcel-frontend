"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Building2, Calendar } from "lucide-react";
import { hasRole, isAuthenticated } from "@/lib/auth";
import { useHasMounted } from "@/hooks/useHasMounted";

function subscribeNoop() {
  return () => {};
}

function isManagerUser(): boolean {
  return isAuthenticated() && (hasRole("gerant") || hasRole("admin"));
}

// Mirrors useHasMounted(): the server never has access to localStorage, so
// getServerSnapshot must agree with the pre-mount client render (`false`).
function useIsManager(): boolean {
  return useSyncExternalStore(subscribeNoop, isManagerUser, () => false);
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
      <aside className="flex w-full flex-col gap-4 bg-forest px-4 py-4 text-beige md:w-64 md:shrink-0 md:gap-6 md:px-4 md:py-8">
        <span className="px-1 text-lg font-semibold">Espace gérant</span>
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-beige/15 text-beige" : "text-beige/70 hover:bg-beige/10 hover:text-beige"
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

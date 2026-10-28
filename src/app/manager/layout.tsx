"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Building2, Calendar, Clock3, XCircle } from "lucide-react";
import { hasRole, isAuthenticated, subscribeToAuthChanges } from "@/lib/auth";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useManagerSalons } from "@/hooks/useManagerSalons";

function isManagerUser(): boolean {
  return isAuthenticated() && (hasRole("gerant") || hasRole("admin"));
}

function isAdminUser(): boolean {
  return isAuthenticated() && hasRole("admin");
}

// Mirrors useHasMounted(): the server never has access to localStorage, so
// getServerSnapshot must agree with the pre-mount client render (`false`).
function useIsManager(): boolean {
  return useSyncExternalStore(subscribeToAuthChanges, isManagerUser, () => false);
}

function useIsAdmin(): boolean {
  return useSyncExternalStore(subscribeToAuthChanges, isAdminUser, () => false);
}

const NAV_ITEMS = [
  { href: "/manager/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/manager/salons", label: "Mes salons", icon: Building2 },
  { href: "/manager/appointments", label: "Mes réservations", icon: Calendar },
];

function PendingScreen({
  icon: Icon,
  title,
  message,
}: {
  icon: typeof Clock3;
  title: string;
  message: string;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="flex max-w-md flex-col items-center gap-3 rounded-2xl border border-sage/20 bg-beige p-8 text-center shadow-sm">
        <Icon size={32} className="text-champagne" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-forest">{title}</h1>
        <p className="text-sm text-anthracite/75">{message}</p>
        <Link href="/" className="mt-2 text-sm font-medium text-link-sage hover:underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useHasMounted();
  const isManager = useIsManager();
  const isAdmin = useIsAdmin();
  const { salons, loading: salonsLoading } = useManagerSalons();

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

  if (!isAdmin) {
    if (salonsLoading) {
      return (
        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <p className="text-anthracite/75">Chargement...</p>
        </main>
      );
    }

    const hasVerifiedSalon = salons.some((salon) => salon.is_verified);

    if (!hasVerifiedSalon) {
      if (salons.length === 0) {
        return (
          <PendingScreen
            icon={Building2}
            title="Aucun salon associé à votre compte"
            message="Soumettez la fiche de votre salon pour accéder à votre espace gérant une fois qu'elle sera validée."
          />
        );
      }

      const allRejected = salons.every((salon) => !salon.is_active);
      if (allRejected) {
        return (
          <PendingScreen
            icon={XCircle}
            title="Votre demande n'a pas été retenue"
            message="Votre salon n'a pas été validé par notre équipe. Contactez-nous pour plus d'informations."
          />
        );
      }

      return (
        <PendingScreen
          icon={Clock3}
          title="Votre salon est en cours de validation"
          message="Merci pour votre inscription ! Notre équipe examine votre demande. Vous aurez accès à votre espace gérant dès que votre salon sera validé."
        />
      );
    }
  }

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="flex w-full flex-col gap-4 bg-gradient-to-b from-forest to-[#1f2d1c] px-4 py-4 text-beige shadow-xl md:sticky md:top-[73px] md:h-[calc(100vh-73px)] md:w-72 md:shrink-0 md:self-start md:gap-7 md:px-5 md:py-8 md:overflow-y-auto">
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

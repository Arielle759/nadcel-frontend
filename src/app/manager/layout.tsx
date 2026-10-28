"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Building2, Calendar, Clock3, XCircle } from "lucide-react";
import { hasRole, isAuthenticated, subscribeToAuthChanges } from "@/lib/auth";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useManagerSalons } from "@/hooks/useManagerSalons";
import DashboardShell, { type DashboardNavItem } from "@/components/DashboardShell";
import PrivateSpaceMessage from "@/components/PrivateSpaceMessage";

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

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/manager/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/manager/salons", label: "Mes salons", icon: Building2, matchSubpaths: true },
  { href: "/manager/appointments", label: "Mes réservations", icon: Calendar, matchSubpaths: true },
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const mounted = useHasMounted();
  const isManager = useIsManager();
  const isAdmin = useIsAdmin();
  const { salons, loading: salonsLoading } = useManagerSalons();

  useEffect(() => {
    if (mounted && !isManager) {
      router.replace(isAuthenticated() ? "/" : "/login");
    }
  }, [mounted, isManager, router]);

  if (!mounted || !isManager) {
    return <PrivateSpaceMessage message="Vérification des autorisations..." />;
  }

  if (!isAdmin) {
    if (salonsLoading) {
      return <PrivateSpaceMessage message="Chargement de votre espace..." />;
    }

    const hasVerifiedSalon = salons.some((salon) => salon.is_verified);

    if (!hasVerifiedSalon) {
      if (salons.length === 0) {
        return (
          <PrivateSpaceMessage
            icon={Building2}
            title="Aucun salon associé à votre compte"
            message="Soumettez la fiche de votre salon pour accéder à votre espace gérant une fois qu'elle sera validée."
            showLogout
          />
        );
      }

      const allRejected = salons.every((salon) => !salon.is_active);
      if (allRejected) {
        return (
          <PrivateSpaceMessage
            icon={XCircle}
            title="Votre demande n'a pas été retenue"
            message="Votre salon n'a pas été validé par notre équipe. Contactez-nous pour plus d'informations."
            showLogout
          />
        );
      }

      return (
        <PrivateSpaceMessage
          icon={Clock3}
          title="Votre salon est en cours de validation"
          message="Merci pour votre inscription ! Notre équipe examine votre demande sous 48 heures ouvrées. Vous aurez accès à votre espace gérant dès que votre salon sera validé."
          showLogout
        />
      );
    }
  }

  return (
    <DashboardShell initials="GE" title="Espace gérant" subtitle="Pilotage du salon" navItems={NAV_ITEMS}>
      {children}
    </DashboardShell>
  );
}

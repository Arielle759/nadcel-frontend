"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Search, UserRound } from "lucide-react";
import { useIsAuthenticated } from "@/hooks/useAuthState";
import { useHasMounted } from "@/hooks/useHasMounted";
import DashboardShell, { type DashboardNavItem } from "@/components/DashboardShell";
import PrivateSpaceMessage from "@/components/PrivateSpaceMessage";

// Espace cliente : même cadre que l'espace gérant (barre latérale, compte,
// déconnexion), sans la navigation ni le pied de page du site public.
// « Réserver un salon » ramène vers la recherche quand elle veut réserver.
const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/client/appointments", label: "Mes rendez-vous", icon: CalendarCheck },
  { href: "/salons", label: "Réserver un salon", icon: Search },
  { href: "/client/profil", label: "Mon profil", icon: UserRound },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const mounted = useHasMounted();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace("/login");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return <PrivateSpaceMessage message="Vérification de votre session..." />;
  }

  return (
    <DashboardShell title="Mon espace" navItems={NAV_ITEMS}>
      {children}
    </DashboardShell>
  );
}

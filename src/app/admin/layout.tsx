"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Inbox, Store, MessageSquare } from "lucide-react";
import { hasRole, isAuthenticated, subscribeToAuthChanges } from "@/lib/auth";
import { useHasMounted } from "@/hooks/useHasMounted";
import DashboardShell, { type DashboardNavItem } from "@/components/DashboardShell";
import PrivateSpaceMessage from "@/components/PrivateSpaceMessage";

function isAdminUser(): boolean {
  return isAuthenticated() && hasRole("admin");
}

// Mirrors useHasMounted(): the server never has access to localStorage, so
// getServerSnapshot must agree with the pre-mount client render (`false`).
function useIsAdmin(): boolean {
  return useSyncExternalStore(subscribeToAuthChanges, isAdminUser, () => false);
}

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/salons", label: "Demandes", icon: Inbox },
  { href: "/admin/salons/all", label: "Salons", icon: Store },
  { href: "/admin/reviews", label: "Avis", icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const mounted = useHasMounted();
  const isAdmin = useIsAdmin();

  useEffect(() => {
    if (mounted && !isAdmin) {
      router.replace(isAuthenticated() ? "/" : "/login");
    }
  }, [mounted, isAdmin, router]);

  if (!mounted || !isAdmin) {
    return <PrivateSpaceMessage message="Vérification des autorisations..." />;
  }

  return (
    <DashboardShell title="Administration" navItems={NAV_ITEMS}>
      {children}
    </DashboardShell>
  );
}

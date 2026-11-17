"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChartColumn, Inbox, LayoutDashboard, MessageSquare, Settings, Store, UsersRound } from "lucide-react";
import { getUser, hasRole, homePathFor, isAuthenticated, subscribeToAuthChanges } from "@/lib/auth";
import { useHasMounted } from "@/hooks/useHasMounted";
import DashboardShell, { type DashboardNavItem } from "@/components/DashboardShell";
import PrivateSpaceMessage from "@/components/PrivateSpaceMessage";
import { useAttentionCount } from "@/hooks/useAttentionCount";
import type { AdminSalon, Page } from "@/hooks/useAdmin";

const totalOf = (page: Page<AdminSalon>) => page.total;


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
  { href: "/admin/users", label: "Utilisateurs", icon: UsersRound },
  { href: "/admin/reviews", label: "Avis", icon: MessageSquare },
  { href: "/admin/statistiques", label: "Statistiques", icon: ChartColumn },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const mounted = useHasMounted();
  const isAdmin = useIsAdmin();
  const pending = useAttentionCount<Page<AdminSalon>>(mounted && isAdmin ? "/admin/salons/pending" : null, totalOf);
  // Cloche et pastille « Notifications » : les demandes à examiner, seule
  // action qui disparaît une fois traitée (un avis n'a pas d'état « traité »).
  const toReview = pending;

  useEffect(() => {
    if (mounted && !isAdmin) {
      // Autre compte connecté entre-temps (autre onglet) : direction son propre espace.
      router.replace(isAuthenticated() ? homePathFor(getUser()) : "/login");
    }
  }, [mounted, isAdmin, router]);

  if (!mounted || !isAdmin) {
    return <PrivateSpaceMessage message="Vérification des autorisations..." />;
  }

  return (
    <DashboardShell
      title="Administration"
      navItems={NAV_ITEMS.map((item) => (item.href === "/admin/salons" ? { ...item, badge: pending } : item))}
      account={{ roleLabel: "Administrateur", dashboardHref: "/admin/dashboard", profileHref: "/admin/profil" }}
      notifications={{ count: toReview, label: "demande(s) de partenariat à examiner", href: "/admin/notifications" }}
      look="overview"
      secondaryNav={{
        title: "Général",
        items: [
          { href: "/admin/notifications", label: "Notifications", icon: Bell, badge: toReview },
          { href: "/admin/profil", label: "Paramètres", icon: Settings },
        ],
      }}
    >
      {children}
    </DashboardShell>
  );
}

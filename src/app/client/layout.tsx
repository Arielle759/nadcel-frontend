"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsAuthenticated } from "@/hooks/useAuthState";
import { useHasMounted } from "@/hooks/useHasMounted";
import ClientShell from "@/components/client/ClientShell";
import PrivateSpaceMessage from "@/components/PrivateSpaceMessage";

// Espace cliente : cadre simple (ClientShell), sans barre latérale ni tableau
// de bord, et sans la navigation ni le pied de page du site public.

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

  return <ClientShell>{children}</ClientShell>;
}

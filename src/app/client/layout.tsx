"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsAuthenticated } from "@/hooks/useAuthState";
import { useHasMounted } from "@/hooks/useHasMounted";

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
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="text-anthracite/75">Vérification de votre session...</p>
      </main>
    );
  }

  return children;
}

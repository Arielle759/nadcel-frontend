"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { useCurrentUser, useIsAuthenticated } from "@/hooks/useAuthState";

export default function Navbar() {
  const router = useRouter();
  const authed = useIsAuthenticated();
  const user = useCurrentUser();
  const isAdmin = user?.roles?.some((r) => r.name === "admin") ?? false;
  const isGerant = user?.roles?.some((r) => r.name === "gerant") ?? false;

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <nav className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-sage/30 bg-gradient-to-r from-sage/10 to-beige px-6 py-4">
      <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-link-sage">
        <Image src="/images/logo-icon.png" alt="" width={55} height={40} className="h-10 w-auto" priority />
        Nadcel
      </Link>
      <div className="flex items-center gap-6 text-sm font-medium text-anthracite">
        {authed && isAdmin && (
          <Link href="/admin/dashboard" className="hover:text-link-sage">
            Administration
          </Link>
        )}
        {authed && isGerant && (
          <Link href="/manager/dashboard" className="hover:text-link-sage">
            Tableau de bord
          </Link>
        )}
        {authed && !isAdmin && !isGerant && (
          <Link href="/client/appointments" className="hover:text-link-sage">
            Mes réservations
          </Link>
        )}
        {!(authed && isAdmin) && (
          <Link
            href="/devenir-partenaire"
            className="rounded-full border border-dark-sage px-4 py-1.5 text-link-sage transition-colors hover:bg-sage/10"
          >
            Inscrire mon salon
          </Link>
        )}
        {authed ? (
          <div className="flex items-center gap-4">
            <span className="text-anthracite/75">{user?.name ?? "Mon compte"}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-dark-sage px-4 py-1.5 text-link-sage transition-colors hover:bg-sage/10"
            >
              Se déconnecter
            </button>
          </div>
        ) : (
          <Link href="/login" className="hover:text-link-sage">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

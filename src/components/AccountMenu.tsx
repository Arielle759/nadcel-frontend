"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ChevronDown, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { logout } from "@/lib/auth";
import { useCurrentUser } from "@/hooks/useAuthState";

function initials(name: string | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

// Avatar en haut à droite des espaces privés : un clic ouvre le compte
// (nom, rôle), le tableau de bord, le profil et la déconnexion.
export default function AccountMenu({
  roleLabel,
  dashboardHref,
  dashboardLabel = "Tableau de bord",
  profileHref,
}: {
  roleLabel: string;
  dashboardHref: string;
  dashboardLabel?: string;
  profileHref: string;
}) {
  const user = useCurrentUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Fermeture au clic à l'extérieur et avec Échap (le focus revient sur l'avatar).
  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleLogout() {
    setOpen(false);
    logout();
    router.replace("/login");
  }

  const avatar = (size: string) => (
    <span
      aria-hidden="true"
      className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-beige shadow-[0_4px_12px_rgba(143,74,50,0.25)]`}
    >
      {initials(user?.name)}
    </span>
  );

  const item =
    "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-anthracite/80 transition-colors hover:bg-beige hover:text-brand focus-visible:bg-beige";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 transition-colors hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {avatar("size-10 text-sm")}
        <span className="sr-only">Ouvrir le menu du compte</span>
        <ChevronDown size={16} aria-hidden="true" className={`text-anthracite/70 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Mon compte"
          className="absolute right-0 top-full z-40 mt-2 w-64 rounded-2xl bg-white p-2 shadow-[0_2px_6px_rgba(90,50,35,0.08),0_20px_44px_rgba(90,50,35,0.18)]"
        >
          <div className="flex items-center gap-3 border-b border-sable/30 px-2 pb-3 pt-1.5">
            {avatar("size-10 text-sm")}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-anthracite">{user?.name ?? "Mon compte"}</p>
              <p className="truncate text-xs text-anthracite/70">{roleLabel}</p>
            </div>
          </div>
          <div className="flex flex-col pt-2">
            <Link role="menuitem" href={dashboardHref} onClick={() => setOpen(false)} className={item}>
              <LayoutDashboard size={17} aria-hidden="true" />
              {dashboardLabel}
            </Link>
            <Link role="menuitem" href={profileHref} onClick={() => setOpen(false)} className={item}>
              <UserRound size={17} aria-hidden="true" />
              Mon profil
            </Link>
            {/* Nouvel onglet : l'espace reste ouvert ici, la session est partagée. */}
            <a role="menuitem" href="/" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className={item}>
              <ArrowUpRight size={17} aria-hidden="true" />
              Voir le site
              <span className="sr-only">(nouvel onglet)</span>
            </a>
            <button
              role="menuitem"
              type="button"
              onClick={handleLogout}
              className={`${item} text-left text-red-700 hover:bg-red-50 hover:text-red-800`}
            >
              <LogOut size={17} aria-hidden="true" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

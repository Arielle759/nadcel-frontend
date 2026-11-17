"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { UNIVERSES, universeHref } from "@/lib/universes";

// Liste des services pour la barre du site : catégories réellement proposées
// par les salons en ligne ; à défaut (API injoignable), les univers de l'accueil.
export function useServiceLinks(): { links: { label: string; href: string; count?: number }[] | null } {
  const { categories, error } = useCategories();
  if (categories) return { links: categories.map((c) => ({ label: c.name, href: universeHref(c.name), count: c.salons_count })) };
  if (error) return { links: UNIVERSES.map((u) => ({ label: u.label, href: universeHref(u.query) })) };
  return { links: null };
}

// Bouton « Services ▾ » : ouvre la liste des catégories. Se ferme au clic
// extérieur, avec Échap (le focus revient sur le bouton), au choix d'un lien
// et en changeant de page.
export default function ServicesMenu({ className }: { className: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const { links } = useServiceLinks();
  const pathname = usePathname();

  // Changement de page (retour arrière, etc.) : le menu se referme.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

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

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={menuId}
        className={`${className} inline-flex items-center gap-1.5`}
      >
        Services
        <ChevronDown size={16} aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute left-1/2 top-full z-50 mt-3 w-[22rem] -translate-x-1/2 rounded-2xl bg-white p-2 shadow-[0_2px_6px_rgba(90,50,35,0.08),0_20px_44px_rgba(90,50,35,0.18)]"
        >
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-anthracite/60">Que souhaitez-vous faire ?</p>
          {links === null ? (
            <div className="grid grid-cols-2 gap-1 p-1" aria-busy="true" aria-label="Chargement des services">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="h-10 animate-pulse rounded-xl bg-sable/20" />
              ))}
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-1 p-1">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 flex-col justify-center rounded-xl px-3 py-1.5 text-sm font-medium text-anthracite transition-colors hover:bg-beige hover:text-brand"
                  >
                    {link.label}
                    {link.count !== undefined && (
                      <span className="text-xs font-normal text-anthracite/60">
                        {link.count} salon{link.count > 1 ? "s" : ""}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/salons"
            onClick={() => setOpen(false)}
            className="mt-1 flex min-h-11 items-center justify-between rounded-xl border-t border-sable/30 px-3 text-sm font-semibold text-accent transition-colors hover:bg-beige"
          >
            Tous les salons
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}

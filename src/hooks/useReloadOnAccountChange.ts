"use client";

import { useEffect, useRef } from "react";
import { useCurrentUser } from "@/hooks/useAuthState";

// Connexion avec un autre compte dans un autre onglet : la session de ce
// navigateur a changé de propriétaire. Les données affichées appartiennent à
// l'ancien compte : on recharge la page pour repartir proprement (la mise en
// page renvoie ensuite vers l'espace du nouveau compte si ce n'est pas le même
// rôle). La déconnexion, elle, est gérée par la mise en page de chaque espace.
export function useReloadOnAccountChange(): void {
  const userId = useCurrentUser()?.id ?? null;
  const firstUserId = useRef(userId);
  useEffect(() => {
    if (firstUserId.current === null) firstUserId.current = userId;
    else if (userId !== null && userId !== firstUserId.current) window.location.reload();
  }, [userId]);
}

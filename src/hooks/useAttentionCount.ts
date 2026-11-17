import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";

// Compteur de la cloche : relu à chaque changement de page, pour qu'il suive
// les actions faites ailleurs (une demande confirmée, un salon validé…).
// En cas d'erreur, la cloche reste simplement sans pastille.
// url = null : pas d'appel (espace pas encore autorisé).
export function useAttentionCount<T>(url: string | null, pick: (data: T) => number): number | null {
  const pathname = usePathname();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!url) return;
    let active = true;
    api
      .get<T>(url)
      .then(({ data }) => {
        if (active) setCount(pick(data));
      })
      .catch(() => {
        if (active) setCount(null);
      });
    return () => {
      active = false;
    };
    // pick est une fonction fixe définie au niveau du module appelant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, pathname]);

  return count;
}

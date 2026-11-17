"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronRight, Inbox, MessageSquareWarning } from "lucide-react";
import { type AdminReview, type AdminSalon, useAdmin } from "@/hooks/useAdmin";

const CARD = "rounded-xl bg-beige";
const NEGATIVE_MAX_RATING = 2;

const dateFr = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

// Tout ce qui attend une action de l'administrateur, au même endroit :
// demandes de partenariat à examiner (comptées par la cloche) et derniers
// avis négatifs à lire (sans état « traité » : ils ne s'ajoutent pas à la cloche). Rien n'est
// stocké en plus : la page regroupe des données qui existent déjà.
export default function AdminNotificationsPage() {
  const { getPendingSalons, getReviews } = useAdmin();
  const [pending, setPending] = useState<AdminSalon[] | null>(null);
  const [reviews, setReviews] = useState<AdminReview[] | null>(null);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [salons, low] = await Promise.all([getPendingSalons(), getReviews(1, NEGATIVE_MAX_RATING)]);
      setPending(salons);
      setReviews(low.data.slice(0, 5));
      setReviewTotal(low.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les notifications.");
    }
  }, [getPendingSalons, getReviews]);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  const loading = pending === null || reviews === null;
  const nothing = !loading && pending.length === 0 && reviews.length === 0;

  return (
    <main className="flex flex-1 flex-col px-5 pb-10 pt-4 sm:px-8 md:pt-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <div>
          <h1 className="flex min-h-10 items-center font-sans text-[22px] font-medium tracking-tight text-anthracite">Notifications</h1>
          <p className="text-sm text-anthracite/70">Ce qui attend votre action sur la plateforme.</p>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        {loading && !error ? (
          <div className="flex flex-col gap-4" aria-busy="true" aria-label="Chargement des notifications">
            <div className="h-40 animate-pulse rounded-xl bg-beige" />
            <div className="h-40 animate-pulse rounded-xl bg-beige" />
          </div>
        ) : nothing ? (
          <p className={`${CARD} px-5 py-10 text-center text-sm text-anthracite/70`}>Rien à traiter pour le moment.</p>
        ) : (
          !loading && (
            <>
              <Group
                icon={<Inbox size={18} aria-hidden="true" />}
                title="Demandes de partenariat"
                count={pending.length}
                empty="Aucune demande en attente."
                href="/admin/salons"
                action="Examiner les demandes"
                items={pending.slice(0, 5).map((s) => ({
                  key: s.id,
                  primary: s.name,
                  secondary: `${s.city} · reçue le ${dateFr(s.created_at)}`,
                }))}
              />
              <Group
                icon={<MessageSquareWarning size={18} aria-hidden="true" />}
                title="Derniers avis négatifs"
                count={reviewTotal}
                empty="Aucun avis négatif."
                href="/admin/reviews?filtre=negatifs"
                action="Voir les avis négatifs"
                items={reviews.map((r) => ({
                  key: r.id,
                  primary: `${r.rating}/5 · ${r.salon?.name ?? "Salon"}`,
                  secondary: r.comment ? `« ${r.comment} »` : `Sans commentaire · ${dateFr(r.created_at)}`,
                }))}
              />
            </>
          )
        )}
      </div>
    </main>
  );
}

function Group({
  icon,
  title,
  count,
  empty,
  href,
  action,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  empty: string;
  href: string;
  action: string;
  items: { key: number; primary: string; secondary: string }[];
}) {
  return (
    <section aria-label={title} className={`${CARD} overflow-hidden`}>
      <div className="flex items-center gap-3 p-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sauge-light text-sauge-ink">{icon}</span>
        <h2 className="font-sans text-[17px] font-medium text-anthracite">{title}</h2>
        {count > 0 && <span className="ml-auto rounded-md bg-sauge-soft px-2 py-0.5 text-xs font-semibold text-sauge-ink">{count}</span>}
      </div>
      {items.length === 0 ? (
        <p className="border-t border-sable/40 px-5 py-4 text-sm text-anthracite/70">{empty}</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.key} className="border-t border-sable/40 px-5 py-3">
              <p className="truncate text-sm font-medium text-anthracite">{item.primary}</p>
              <p className="truncate text-xs text-anthracite/65">{item.secondary}</p>
            </li>
          ))}
        </ul>
      )}
      <Link
        href={href}
        className="flex min-h-11 items-center justify-between border-t border-sable/40 px-5 text-sm font-medium text-sauge-ink transition-colors hover:bg-sauge-light"
      >
        {action}
        <ChevronRight size={18} aria-hidden="true" />
      </Link>
    </section>
  );
}

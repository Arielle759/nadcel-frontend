"use client";

import { useCallback, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import { ui } from "@/lib/ui";

interface SalonReview {
  id: number;
  rating: number;
  comment: string | null;
  author: string;
  service: string | null;
  created_at: string | null;
}

interface ReviewsPage {
  data: SalonReview[];
  current_page: number;
  last_page: number;
  total: number;
}

function formatMonth(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} étoile${rating > 1 ? "s" : ""} sur 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={15}
          aria-hidden="true"
          className={value <= rating ? "fill-champagne text-champagne" : "fill-transparent text-sable"}
        />
      ))}
    </span>
  );
}

// Avis du salon, tels que laissés par les clientes après un rendez-vous
// terminé : toutes les notes sont montrées, les plus récentes d'abord.
export default function SalonReviews({
  salonId,
  average,
  count,
}: {
  salonId: number;
  average: string | number | null;
  count: number;
}) {
  const [reviews, setReviews] = useState<SalonReview[]>([]);
  const [page, setPage] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(count > 0);
  const [error, setError] = useState(false);

  const load = useCallback(
    async (next: number) => {
      setLoading(true);
      setError(false);
      try {
        const { data } = await api.get<ReviewsPage>(`/salons/${salonId}/reviews`, { params: { page: next } });
        setReviews((current) => (next === 1 ? data.data : [...current, ...data.data]));
        setPage(data.current_page);
        setLastPage(data.last_page);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [salonId]
  );

  useEffect(() => {
    if (count > 0) {
      queueMicrotask(() => {
        load(1);
      });
    }
  }, [count, load]);

  return (
    <section aria-labelledby="reviews-title" className="mt-14">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="reviews-title" className="text-2xl font-semibold tracking-tight text-brand sm:text-3xl">
          Avis
        </h2>
        {count > 0 && average !== null && (
          <p className="text-sm text-anthracite/75">
            <span className="text-lg font-semibold text-brand">{Number(average).toFixed(1).replace(".", ",")}</span> sur 5,{" "}
            {count} avis
          </p>
        )}
      </div>
      <p className="mt-2 text-sm text-anthracite/70">
        Laissés par des clientes venues au salon, après leur rendez-vous.
      </p>

      {count === 0 && <p className="mt-6 text-anthracite/75">Ce salon n&apos;a pas encore reçu d&apos;avis.</p>}

      {reviews.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {reviews.map((review) => (
            <li key={review.id} className={`${ui.surface} p-5`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Stars rating={review.rating} />
                <span className="text-xs text-anthracite/75">{formatMonth(review.created_at)}</span>
              </div>
              {review.comment && <p className="mt-3 leading-7 text-anthracite/90">{review.comment}</p>}
              <p className="mt-3 text-sm text-anthracite/70">
                <span className="font-semibold text-anthracite">{review.author}</span>
                {review.service && <>, {review.service}</>}
              </p>
            </li>
          ))}
        </ul>
      )}

      {loading && reviews.length === 0 && (
        <div className="mt-6 flex flex-col gap-3" aria-hidden="true">
          <div className="h-28 animate-pulse rounded-2xl bg-sable/15" />
          <div className="h-28 animate-pulse rounded-2xl bg-sable/15" />
        </div>
      )}

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-700">
          Impossible de charger les avis.{" "}
          <button type="button" onClick={() => load(page + 1 || 1)} className={ui.textLink}>
            Réessayer
          </button>
        </p>
      )}

      {page > 0 && page < lastPage && !error && (
        <button type="button" onClick={() => load(page + 1)} disabled={loading} className={`${ui.buttonSecondary} mt-5`}>
          {loading ? "Chargement..." : "Voir plus d'avis"}
        </button>
      )}
    </section>
  );
}

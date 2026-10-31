"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { AdminReview, useAdmin } from "@/hooks/useAdmin";
import ManagerPage from "@/components/manager/ManagerPage";
import ConfirmDelete from "@/components/ConfirmDelete";
import { ui } from "@/lib/ui";

// « ?filtre=negatifs » : lien direct depuis le tableau de bord.
const NEGATIVE_MAX_RATING = 2;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="tracking-[0.15em] text-champagne">
        {"★".repeat(rating)}
        <span className="text-anthracite/20">{"★".repeat(5 - rating)}</span>
      </span>
      <span className="sr-only">{rating} sur 5</span>
    </span>
  );
}

function ReviewsContent() {
  const router = useRouter();
  const negativeOnly = useSearchParams().get("filtre") === "negatifs";
  const { getReviews, deleteReview } = useAdmin();
  const [reviews, setReviews] = useState<AdminReview[] | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (nextPage: number) => {
      try {
        const result = await getReviews(nextPage, negativeOnly ? NEGATIVE_MAX_RATING : undefined);
        setReviews((current) => (nextPage === 1 ? result.data : [...(current ?? []), ...result.data]));
        setPage(result.current_page);
        setLastPage(result.last_page);
        setTotal(result.total);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger les avis.");
      }
    },
    [getReviews, negativeOnly]
  );

  useEffect(() => {
    queueMicrotask(() => {
      setReviews(null);
      load(1);
    });
  }, [load]);

  async function loadMore() {
    setLoadingMore(true);
    await load(page + 1);
    setLoadingMore(false);
  }

  async function remove(review: AdminReview) {
    await deleteReview(review.id);
    setReviews((current) => current?.filter((r) => r.id !== review.id) ?? null);
    setTotal((t) => t - 1);
  }

  return (
    <ManagerPage
      title="Avis"
      description="Les avis sont publiés sans validation préalable. Supprimez uniquement un contenu injurieux, hors sujet ou qui expose des données personnelles : un avis simplement négatif reste en ligne."
    >
      <div role="tablist" aria-label="Filtrer les avis" className="mb-6 inline-flex gap-1 rounded-full bg-white p-1 shadow-[0_1px_2px_rgba(45,59,40,0.05),0_8px_24px_rgba(45,59,40,0.07)]">
        {[
          { value: false, label: "Tous les avis" },
          { value: true, label: "Notes de 1 ou 2" },
        ].map(({ value, label }) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={negativeOnly === value}
            onClick={() => router.replace(value ? "/admin/reviews?filtre=negatifs" : "/admin/reviews")}
            className={`min-h-10 rounded-full px-4 text-sm font-semibold transition-colors ${
              negativeOnly === value ? "bg-forest text-beige" : "text-anthracite/75 hover:text-forest"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {reviews === null ? (
        !error && <div className="h-96 animate-pulse rounded-2xl bg-sage/15" aria-busy="true" aria-label="Chargement" />
      ) : reviews.length === 0 ? (
        <div className={`${ui.surface} p-8 text-center`}>
          <p className="font-semibold text-forest">Aucun avis</p>
          <p className="mt-1 text-sm text-anthracite/70">
            {negativeOnly ? "Aucun avis noté 1 ou 2 sur 5." : "Les avis laissés après un rendez-vous apparaîtront ici."}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-anthracite/65">
            {`${total.toLocaleString("fr-FR")} avis, les plus récents d'abord.`}
          </p>
          <ul className="flex flex-col gap-3">
            {reviews.map((review) => (
              <li key={review.id} className={`${ui.surface} p-5 sm:p-6`}>
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                  <div className="min-w-0">
                    <Stars rating={review.rating} />
                    <p className="mt-1 text-sm text-anthracite/75">
                      <span className="font-semibold text-anthracite">{review.client?.name ?? "Cliente"}</span> sur{" "}
                      {review.salon ? (
                        <Link href={`/salons/${review.salon.id}`} className={ui.textLink}>
                          {review.salon.name}
                        </Link>
                      ) : (
                        "un salon supprimé"
                      )}
                      , le {formatDate(review.created_at)}
                    </p>
                  </div>
                  <ConfirmDelete
                    question="Supprimer définitivement cet avis ?"
                    confirmLabel="Oui, supprimer l'avis"
                    onConfirm={() => remove(review)}
                  />
                </div>
                {review.comment ? (
                  <p className="mt-3 leading-7 text-anthracite/90">{review.comment}</p>
                ) : (
                  <p className="mt-3 text-sm italic text-anthracite/55">Note sans commentaire.</p>
                )}
                {review.manager_response && (
                  <div className="mt-4 rounded-xl bg-beige px-4 py-3">
                    <p className="text-xs font-semibold text-forest">Réponse du salon</p>
                    <p className="mt-1 text-sm leading-6 text-anthracite/85">{review.manager_response}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {page < lastPage && (
            <div className="mt-6 flex justify-center">
              <button type="button" onClick={loadMore} disabled={loadingMore} className={ui.buttonSecondary}>
                {loadingMore ? "Chargement..." : "Afficher plus d'avis"}
              </button>
            </div>
          )}
        </>
      )}
    </ManagerPage>
  );
}

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={null}>
      <ReviewsContent />
    </Suspense>
  );
}

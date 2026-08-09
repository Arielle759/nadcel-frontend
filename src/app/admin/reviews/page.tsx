"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { AdminReview, useAdmin } from "@/hooks/useAdmin";
import EmptyState from "@/components/EmptyState";

function formatReviewDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString("fr-FR");
}

export default function AdminReviewsPage() {
  const { getReviews, deleteReview } = useAdmin();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReviews();
      setReviews(data);
    } catch {
      setError("Impossible de charger les avis.");
    } finally {
      setLoading(false);
    }
  }, [getReviews]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchReviews();
    });
  }, [fetchReviews]);

  async function handleDelete(id: number) {
    if (!window.confirm("Supprimer cet avis ?")) return;
    setDeletingId(id);
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-8 bg-gradient-to-br from-beige to-sage/20 px-6 py-12 sm:px-16">
      <Link href="/admin/dashboard" className="self-start text-sm text-link-sage hover:underline">
        ← Retour au tableau de bord
      </Link>

      <h1 className="text-3xl font-semibold tracking-tight text-forest">Avis</h1>

      {loading && <p className="text-anthracite/75">Chargement des avis...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && reviews.length === 0 && (
        <EmptyState message="Aucun avis à modérer." icon={MessageSquare} />
      )}

      <ul className="flex flex-col gap-4 border-t-4 border-t-champagne pt-4">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="flex flex-col gap-3 rounded-lg border border-sage/30 bg-beige p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-anthracite">
                {review.salon.name}{" "}
                <span className="text-anthracite/75">— {review.client.name}</span>
              </p>
              <p className="text-sm text-anthracite/75">
                <span className="text-champagne">★</span> {review.rating}/5
              </p>
              <p className="text-sm text-anthracite/75">{review.comment}</p>
              <p className="text-xs text-anthracite/75">{formatReviewDate(review.created_at)}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDelete(review.id)}
                disabled={deletingId === review.id}
                className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-90 disabled:opacity-50"
              >
                {deletingId === review.id ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

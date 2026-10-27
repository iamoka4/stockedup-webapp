"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getVendorReviews, type VendorReview } from "@/lib/api/vendor";

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i <= rating ? "#FFD700" : "#e5e7eb"}
        >
          <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
        </svg>
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<number | "all">("all");

  async function load(isRefresh = false) {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      setReviews(await getVendorReviews());
    } catch {
      setError("Could not load reviews. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    const distribution = [5, 4, 3, 2, 1].map((star) => reviews.filter((r) => r.rating === star).length);
    return { total, avg, distribution };
  }, [reviews]);

  const filtered = useMemo(
    () => (filter === "all" ? reviews : reviews.filter((r) => r.rating === filter)),
    [reviews, filter],
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-bg">
      <div className="border-b border-gray-200 dark:border-line bg-white dark:bg-bg-raised px-5 pb-5 pt-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/merchants/menu" className="text-xs font-semibold text-brand hover:underline">
              ← Menu
            </Link>
            <h1 className="font-display mt-1 text-3xl font-extrabold">Customer Reviews</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-ink-soft">See what buyers are saying about your products</p>
          </div>
          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing || loading}
            className="rounded-xl border border-brand bg-white dark:bg-bg-raised px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 disabled:opacity-60"
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="size-9 animate-spin rounded-full border-4 border-gray-200 dark:border-line border-t-brand" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 dark:border-clay bg-red-50 dark:bg-clay-tint p-5 text-sm text-red-700 dark:text-clay">
            {error}{" "}
            <button onClick={() => load()} className="font-semibold underline">
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Overview */}
            <div className="flex flex-col gap-8 rounded-2xl border border-line bg-white dark:bg-bg-raised p-6 md:flex-row md:items-center md:p-8">
              <div className="flex flex-col items-center gap-2 md:w-44">
                <span className="text-6xl font-black text-gray-800 dark:text-ink">{stats.avg.toFixed(1)}</span>
                <Stars rating={Math.round(stats.avg)} size={22} />
                <span className="text-sm text-gray-400 dark:text-ink-soft">
                  {stats.total} review{stats.total === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star, i) => {
                  const count = stats.distribution[i];
                  const pct = stats.total ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2.5 text-sm">
                      <span className="w-3 text-gray-700 dark:text-ink-soft">{star}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFD700">
                        <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
                      </svg>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-bg-elevated">
                        <div className="h-full rounded-full bg-[#FFD700]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs text-gray-400 dark:text-ink-soft">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {(["all", 5, 4, 3, 2, 1] as (number | "all")[]).map((f) => {
                const count = f === "all" ? reviews.length : reviews.filter((r) => r.rating === f).length;
                const active = filter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`rounded-full border px-4 py-2 text-[13px] font-medium transition ${
                      active
                        ? "border-brand bg-brand text-white"
                        : "border-gray-200 dark:border-line bg-white dark:bg-bg-raised text-gray-600 dark:text-ink-soft hover:border-brand"
                    }`}
                  >
                    {f === "all" ? "All" : `${f} ★`} · {count}
                  </button>
                );
              })}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-xl font-semibold text-gray-800 dark:text-ink">
                  {reviews.length === 0 ? "No reviews yet" : "No reviews for this rating"}
                </p>
                <p className="mt-2 text-sm text-gray-400 dark:text-ink-soft">
                  {reviews.length === 0 ? "Customer reviews will appear here" : "Try a different filter"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filtered.map((r) => {
                  const name = r.customer_name || `Customer #${r.user_id}`;
                  const approved = r.status === "approved";
                  return (
                    <article key={r.id} className="rounded-2xl border border-line bg-white dark:bg-bg-raised p-5">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
                          {name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-semibold text-gray-800 dark:text-ink">{name}</p>
                          <p className="text-xs text-gray-400 dark:text-ink-soft">
                            {new Date(r.review_date || r.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Stars rating={r.rating} />
                      </div>
                      {r.product_name && (
                        <span className="mb-2.5 inline-block rounded-md bg-brand/10 px-2 py-1 text-[11px] font-semibold text-brand">
                          {r.product_name}
                        </span>
                      )}
                      <p className="text-sm leading-6 text-gray-600 dark:text-ink-soft">{r.review_text}</p>
                      <span
                        className={`mt-3 inline-block rounded-md px-2 py-1 text-[11px] font-semibold capitalize ${
                          approved ? "bg-green-100 dark:bg-leaf-tint text-green-600 dark:text-leaf" : "bg-orange-100 dark:bg-brand-tint text-orange-500"
                        }`}
                      >
                        {r.status || "pending"}
                      </span>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
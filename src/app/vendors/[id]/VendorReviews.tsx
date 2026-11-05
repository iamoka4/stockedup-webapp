"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  getStoreReviews,
  getVendorProductReviews,
  submitStoreReview,
  type ProductReviewsData,
  type StoreReviewsData,
} from "@/lib/api/reviews";
import { ApiError } from "@/lib/api/client";

const PER_PAGE = 10;
// Matches the 1000-character limit used by the mobile app and the backend
const MAX_REVIEW_LENGTH = 1000;

// Adjust this to match your web product route
const productHref = (productId: number) => `/products/${productId}`;

type Tab = "store" | "products";

function getInitials(name?: string | null) {
  const initials = (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return initials || "?";
}

function StarRow({ rating, className = "text-sm" }: { rating: number; className?: string }) {
  const filled = Math.round(Number(rating) || 0);
  return (
    <span className={`inline-flex leading-none ${className}`} aria-label={`${filled} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= filled ? "text-amber-400" : "text-line"}>
          ★
        </span>
      ))}
    </span>
  );
}

function RatingSummary({
  average,
  total,
  breakdown,
}: {
  average: number;
  total: number;
  breakdown: Record<number, number>;
}) {
  const safeTotal = total || 1;
  return (
    <div className="mb-4 flex gap-5 rounded-2xl border border-line bg-bg-raised p-4">
      <div className="flex min-w-20 flex-col items-center justify-center">
        <span className="font-display text-4xl font-bold leading-none text-brand">
          {average.toFixed(1)}
        </span>
        <StarRow rating={average} className="mt-2 text-sm" />
        <span className="mt-1 text-[11px] text-ink-soft">
          {total} review{total === 1 ? "" : "s"}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = Number(breakdown?.[star] ?? 0);
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="w-2.5 text-right text-[11px] text-ink-soft">{star}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.round((count / safeTotal) * 100)}%` }}
                />
              </div>
              <span className="w-5 text-right text-[10px] text-ink-soft">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewCard({
  name,
  avatar,
  rating,
  date,
  text,
  product,
}: {
  name: string | null;
  avatar: string | null;
  rating: number;
  date: string;
  text: string | null;
  product?: { id: number; name: string };
}) {
  return (
    <div className="rounded-2xl border border-line bg-bg-raised p-4">
      <div className="flex items-center gap-3">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="size-9 rounded-full object-cover" />
        ) : (
          <span className="grid size-9 place-items-center rounded-full bg-brand text-xs font-bold text-white">
            {getInitials(name)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">
            {name?.trim() || "StockedUp customer"}
          </p>
          <p className="text-[11px] text-ink-soft">{date}</p>
        </div>
        <StarRow rating={rating} />
      </div>

      {product && (
        <Link
          href={productHref(product.id)}
          className="mt-3 inline-block max-w-full truncate rounded-lg bg-brand-tint px-2.5 py-1 text-xs font-semibold text-brand hover:underline"
        >
          🛍️ {product.name}
        </Link>
      )}

      {text?.trim() ? <p className="mt-3 text-sm leading-relaxed text-ink-soft">{text}</p> : null}
    </div>
  );
}

function LoadMore({
  loading,
  onClick,
}: {
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex justify-center pt-2">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="rounded-xl border-2 border-brand px-8 py-2.5 text-sm font-semibold text-brand hover:bg-brand-tint disabled:opacity-60"
      >
        {loading ? "Loading…" : "Load more reviews"}
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-8">
      <span className="size-6 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>
  );
}

export function VendorReviews({
  vendorId,
  initialStore,
}: {
  vendorId: number;
  /** Public first page fetched on the server (no sign-in), for fast render + SEO. */
  initialStore: StoreReviewsData | null;
}) {
  const [tab, setTab] = useState<Tab>("store");

  // Store reviews
  const [store, setStore] = useState<StoreReviewsData | null>(initialStore);
  const [storeLoading, setStoreLoading] = useState(!initialStore);
  const [storeError, setStoreError] = useState(false);
  const [storeMoreLoading, setStoreMoreLoading] = useState(false);

  // Product reviews
  const [products, setProducts] = useState<ProductReviewsData | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(false);
  const [productsMoreLoading, setProductsMoreLoading] = useState(false);

  // Review form
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const loadStore = useCallback(
    async (page: number) => {
      if (page === 1) setStoreError(false);
      else setStoreMoreLoading(true);
      try {
        const d = await getStoreReviews(vendorId, page, PER_PAGE);
        setStore((prev) =>
          page === 1 || !prev ? d : { ...d, reviews: [...prev.reviews, ...d.reviews] }
        );
      } catch {
        // If we already have server-rendered data, keep showing it.
        if (page === 1 && !initialStore) setStoreError(true);
      } finally {
        setStoreLoading(false);
        setStoreMoreLoading(false);
      }
    },
    [vendorId, initialStore]
  );

  const loadProducts = useCallback(
    async (page: number) => {
      if (page === 1) {
        setProductsError(false);
        setProductsLoading(true);
      } else {
        setProductsMoreLoading(true);
      }
      try {
        const d = await getVendorProductReviews(vendorId, page, PER_PAGE);
        setProducts((prev) =>
          page === 1 || !prev ? d : { ...d, reviews: [...prev.reviews, ...d.reviews] }
        );
      } catch {
        if (page === 1) {
          setProducts(null);
          setProductsError(true);
        }
      } finally {
        setProductsLoading(false);
        setProductsMoreLoading(false);
      }
    },
    [vendorId]
  );

  // Refetch on mount: the browser request carries the buyer's session, so
  // `can_review` / `eligible_order_id` are accurate for the signed-in user.
  useEffect(() => {
    loadStore(1);
    loadProducts(1);
  }, [loadStore, loadProducts]);

  async function handleSubmit() {
    if (!store?.eligible_order_id) return;
    if (rating === 0) {
      setFormError("Please select a rating.");
      return;
    }
    if (!comment.trim()) {
      setFormError("Please write a comment.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await submitStoreReview({
        vendorId,
        orderId: store.eligible_order_id,
        rating,
        comment: comment.trim(),
      });
      setSubmitted(true);
      setRating(0);
      setComment("");
      await loadStore(1);
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const storeTotal = Number(store?.total_reviews) || 0;
  const storeAvg = Number(store?.average_rating) || 0;
  const productTotal = Number(products?.total_reviews) || 0;
  const productAvg = Number(products?.average_rating) || 0;

  const storeHasMore = !!store && store.pagination.current_page < store.pagination.total_pages;
  const productsHasMore =
    !!products && products.pagination.current_page < products.pagination.total_pages;

  const showForm = !!store?.can_review && !!store.eligible_order_id;

  return (
    <section id="reviews" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-12">
      <h2 className="font-display text-xl font-semibold text-ink">Reviews</h2>
      <p className="mb-4 mt-1 text-xs text-ink-soft">
        {tab === "store"
          ? `${storeTotal} verified review${storeTotal === 1 ? "" : "s"} of this store`
          : "What buyers say about this vendor's products"}
      </p>

      {/* Review form: only for buyers with a completed, unreviewed order here */}
      {submitted && !showForm && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700 dark:border-leaf dark:bg-leaf-tint dark:text-leaf">
          Thanks for rating this store! It will appear after approval.
        </div>
      )}

      {showForm && (
        <div className="mb-5 rounded-2xl border border-line bg-bg-raised p-4">
          <h3 className="text-sm font-semibold text-ink">Rate this store</h3>

          <div className="mt-3 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                className={`text-3xl leading-none transition-transform hover:scale-110 ${
                  star <= rating ? "text-amber-400" : "text-line"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, MAX_REVIEW_LENGTH))}
            maxLength={MAX_REVIEW_LENGTH}
            rows={3}
            placeholder="Share your experience with this store..."
            aria-label="Your review"
            className="mt-3 w-full resize-none rounded-xl border border-line bg-bg p-3 text-sm text-ink placeholder:text-ink-soft focus:border-brand focus:outline-none"
          />
          <p className="mt-1 text-right text-[11px] text-ink-soft">
            {comment.length}/{MAX_REVIEW_LENGTH}
          </p>

          {formError && <p className="mb-2 text-sm text-clay">{formError}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex rounded-xl border border-line bg-bg p-1" role="tablist">
        {(
          [
            ["store", `Store${store ? ` (${storeTotal})` : ""}`],
            ["products", `Products${products ? ` (${productTotal})` : ""}`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              tab === key ? "bg-bg-raised text-brand shadow-sm" : "text-ink-soft hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Product reviews tab ── */}
      {tab === "products" &&
        (productsLoading ? (
          <Spinner />
        ) : products && productTotal > 0 ? (
          <>
            <RatingSummary
              average={productAvg}
              total={productTotal}
              breakdown={products.rating_breakdown}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {products.reviews.map((r) => (
                <ReviewCard
                  key={r.id}
                  name={r.reviewer_name}
                  avatar={r.reviewer_avatar}
                  rating={r.rating}
                  date={r.date}
                  text={r.review_text}
                  product={{ id: r.product_id, name: r.product_name }}
                />
              ))}
            </div>
            {productsHasMore && (
              <div className="mt-4">
                <LoadMore
                  loading={productsMoreLoading}
                  onClick={() => loadProducts(products.pagination.current_page + 1)}
                />
              </div>
            )}
          </>
        ) : productsError ? (
          <div className="py-8 text-center">
            <p className="text-sm text-ink-soft">Couldn&apos;t load product reviews right now.</p>
            <button
              type="button"
              onClick={() => loadProducts(1)}
              className="mt-3 rounded-xl border-2 border-brand px-6 py-2 text-sm font-semibold text-brand hover:bg-brand-tint"
            >
              Try again
            </button>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-ink-soft">
            No product reviews yet. Buyers&apos; reviews of this vendor&apos;s products will show here.
          </p>
        ))}

      {/* ── Store reviews tab ── */}
      {tab === "store" &&
        (storeLoading ? (
          <Spinner />
        ) : store && storeTotal > 0 ? (
          <>
            <RatingSummary average={storeAvg} total={storeTotal} breakdown={store.rating_breakdown} />
            <div className="grid gap-3 sm:grid-cols-2">
              {store.reviews.map((r) => (
                <ReviewCard
                  key={r.id}
                  name={r.reviewer_name}
                  avatar={r.reviewer_avatar}
                  rating={r.rating}
                  date={r.date}
                  text={r.comment}
                />
              ))}
            </div>
            {storeHasMore && (
              <div className="mt-4">
                <LoadMore
                  loading={storeMoreLoading}
                  onClick={() => loadStore(store.pagination.current_page + 1)}
                />
              </div>
            )}
          </>
        ) : storeError ? (
          <div className="py-8 text-center">
            <p className="text-sm text-ink-soft">Couldn&apos;t load reviews right now.</p>
            <button
              type="button"
              onClick={() => loadStore(1)}
              className="mt-3 rounded-xl border-2 border-brand px-6 py-2 text-sm font-semibold text-brand hover:bg-brand-tint"
            >
              Try again
            </button>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-ink-soft">
            No reviews yet. Be the first to review this store!
          </p>
        ))}
    </section>
  );
}
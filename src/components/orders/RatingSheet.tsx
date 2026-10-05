"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { submitReview, type Order } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";

const LABELS: Record<number, { text: string; emoji: string; color: string }> = {
  1: { text: "Poor", emoji: "😞", color: "text-red-600 bg-red-50" },
  2: { text: "Fair", emoji: "😐", color: "text-orange-600 bg-orange-50" },
  3: { text: "Good", emoji: "🙂", color: "text-yellow-700 bg-yellow-50" },
  4: { text: "Very Good", emoji: "😊", color: "text-green-600 bg-green-50" },
  5: { text: "Excellent", emoji: "🤩", color: "text-green-700 bg-green-50" },
};

function Stars({
  rating,
  onRate,
  large = false,
}: {
  rating: number;
  onRate: (r: number) => void;
  large?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onRate(i)}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          className={`${large ? "text-4xl" : "text-3xl"} leading-none transition-transform hover:scale-110 ${
            i <= rating ? "text-amber-400" : "text-line"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function LabelPill({ rating }: { rating: number }) {
  const l = LABELS[rating];
  if (!l) return null;
  return (
    <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${l.color}`}>
      <span>{l.emoji}</span>
      {l.text}
    </span>
  );
}

/**
 * Two-step rating flow, same as the mobile app: rate the vendor (optional),
 * then rate every product. A bottom sheet on phones, a centred modal on
 * larger screens. Open it by passing an order; close by passing null.
 */
export function RatingSheet({
  order,
  onDismiss,
  onComplete,
}: {
  order: Order | null;
  onDismiss: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState<"vendor" | "products" | "done">("vendor");
  const [vendorRating, setVendorRating] = useState(0);
  const [productRatings, setProductRatings] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderId = order?.order_id;

  // Reset whenever a different order is opened.
  useEffect(() => {
    setStep("vendor");
    setVendorRating(0);
    setProductRatings({});
    setError(null);
  }, [orderId]);

  // Escape closes; background scroll is locked while open.
  useEffect(() => {
    if (!order) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onDismiss();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [order, onDismiss]);

  if (!order) return null;

  const ratedCount = order.items.filter((i) => (productRatings[i.product_id] ?? 0) > 0).length;
  const allRated = ratedCount === order.items.length;

  async function handleSubmit() {
    if (!order) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitReview({
        order_id: order.order_id,
        vendor_id: order.vendor_id,
        vendor_rating: vendorRating || null,
        product_reviews: order.items.map((i) => ({
          product_id: i.product_id,
          rating: productRatings[i.product_id] ?? 0,
          review_text: "",
        })),
      });
      setStep("done");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4">
      <button type="button" aria-label="Close" onClick={onDismiss} className="absolute inset-0 bg-black/50" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Rate your order"
        className="relative flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-bg-raised shadow-xl md:rounded-3xl"
      >
        {step === "done" ? (
          <div className="flex flex-col items-center px-8 py-10 text-center">
            <span className="text-6xl">🎉</span>
            <h2 className="mt-4 font-display text-2xl font-bold text-ink">Thank you!</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Your feedback helps other buyers make better choices.
            </p>
            <button
              type="button"
              onClick={onComplete}
              className="mt-8 rounded-xl bg-brand px-10 py-3 font-semibold text-white hover:bg-brand-deep"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              {step === "products" && (
                <button
                  type="button"
                  onClick={() => setStep("vendor")}
                  aria-label="Back"
                  className="grid size-8 place-items-center rounded-full bg-bg text-ink-soft hover:text-ink"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-base font-semibold text-ink">
                  {step === "vendor" ? "Rate your order" : "Rate products"}
                </h2>
                <p className="text-xs text-ink-soft">
                  {step === "vendor"
                    ? `#${order.order_uid}`
                    : `${ratedCount}/${order.items.length} rated`}
                </p>
              </div>
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Close"
                className="grid size-8 place-items-center rounded-full bg-bg text-ink-soft hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              {step === "vendor" ? (
                <>
                  <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-3 text-center text-sm font-semibold text-green-700">
                    📦 Order delivered successfully
                  </div>

                  <div className="flex flex-col items-center rounded-2xl border border-line bg-bg p-5 text-center">
                    <span className="grid size-14 place-items-center rounded-full bg-brand-tint text-3xl">🏪</span>
                    <p className="mt-3 font-semibold text-ink">How was the vendor?</p>
                    <p className="mb-4 mt-1 text-xs text-ink-soft">This is optional — you can skip</p>
                    <Stars rating={vendorRating} onRate={setVendorRating} large />
                    <LabelPill rating={vendorRating} />
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep("products")}
                      className="flex-1 rounded-xl bg-bg py-3 text-sm font-semibold text-ink-soft hover:text-ink"
                    >
                      Skip
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("products")}
                      className="flex-[2] rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-deep"
                    >
                      Next → Rate products
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{
                        width: `${order.items.length ? (ratedCount / order.items.length) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    {order.items.map((item, index) => {
                      const r = productRatings[item.product_id] ?? 0;
                      return (
                        <div key={item.product_id} className="rounded-2xl border border-line bg-bg p-4">
                          <div className="flex items-center gap-3">
                            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-tint text-lg">
                              🛍️
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-semibold uppercase text-ink-soft">Item {index + 1}</p>
                              <p className="line-clamp-2 text-sm font-semibold text-ink">{item.name}</p>
                              <p className="text-[11px] text-ink-soft">Qty: {item.quantity}</p>
                            </div>
                            {r > 0 && (
                              <span className="grid size-6 place-items-center rounded-full bg-green-500 text-xs font-bold text-white">
                                ✓
                              </span>
                            )}
                          </div>
                          <div className="mt-3 flex flex-col items-center">
                            <Stars
                              rating={r}
                              onRate={(rating) =>
                                setProductRatings((prev) => ({ ...prev, [item.product_id]: rating }))
                              }
                            />
                            <LabelPill rating={r} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {error && <p className="mt-4 text-sm text-clay">{error}</p>}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!allRated || submitting}
                    className="mt-4 w-full rounded-xl bg-brand py-3.5 text-sm font-semibold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft"
                  >
                    {submitting
                      ? "Submitting…"
                      : allRated
                        ? "🎉 Submit all ratings"
                        : `Rate all ${order.items.length} products to continue`}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
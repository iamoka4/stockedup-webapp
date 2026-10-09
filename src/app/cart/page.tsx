"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { useCart, getLineTotal } from "@/lib/hooks/useCart";
import { useUpdateCart } from "@/lib/hooks/useUpdateCart"; // adjust path
import { useAuth } from "@/lib/auth/AuthContext";
import { useAuthModalStore } from "@/store/authModalStore";
import { useProcessingFee } from "@/app/checkout/useProcessingFee"; // adjust path
import type { CartItem } from "@/lib/api/types";

const DELIVERY_FEE = 0; // same as mobile: real fee is quoted at checkout
const MAX_QTY = 25; // backend limit in update-cart.php

// Product pages live at /products/[id]. Edit mode is the ?editCartId= param.
const productHref = (item: CartItem) =>
  `/products/${item.product_id}?editCartId=${item.id}`;

const formatPrice = (n: number) => "₦" + n.toLocaleString("en-NG");

type Action = "increment" | "decrement" | "remove";

// Each row owns its own useUpdateCart instance, so the spinner and error
// only affect the row being changed (mirrors mobile's CartItemRow).
const CartItemRow = memo(function CartItemRow({ item }: { item: CartItem }) {
  const { updateCart } = useUpdateCart();
  const [loadingAction, setLoadingAction] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addons = item.addons ?? [];
  const lineTotal = getLineTotal(item);
  const maxQty = Math.min(
    MAX_QTY,
    typeof item.stock === "number" && item.stock > 0 ? item.stock : MAX_QTY
  );
  const busy = loadingAction !== null;

  function handleAction(action: Action, newQty: number) {
    setError(null);
    setLoadingAction(action);

    updateCart(
      { cart_id: item.id, quantity: newQty },
      {
        onSuccess: () => setLoadingAction(null),
        onError: (err) => {
          setLoadingAction(null);
          setError(
            err instanceof Error ? err.message : "Couldn't update this item. Please try again."
          );
        },
      }
    );
  }

  return (
    <li className="rounded-2xl border border-line bg-bg-raised p-4">
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.name}
          className="h-[70px] w-[70px] shrink-0 rounded-xl bg-brand-tint object-cover"
        />

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold text-ink">{item.name}</p>
          <p className="text-xs text-ink-soft">{formatPrice(item.price)} each</p>
          <p className="tabular text-xs font-semibold text-ink">
            Subtotal: {formatPrice(lineTotal)}
          </p>

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => handleAction("remove", 0)}
              disabled={busy}
              className="flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs text-clay hover:border-clay disabled:opacity-50"
            >
              <Trash2 size={12} />
              {loadingAction === "remove" ? "Removing…" : "Remove"}
            </button>

            <Link
              href={productHref(item)}
              className="flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs font-medium text-ink hover:border-brand"
            >
              <Pencil size={12} />
              Edit
            </Link>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleAction("increment", item.quantity + 1)}
            disabled={busy || item.quantity >= maxQty}
            aria-label={`Increase ${item.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-brand-deep hover:bg-brand-tint disabled:opacity-40"
          >
            <Plus size={14} />
          </button>
          <span className="tabular min-w-5 text-center text-sm font-bold text-ink">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => handleAction("decrement", item.quantity - 1)}
            disabled={busy || item.quantity <= 1}
            aria-label={`Decrease ${item.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-brand-deep hover:bg-brand-tint disabled:opacity-40"
          >
            <Minus size={14} />
          </button>
        </div>
      </div>

      {/* Extras / add-ons breakdown */}
      {addons.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-xl bg-brand-tint p-2.5">
          {addons.map((addon, idx) => (
            <li
              key={`${item.id}-addon-${addon.addon_option_id ?? "deleted"}-${idx}`}
              className="flex justify-between gap-3 text-xs text-ink"
            >
              <span className="truncate">
                + {addon.name} ×{addon.quantity}
              </span>
              <span className="tabular font-semibold">
                {formatPrice(addon.total_price ?? 0)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Special request */}
      {item.special_request && (
        <p className="mt-2 line-clamp-2 text-xs italic text-ink-soft">
          📝 &ldquo;{item.special_request}&rdquo;
        </p>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-clay">
          {error}
        </p>
      )}
    </li>
  );
});

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const openLogin = useAuthModalStore((s) => s.openLogin);
  const { data: cart, isLoading, error, refetch } = useCart();

  // cart.subtotal already includes add-ons (see getLineTotal in useCart).
  const subtotal = cart?.subtotal ?? 0;

  const {
    fee: processingFee,
    loading: processingFeeLoading,
    error: processingFeeError,
  } = useProcessingFee(subtotal);

  const total = subtotal + (processingFee ?? 0) + DELIVERY_FEE;

  // The processing fee here is only a preview. Checkout works out the real
  // fees, so a slow or failed preview must never stop someone checking out.
  function handleCheckout() {
    if (!user) {
      openLogin("/checkout");
      return;
    }
    router.push("/checkout");
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-ink-soft">
        Loading your cart…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
        <p className="font-display text-xl font-semibold text-clay">Failed to load cart</p>
        <p className="mt-2 text-sm text-ink-soft">Please check your connection.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-5 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-deep"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
        <p className="font-display text-2xl font-semibold text-ink">Your cart is empty</p>
        <p className="mt-2 text-sm text-ink-soft">Add some products to get started!</p>
        <Link
          href="/"
          className="mt-5 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-deep"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const itemCount = cart.items.length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-5 flex items-baseline justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">Your cart</h1>
        <p className="text-sm text-ink-soft">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      <ul className="space-y-3">
        {cart.items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </ul>

      <section className="mt-6 rounded-2xl border border-line bg-bg-raised p-4">
        <h2 className="text-sm font-bold text-ink">Order summary</h2>

        <div className="mt-3 space-y-1 border-b border-line pb-3 text-sm">
          <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
          <SummaryRow
            label="Processing fee"
            value={
              processingFeeLoading
                ? "Calculating…"
                : processingFeeError
                  ? "Calculated at checkout"
                  : formatPrice(processingFee ?? 0)
            }
          />
          <SummaryRow label="Delivery fee" value={formatPrice(DELIVERY_FEE)} />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold text-ink">Total</span>
          <span className="tabular font-display text-xl font-semibold text-brand-deep">
            {formatPrice(total)}
          </span>
        </div>

        {processingFeeError && (
          <p className="mt-2 text-xs text-ink-soft">
            We&apos;ll confirm the processing fee and delivery fee at checkout.
          </p>
        )}

        <button
          type="button"
          onClick={handleCheckout}
          className="mt-4 w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
        >
          Proceed to checkout
        </button>
      </section>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-soft">{label}</span>
      <span className="tabular font-medium text-ink">{value}</span>
    </div>
  );
}
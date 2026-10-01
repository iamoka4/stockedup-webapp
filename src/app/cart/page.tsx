"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { useCart, getLineTotal } from "@/lib/hooks/useCart";
import { useUpdateCart } from "@/lib/hooks/useUpdateCart";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAuthModalStore } from "@/store/authModalStore";
import type { CartItem } from "@/lib/api/types";

const MAX_QTY = 25; // backend limit in update-cart.php / add-to-cart.php

// Edit mode is handled by AddToCartPanel via ?editCartId=
const productHref = (item: CartItem) =>
  `/products/${item.product_id}?editCartId=${item.id}`;

const formatPrice = (n: number) => "₦" + n.toLocaleString("en-NG");

export default function CartPage() {
  const { data: cart, isLoading, isError, refetch } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const openLogin = useAuthModalStore((s) => s.openLogin);

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-ink-soft">Loading your cart…</div>;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Couldn&apos;t load your cart</h1>
        <p className="mt-2 text-ink-soft">
          Something went wrong fetching your cart. Your items are safe — try again.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-deep"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Your cart is empty</h1>
        <p className="mt-2 text-ink-soft">Add something fresh from a vendor near you.</p>
        <Link
          href="/vendors"
          className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-deep"
        >
          Browse vendors
        </Link>
      </div>
    );
  }

  function handleCheckout() {
    // Checkout requires an account — matches the product decision that
    // guests can browse and cart, but must register/login to place an
    // order. Cart is preserved: login.php/register.php merge the guest
    // cart into the account automatically once they sign in.
    if (user) {
      router.push("/checkout");
    } else {
      openLogin("/checkout");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Your cart</h1>

      <div className="mt-6 flex flex-col gap-4">
        {cart.items.map((item) => (
          // Key by the cart ROW id: the same product can appear on several
          // rows with different extras.
          <CartRow key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
        <span className="text-ink-soft">Subtotal</span>
        {/* cart.subtotal already includes extras (see getLineTotal in useCart) */}
        <span className="tabular font-display text-2xl font-semibold text-ink">
          {formatPrice(cart.subtotal)}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-soft">
        Delivery fee and any processing fee are calculated at checkout.
      </p>

      <button
        type="button"
        onClick={handleCheckout}
        className="mt-6 w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white hover:bg-brand-deep"
      >
        {user ? "Proceed to checkout" : "Sign in to check out"}
      </button>
    </div>
  );
}

type Action = "increment" | "decrement" | "remove";

// Each row owns its own useUpdateCart instance, so the busy state and any
// error only affect the row being changed.
const CartRow = memo(function CartRow({ item }: { item: CartItem }) {
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
    <div className="rounded-2xl border border-line bg-bg-raised p-3">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-tint">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-medium text-ink">{item.name}</p>
          <p className="tabular text-sm text-ink-soft">{formatPrice(item.price)} each</p>
          <p className="tabular text-xs font-semibold text-ink">
            Item total: {formatPrice(lineTotal)}
          </p>
          <Link
            href={productHref(item)}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-deep hover:underline"
          >
            <Pencil size={11} />
            Edit
          </Link>
        </div>

        <div className="flex items-center rounded-full border border-line">
          <button
            type="button"
            onClick={() => handleAction("decrement", item.quantity - 1)}
            disabled={busy || item.quantity <= 1}
            className="flex h-8 w-8 items-center justify-center text-ink-soft hover:text-ink disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="tabular w-6 text-center text-sm">{item.quantity}</span>
          <button
            type="button"
            onClick={() => handleAction("increment", item.quantity + 1)}
            disabled={busy || item.quantity >= maxQty}
            className="flex h-8 w-8 items-center justify-center text-ink-soft hover:text-ink disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => handleAction("remove", 0)}
          disabled={busy}
          aria-label={`Remove ${item.name} from cart`}
          className="text-ink-soft hover:text-clay disabled:opacity-40"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Extras breakdown (server-computed totals) */}
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
    </div>
  );
});
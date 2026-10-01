"use client";

import { useQuery } from "@tanstack/react-query";
import { getCart } from "@/lib/api/cart";
import { useAuth } from "@/lib/auth/AuthContext";
import type { CartItem } from "@/lib/api/types";

/** Sum of the server-computed add-on totals for one cart row. */
export function cartItemAddonsTotal(item: CartItem): number {
  return (item.addons ?? []).reduce((sum, a) => sum + a.total_price, 0);
}

/** Full line total: product price x quantity, plus its add-ons. */
export function getLineTotal(item: CartItem): number {
  return item.quantity * item.price + cartItemAddonsTotal(item);
}

/** Alias kept so either name works across the codebase. */
export const cartItemTotal = getLineTotal;

/**
 * Single source of truth for the cart's cache key. Scoped per user so a
 * login/logout switches to the right cart instead of showing the previous
 * identity's data. The ["cart"] prefix is kept, so
 * invalidateQueries({ queryKey: ["cart"] }) elsewhere still matches.
 */
export function useCartQueryKey() {
  const { user } = useAuth();
  return ["cart", user?.id ?? "guest"] as const;
}

export function useCart() {
  const { isLoading: authLoading } = useAuth();
  const queryKey = useCartQueryKey();

  return useQuery({
    queryKey,
    queryFn: getCart,
    enabled: !authLoading,
    // Cart can change on another device (or another tab) without this one
    // knowing. Refetching whenever the tab/app regains focus means the
    // count self-corrects the moment someone comes back to it, instead of
    // silently showing stale data until a manual reload.
    refetchOnWindowFocus: true,
    select: (data) => ({
      items: data.items,
      count: data.items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: data.items.reduce((sum, i) => sum + getLineTotal(i), 0),
    }),
  });
}
"use client";

import { useQuery } from "@tanstack/react-query";
import { getCart } from "@/lib/api/cart";
import { useAuth } from "@/lib/auth/AuthContext";
import type { CartItem } from "@/lib/api/types";

/**
 * Line total, same formula as mobile's getLineTotal and checkout:
 * base price × quantity, plus the add-ons total ONCE. Each add-on's
 * total_price already reflects its own quantity, and the backend rescales
 * it whenever the line quantity changes, so it must not be multiplied
 * by the line quantity again.
 */
export function getLineTotal(item: CartItem): number {
  const addonsTotal = (item.addons ?? []).reduce(
    (sum, a) => sum + (a.total_price ?? 0),
    0
  );
  return item.price * item.quantity + addonsTotal;
}

// Shared so useCart and useUpdateCart can never drift apart.
export function useCartQueryKey() {
  const { user } = useAuth();
  // Scoped per identity so one account's cached cart is never shown to
  // another (or to a guest) after login/logout in the same tab.
  return ["cart", user ? `user:${user.id}` : "guest"] as const;
}

export function useCart() {
  const { isLoading: authLoading } = useAuth();
  const queryKey = useCartQueryKey();

  return useQuery({
    queryKey,
    queryFn: getCart,
    enabled: !authLoading,
    // Cart can change on another device or tab; refetching on focus makes
    // the count self-correct when the person comes back.
    refetchOnWindowFocus: true,
    select: (data) => ({
      items: data.items,
      count: data.items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: data.items.reduce((sum, i) => sum + getLineTotal(i), 0),
    }),
  });
}
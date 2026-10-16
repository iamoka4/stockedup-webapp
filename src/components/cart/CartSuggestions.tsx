"use client";
// src/components/cart/CartSuggestions.tsx
//
// "Forgot something?" row for the web cart page. Drop-in, no props:
//
//   <CartSuggestions />
//
// It reads the cart itself (same React Query cache as the cart page), so it
// refreshes when items are added or removed. Uses the same card, quick add
// and analytics as the product page suggestions.

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCartSuggestions } from "@/lib/api/cart";
import { useCart, useCartQueryKey } from "@/lib/hooks/useCart";
import { trackEvent } from "@/lib/analytics";
import { SuggestionRow } from "@/app/products/[id]/RelatedProducts";

export function CartSuggestions() {
  const { data: cart } = useCart();
  const cartKey = useCartQueryKey(); // ["cart", userId | "guest"]
  const items = cart?.items ?? [];

  // Refetch whenever what is in the cart changes (add / remove / edit).
  const signature = items
    .map((i) => i.product_id)
    .sort((a, b) => a - b)
    .join(",");

  const { data } = useQuery({
    queryKey: ["cart-suggestions", cartKey[1], signature],
    queryFn: async () => (await getCartSuggestions()).suggestions ?? [],
    enabled: items.length > 0,
    staleTime: 60 * 1000,
    retry: false, // optional extra: fail quietly
    placeholderData: (previous) => previous, // no flicker while refetching
  });

  // Impression: once each time the cart page is opened.
  const shownRef = useRef(false);
  useEffect(() => {
    if (shownRef.current || !data?.length) return;
    shownRef.current = true;
    trackEvent("cart_suggestions_shown", {
      suggestion_count: data.length,
      cart_item_count: items.length,
    });
  }, [data, items.length]);

  if (!data?.length) return null;

  return (
    <div className="mt-8">
      <SuggestionRow
        title="Forgot something?"
        section="cart"
        origin="cart"
        items={data}
        quickAdd
      />
    </div>
  );
}
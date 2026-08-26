"use client";

import { useQuery } from "@tanstack/react-query";
import { getCart } from "@/lib/api/cart";
import { useAuth } from "@/lib/auth/AuthContext";

export function useCart() {
  const { isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["cart"],
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
      subtotal: data.items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    }),
  });
}
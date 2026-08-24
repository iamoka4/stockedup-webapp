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
    select: (data) => ({
      items: data.items,
      count: data.items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: data.items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    }),
  });
}

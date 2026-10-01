"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCartItem } from "@/lib/api/cart";
import { useCartQueryKey } from "@/lib/hooks/useCart"; // adjust path if needed
import type { CartItem } from "@/lib/api/types";

interface UpdateCartRequest {
  cart_id: number;
  quantity: number; // 0 removes the row
}

// Shape stored in the cache (the raw getCart() result; `select` in
// useCart only transforms what components read, not what's cached).
type CartCache = { items: CartItem[] };

export function useUpdateCart() {
  const queryClient = useQueryClient();
  const cartQueryKey = useCartQueryKey();

  const mutation = useMutation({
    mutationFn: (data: UpdateCartRequest) =>
      updateCartItem(data.cart_id, data.quantity),

    onMutate: async (newData) => {
      // Stop in-flight refetches from overwriting the optimistic update.
      await queryClient.cancelQueries({ queryKey: cartQueryKey });

      const previousCart = queryClient.getQueryData<CartCache>(cartQueryKey);

      queryClient.setQueryData<CartCache>(cartQueryKey, (old) => {
        if (!old?.items) return old;

        // Match by cart row id, never product_id (a product can have
        // several add-on variant rows).
        const items =
          newData.quantity === 0
            ? old.items.filter((item) => item.id !== newData.cart_id)
            : old.items.map((item) =>
                item.id === newData.cart_id
                  ? { ...item, quantity: newData.quantity }
                  : item
              );

        return { ...old, items };
      });

      return { previousCart };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart);
      }
    },

    // Always refetch: the backend rescales add-on quantities and prices
    // when the quantity changes, and the optimistic update doesn't model
    // that, so the refetch brings the add-on data back in line.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
  });

  return {
    updateCart: mutation.mutate,
    updateCartAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
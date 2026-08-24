"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart } from "@/lib/api/cart";

export function AddToCartPanel({
  productId,
  inStock,
}: {
  productId: number;
  inStock: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => addToCart(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return (
    <div className="mt-6 flex items-center gap-3">
      <div className="flex items-center rounded-full border border-line">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-10 w-10 items-center justify-center text-ink-soft hover:text-ink"
          aria-label="Decrease quantity"
        >
          <Minus size={16} />
        </button>
        <span className="tabular w-8 text-center text-sm font-medium">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(25, q + 1))}
          className="flex h-10 w-10 items-center justify-center text-ink-soft hover:text-ink"
          aria-label="Increase quantity"
        >
          <Plus size={16} />
        </button>
      </div>

      <button
        type="button"
        disabled={!inStock || mutation.isPending}
        onClick={() => mutation.mutate()}
        className="flex-1 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft"
      >
        {mutation.isPending
          ? "Adding…"
          : mutation.isSuccess
            ? "Added to cart ✓"
            : inStock
              ? "Add to cart"
              : "Out of stock"}
      </button>
    </div>
  );
}

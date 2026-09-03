"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart } from "@/lib/api/cart";
import type { Product } from "@/lib/api/types";

export function ProductCard({ product }: { product: Product }) {
  const queryClient = useQueryClient();
  const outOfStock = product.stock === "outOfStock" || Number(product.stock) === 0;

  const mutation = useMutation({
    mutationFn: () => addToCart(product.id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-bg-raised">
      <Link href={`/products/${product.id}`} className="block">
        <div className="aspect-square w-full overflow-hidden bg-brand-tint">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] font-body text-sm font-medium text-ink">
            {product.name}
          </h3>
        </Link>
        <p className="tabular text-xs text-ink-soft">{product.unit}</p>
        <div className="mt-auto flex items-end justify-between pt-2">
          <span className="tabular font-display text-lg font-semibold text-ink">
            ₦{product.price.toLocaleString()}
          </span>
          <button
            type="button"
            disabled={outOfStock || mutation.isPending}
            onClick={() => mutation.mutate()}
            aria-label={`Add ${product.name} to cart`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
        {outOfStock && <StampOut />}
      </div>
    </div>
  );
}

function StampOut() {
  return (
    <span className="stamp absolute left-2 top-2 border-clay bg-white/90 text-clay">
      Sold out
    </span>
  );
}
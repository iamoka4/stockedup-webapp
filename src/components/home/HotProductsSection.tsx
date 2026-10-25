"use client";

import { useMemo } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useHotProducts } from "@/lib/hooks/useHotProducts";
import { cityLabel } from "@/lib/cities";
import { useUiStore } from "@/store/uiStore";
import type { Product } from "@/lib/api/types";

function chunkIntoPairs(products: Product[]): Product[][] {
  const pairs: Product[][] = [];
  for (let i = 0; i < products.length; i += 2) {
    pairs.push(products.slice(i, i + 2));
  }
  return pairs;
}

// Same column width as ProductRail: about two columns visible on phones
// (with a peek of the next), fixed widths from sm up.
export const PRODUCT_COLUMN_CLASS =
  "w-[44vw] max-w-[260px] shrink-0 sm:w-56 lg:w-64";

export function HotProductsSection() {
  const city = useUiStore((s) => s.city);
  const { products, isFetching } = useHotProducts();
  const columns = useMemo(() => chunkIntoPairs(products), [products]);

  return (
    <section className="py-8">
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
          Best Sellers
        </h2>
      </div>
      {isFetching && (
        <p className="mb-3 text-xs text-ink-soft">Updating for {cityLabel(city)}…</p>
      )}
      {products.length === 0 ? (
        <p className="text-sm text-ink-soft">
          No products found in {cityLabel(city)} yet.
        </p>
      ) : (
        <div className="scrollbar-none flex snap-x gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {columns.map((pair, i) => (
            <div
              key={i}
              className={`flex snap-start flex-col gap-3 ${PRODUCT_COLUMN_CLASS}`}
            >
              {pair.map((product) => (
                <ProductCard key={product.id} product={product} hideCartControls />
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
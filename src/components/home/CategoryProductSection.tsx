"use client";

import { useMemo } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useCityFilteredProducts } from "@/lib/hooks/useCityFilteredProducts";
import { cityLabel } from "@/lib/cities";
import { useUiStore } from "@/store/uiStore";
import type { Product } from "@/lib/api/types";

type CategoryProductSectionProps = {
  title: string;
  category: string;
  initialProducts: Product[];
};

function chunkIntoPairs(products: Product[]): Product[][] {
  const pairs: Product[][] = [];
  for (let i = 0; i < products.length; i += 2) {
    pairs.push(products.slice(i, i + 2));
  }
  return pairs;
}

export function CategoryProductSection({
  title,
  category,
  initialProducts,
}: CategoryProductSectionProps) {
  const city = useUiStore((s) => s.city);
  const { products, isFetching } = useCityFilteredProducts({ category, initialProducts });
  const columns = useMemo(() => chunkIntoPairs(products), [products]);

  return (
    <section className="py-8">
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">{title}</h2>
      </div>
      {isFetching && <p className="mb-3 text-xs text-ink-soft">Updating for {cityLabel(city)}…</p>}
      {products.length === 0 ? (
        <p className="text-sm text-ink-soft">No products found in {cityLabel(city)} yet.</p>
      ) : (
        <div className="scrollbar-none flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {columns.map((pair, i) => (
            <div key={i} className="flex w-36 shrink-0 flex-col gap-4 sm:w-40">
              {pair.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
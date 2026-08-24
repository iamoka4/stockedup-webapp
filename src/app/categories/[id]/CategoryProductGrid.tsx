"use client";

import { ProductCard } from "@/components/ProductCard";
import { useCityFilteredProducts } from "@/lib/hooks/useCityFilteredProducts";
import { cityLabel } from "@/lib/cities";
import { useUiStore } from "@/store/uiStore";
import type { Product } from "@/lib/api/types";

export function CategoryProductGrid({
  categoryName,
  initialProducts,
}: {
  categoryName: string;
  initialProducts: Product[];
}) {
  const city = useUiStore((s) => s.city);
  const { products, isFetching } = useCityFilteredProducts({
    category: categoryName,
    initialProducts,
  });

  return (
    <div>
      <p className="mt-2 text-ink-soft">
        {isFetching ? "Updating…" : `${products.length} products in ${cityLabel(city)}`}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {products.length === 0 && !isFetching && (
          <p className="col-span-full text-ink-soft">
            No products in this category in {cityLabel(city)} yet.
          </p>
        )}
      </div>
    </div>
  );
}
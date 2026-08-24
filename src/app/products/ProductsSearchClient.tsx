"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { useCityFilteredProducts } from "@/lib/hooks/useCityFilteredProducts";
import { cityLabel } from "@/lib/cities";
import { useUiStore } from "@/store/uiStore";

/**
 * NOTE: get-products.php has no text-search parameter (confirmed during
 * the backend audit — it only filters by category / vendor_id / city).
 * This page fetches the selected city's product list and filters
 * client-side as a stopgap. For a catalog of any real size this should
 * move to a proper `?q=` param on get-products.php — flagged as backend
 * follow-up work, not something to solve purely on the frontend.
 */
export function ProductsSearchClient() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.toLowerCase().trim() ?? "";
  const city = useUiStore((s) => s.city);

  const { products, isFetching } = useCityFilteredProducts();

  const filtered = useMemo(() => {
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    );
  }, [products, q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">
        {q ? `Results for "${q}"` : `All products in ${cityLabel(city)}`}
      </h1>
      <p className="mt-2 text-ink-soft">{isFetching ? "Loading…" : `${filtered.length} products`}</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {!isFetching && filtered.length === 0 && (
          <p className="col-span-full text-ink-soft">
            No products matched your search in {cityLabel(city)}.
          </p>
        )}
      </div>
    </div>
  );
}
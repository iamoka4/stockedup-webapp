"use client";

import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { useCityFilteredProducts } from "@/lib/hooks/useCityFilteredProducts";
import { cityLabel } from "@/lib/cities";
import { useUiStore } from "@/store/uiStore";
import type { Product } from "@/lib/api/types";

export function FreshPicksSection({ initialProducts }: { initialProducts: Product[] }) {
  const city = useUiStore((s) => s.city);
  const { products, isFetching } = useCityFilteredProducts({ initialProducts });
  const featured = products.slice(0, 10);

  return (
    <section className="py-8">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">Fresh picks</h2>
        <Link href="/products" className="text-sm font-medium text-brand-deep hover:underline">
          View all {products.length > 0 ? `(${products.length})` : ""}
        </Link>
      </div>

      {isFetching && <p className="mb-3 text-xs text-ink-soft">Updating for {cityLabel(city)}…</p>}

      {featured.length === 0 ? (
        <p className="text-sm text-ink-soft">No products found in {cityLabel(city)} yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
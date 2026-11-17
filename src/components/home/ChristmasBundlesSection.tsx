"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCT_COLUMN_CLASS } from "@/components/home/HotProductsSection";
import { getChristmasBundles } from "@/lib/api/christmas-bundles";
import { useUiStore } from "@/store/uiStore";
import { cityLabel } from "@/lib/cities";
import type { Product } from "@/lib/api/types";

function chunkIntoPairs(products: Product[]): Product[][] {
  const pairs: Product[][] = [];
  for (let i = 0; i < products.length; i += 2) pairs.push(products.slice(i, i + 2));
  return pairs;
}

export function ChristmasBundlesSection() {
  const label = cityLabel(useUiStore((s) => s.city));
  const { data } = useQuery({
    queryKey: ["christmas-bundles", label.toLowerCase().replace(/\s+/g, "")],
    queryFn: () => getChristmasBundles({ city: label }),
    staleTime: 60_000,
  });
  const columns = useMemo(() => chunkIntoPairs(data ?? []), [data]);

  if (!data || data.length === 0) return null;

  return (
    <section className="py-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
            🎄 Christmas Bundles Sales
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Everything you need for a joyful Christmas, bundled in one place.
          </p>
        </div>
        <Link
          href="/christmas-bundles"
          className="shrink-0 text-sm font-semibold text-brand-deep hover:underline"
        >
          See All
        </Link>
      </div>
      <div className="scrollbar-none flex snap-x gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {columns.map((pair, i) => (
          <div key={i} className={`flex snap-start flex-col gap-3 ${PRODUCT_COLUMN_CLASS}`}>
            {pair.map((p) => (
              <ProductCard key={p.id} product={p} hideCartControls />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
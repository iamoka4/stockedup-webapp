"use client";

import { CategoryProductSection } from "@/components/home/CategoryProductSection";
import type { Product } from "@/lib/api/types";

export function TrendingDrinksSection({ initialProducts }: { initialProducts: Product[] }) {
  return (
    <CategoryProductSection
      title="Trending drinks"
      category="Drinks"
      initialProducts={initialProducts}
    />
  );
}
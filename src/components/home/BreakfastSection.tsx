"use client";

import { CategoryProductSection } from "@/components/home/CategoryProductSection";
import type { Product } from "@/lib/api/types";

export function BreakfastSection({ initialProducts }: { initialProducts: Product[] }) {
  return (
    <CategoryProductSection
      title="Breakfast"
      category="Beverages"
      initialProducts={initialProducts}
    />
  );
}
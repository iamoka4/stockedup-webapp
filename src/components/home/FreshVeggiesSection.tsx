"use client";

import { CategoryProductSection } from "@/components/home/CategoryProductSection";
import type { Product } from "@/lib/api/types";

export function FreshVeggiesSection({ initialProducts }: { initialProducts: Product[] }) {
  return (
    <CategoryProductSection
      title="Fresh veggies"
      category="Fresh Veggies"
      initialProducts={initialProducts}
    />
  );
}
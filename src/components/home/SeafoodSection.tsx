"use client";

import { CategoryProductSection } from "@/components/home/CategoryProductSection";
import type { Product } from "@/lib/api/types";

export function SeafoodSection({ initialProducts }: { initialProducts: Product[] }) {
  return (
    <CategoryProductSection
      title="Seafood"
      category="Sea Food"
      initialProducts={initialProducts}
    />
  );
}
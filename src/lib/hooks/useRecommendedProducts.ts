"use client";

import { useMemo } from "react";
import { useUiStore } from "@/store/uiStore";
import { useCityFilteredProducts } from "@/lib/hooks/useCityFilteredProducts";
import type { Product } from "@/lib/api/types";

export function useRecommendedProducts({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const browsingHistory = useUiStore((s) => s.browsingHistory);
  const { products, isFetching } = useCityFilteredProducts({ initialProducts });

  const recommended = useMemo(() => {
    if (!browsingHistory || browsingHistory.length === 0) return [];

    const historyProductMap = new Map(
      products.map((p) => [p.id.toString(), p]),
    );
    const categoryFrequency: Record<string, number> = {};

    browsingHistory.forEach((id) => {
      const p = historyProductMap.get(id);
      if (p?.category) {
        const cat = p.category.toLowerCase();
        categoryFrequency[cat] = (categoryFrequency[cat] || 0) + 1;
      }
    });

    const historySet = new Set(browsingHistory);
    const result = products.filter((p) => {
      const cat = p.category?.toLowerCase();
      return cat && categoryFrequency[cat] && !historySet.has(p.id.toString());
    });

    result.sort((a, b) => {
      const freqA = categoryFrequency[a.category.toLowerCase()] || 0;
      const freqB = categoryFrequency[b.category.toLowerCase()] || 0;
      return freqB - freqA;
    });

    return result;
  }, [browsingHistory, products]);

  return { products: recommended, isFetching };
}

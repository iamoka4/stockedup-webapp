"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/api/products";
import { useUiStore } from "@/store/uiStore";
import { cityLabel } from "@/lib/cities";
import type { Product } from "@/lib/api/types";

interface Options {
  category?: string;
  initialProducts?: Product[];
}

/**
 * get-products.php DOES support a server-side `city` param — it does an
 * exact (case-insensitive) match against vendors.city. We pass the human
 * label ("Port Harcourt") rather than our internal slug ("portharcourt"),
 * since that's closer to what most vendors likely typed at registration.
 * The same city/data-format inconsistency noted in
 * useCityFilteredVendors applies here too though — flagged as a backend
 * data-quality item, not fixable purely from this hook.
 */
export function useCityFilteredProducts({ category, initialProducts }: Options = {}) {
  const city = useUiStore((s) => s.city);
  const label = cityLabel(city);

  const { data, isFetching } = useQuery({
    queryKey: ["products", label, category ?? null],
    queryFn: () => getProducts({ city: label, category }),
    initialData: initialProducts,
    staleTime: 60_000,
  });

  return { products: data ?? [], isFetching };
}
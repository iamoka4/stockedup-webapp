"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/api/products";
import { useUiStore } from "@/store/uiStore";
import { cityLabel } from "@/lib/cities";
import { DEFAULT_CITY } from "@/lib/config";
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
 *
 * BUG FIX: `initialData` must only seed the cache for the exact city it
 * was actually fetched for (the SSR default, DEFAULT_CITY). Passing it
 * unconditionally for every city meant React Query treated the Awka
 * product list as "fresh" data for Onitsha/Port Harcourt/etc's query key
 * too, and skipped fetching the real data for that city entirely — which
 * is why switching cities appeared to do nothing.
 */
export function useCityFilteredProducts({ category, initialProducts }: Options = {}) {
  const city = useUiStore((s) => s.city);
  const label = cityLabel(city);
  const isDefaultCity = label.toLowerCase() === DEFAULT_CITY.toLowerCase();

  const { data, isFetching } = useQuery({
    queryKey: ["products", label, category ?? null],
    queryFn: () => getProducts({ city: label, category }),
    initialData: isDefaultCity ? initialProducts : undefined,
    staleTime: 60_000,
  });

  return { products: data ?? [], isFetching };
}
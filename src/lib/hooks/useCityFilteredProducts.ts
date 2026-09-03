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
 * BUG FIX #1: `initialData` must only seed the cache for the exact city it
 * was actually fetched for (the SSR default, DEFAULT_CITY). Passing it
 * unconditionally for every city meant React Query treated the Awka
 * product list as "fresh" data for Onitsha/Port Harcourt/etc's query key
 * too, and skipped fetching the real data for that city entirely — which
 * is why switching cities appeared to do nothing.
 *
 * BUG FIX #2: the city check alone isn't enough once `category` exists.
 * `initialProducts` is always the unfiltered, no-category product list
 * (seeded from page.tsx's plain getProducts({ city: DEFAULT_CITY }) call).
 * A category-scoped query has a different queryKey but was still being
 * seeded with that same unfiltered list whenever the city matched — so
 * every category section silently rendered the same products as Fresh
 * Picks instead of fetching its own filtered data. initialData is only
 * a valid seed when there's no category at all.
 */
export function useCityFilteredProducts({
  category,
  initialProducts,
}: Options = {}) {
  const city = useUiStore((s) => s.city);
  const label = cityLabel(city);
  const isDefaultCity = label.toLowerCase() === DEFAULT_CITY.toLowerCase();
  const canUseInitialData = isDefaultCity && !category;

  const { data, isFetching } = useQuery({
    queryKey: ["products", label, category ?? null],
    queryFn: () => getProducts({ city: label, category }),
    initialData: canUseInitialData ? initialProducts : undefined,
    staleTime: 60_000,
  });

  return { products: data ?? [], isFetching };
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { getBestSellers } from "@/lib/api/products";
import { useUiStore } from "@/store/uiStore";
import { cityLabel } from "@/lib/cities";

export function useHotProducts() {
  const city = useUiStore((s) => s.city);
  const label = cityLabel(city);

  const { data, isFetching } = useQuery({
    queryKey: ["best-sellers", label, "weekly"],
    queryFn: () => getBestSellers({ city: label }),
    staleTime: 1000 * 60 * 10, // best sellers don't change every minute
    gcTime: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
  });

  return { products: data ?? [], isFetching };
}

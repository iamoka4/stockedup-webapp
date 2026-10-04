"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRestaurants, getSupermarkets } from "@/lib/api/vendor-listing";
import type { VendorListingItem } from "@/lib/api/vendor-listing";
import { useUiStore } from "@/store/uiStore";
import { cityLabel } from "@/lib/cities";
import { DEFAULT_CITY } from "@/lib/config";

type BusinessType = "restaurant" | "supermarket";

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");

/**
 * Restaurants / supermarkets for the city selected in the header.
 *
 * The page renders on the server, which can only know the default city, so
 * `serverItems` is only used as the starting data for that city (and only if
 * the server fetch worked). Any other city makes a real request. The
 * browser-side filter at the end is a safety net so a vendor from another
 * city is never shown, whatever the data source.
 */
export function useCityVendorListing(
  businessType: BusinessType,
  serverItems: VendorListingItem[],
  serverFailed: boolean
) {
  const city = useUiStore((s) => s.city);
  const label = cityLabel(city);
  const isDefaultCity = label.toLowerCase() === DEFAULT_CITY.toLowerCase();

  const { data, isFetching, isError } = useQuery({
    queryKey: ["vendor-listing", businessType, label],
    queryFn: () =>
      businessType === "restaurant" ? getRestaurants(label) : getSupermarkets(label),
    initialData: isDefaultCity && !serverFailed ? serverItems : undefined,
    staleTime: 60_000,
  });

  const items = useMemo(() => {
    const target = normalize(label);
    const slug = normalize(city);
    return (data ?? []).filter((v) => {
      const c = normalize(v.city || "");
      return c === target || c === slug;
    });
  }, [data, label, city]);

  return { items, isFetching, isError, label };
}
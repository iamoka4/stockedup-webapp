"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVendors } from "@/lib/api/vendors";
import { useUiStore } from "@/store/uiStore";
import { cityLabel } from "@/lib/cities";
import type { Vendor } from "@/lib/api/types";

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

/**
 * get-vendors.php has no city filter parameter — it returns every active
 * vendor regardless of location. Each row does include the vendor's own
 * `city` field though, so filtering happens client-side using that.
 *
 * Known limitation: vendor.city is free text. It can come from either
 * vendor-register.php's open text input ("Port Harcourt") or
 * update_location.php's normalized no-space lowercase slug
 * ("portharcourt") for the same real city, depending on which flow a
 * vendor went through. Matching is normalized (lowercase, spaces
 * stripped) on both sides to paper over that, but it can still miss a
 * vendor whose city was entered some other way ("PH", a typo, etc).
 * The real fix is constraining vendors.city to one canonical format on
 * the backend — flagging this as a data-quality item, not something
 * fully solvable from the frontend.
 */
export function useCityFilteredVendors(initialVendors: Vendor[]) {
  const city = useUiStore((s) => s.city);

  const { data, isFetching } = useQuery({
    queryKey: ["vendors-all"],
    queryFn: () => getVendors().then((r) => r.vendors),
    initialData: initialVendors,
    staleTime: 60_000,
  });

  const vendors = useMemo(() => {
    const targetLabel = normalize(cityLabel(city));
    const targetSlug = normalize(city);
    return (data ?? []).filter((v) => {
      const vCity = normalize(v.city || "");
      return vCity === targetLabel || vCity === targetSlug;
    });
  }, [data, city]);

  return { vendors, isFetching };
}
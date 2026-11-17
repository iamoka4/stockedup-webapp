// src/components/shop/ChristmasBundlesListing.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductListingPage } from "@/components/shop/ProductListingPage";
import { getChristmasBundles } from "@/lib/api/christmas-bundles";
import { useUiStore } from "@/store/uiStore";
import { cityLabel } from "@/lib/cities";

export function ChristmasBundlesListing() {
  const label = cityLabel(useUiStore((s) => s.city));
  const { data, isError, isFetching } = useQuery({
    queryKey: ["christmas-bundles-all", label.toLowerCase().replace(/\s+/g, "")],
    queryFn: () => getChristmasBundles({ city: label, all: true }),
    staleTime: 60_000,
  });

  return (
    <ProductListingPage
      title="Christmas Bundles Sales"
      mainLabel="Bundles"
      intro={`Everything you need for a joyful Christmas, bundled in one place. Showing ${label}.`}
      products={data ?? []}
      failed={isError}
      emptyText={
        isFetching && !data
          ? `Loading bundles for ${label}…`
          : `No Christmas bundles are available in ${label} yet.`
      }
    />
  );
}
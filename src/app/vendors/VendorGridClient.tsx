"use client";

import { VendorCard } from "@/components/VendorCard";
import { useCityFilteredVendors } from "@/lib/hooks/useCityFilteredVendors";
import { cityLabel } from "@/lib/cities";
import { useUiStore } from "@/store/uiStore";
import type { Vendor } from "@/lib/api/types";

export function VendorGridClient({ initialVendors }: { initialVendors: Vendor[] }) {
  const city = useUiStore((s) => s.city);
  const { vendors, isFetching } = useCityFilteredVendors(initialVendors);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">
        Vendors in {cityLabel(city)}
      </h1>
      <p className="mt-2 text-ink-soft">
        {isFetching ? "Updating…" : `${vendors.length} vendors delivering near you.`}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {vendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
        {vendors.length === 0 && !isFetching && (
          <p className="col-span-full text-ink-soft">
            No vendors found in {cityLabel(city)} right now — try another city.
          </p>
        )}
      </div>
    </div>
  );
}
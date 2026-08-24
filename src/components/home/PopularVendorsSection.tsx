"use client";

import Link from "next/link";
import { VendorCard } from "@/components/VendorCard";
import { useCityFilteredVendors } from "@/lib/hooks/useCityFilteredVendors";
import { cityLabel } from "@/lib/cities";
import { useUiStore } from "@/store/uiStore";
import type { Vendor } from "@/lib/api/types";

export function PopularVendorsSection({ initialVendors }: { initialVendors: Vendor[] }) {
  const city = useUiStore((s) => s.city);
  const { vendors, isFetching } = useCityFilteredVendors(initialVendors);
  const top = vendors.slice(0, 8);

  return (
    <section className="py-8">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
          Popular vendors in {cityLabel(city)}
        </h2>
        <Link href="/vendors" className="text-sm font-medium text-brand-deep hover:underline">
          View all {vendors.length > 0 ? `(${vendors.length})` : ""}
        </Link>
      </div>

      {isFetching && <p className="mb-3 text-xs text-ink-soft">Updating…</p>}

      {top.length === 0 ? (
        <p className="text-sm text-ink-soft">
          No vendors found in {cityLabel(city)} yet — try another city.
        </p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible md:grid-cols-4">
          {top.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}
    </section>
  );
}
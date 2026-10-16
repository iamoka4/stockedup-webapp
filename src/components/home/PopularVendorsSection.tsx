"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Store } from "lucide-react";
import { VendorListingCard } from "@/components/vendors/VendorListing";
import { vendorToListingItem } from "@/lib/vendors/toListingItem";
import { useCityFilteredVendors } from "@/lib/hooks/useCityFilteredVendors";
import { cityLabel } from "@/lib/cities";
import { useUiStore } from "@/store/uiStore";
import type { Vendor } from "@/lib/api/types";

const PAGE_SIZE = 10;

// Grocery vendors rail, shown on the shop page as "Restock Your Kitchen".
// Scrolls horizontally and keeps loading more vendors as the user reaches
// the right edge. Uses the same card as the restaurant and supermarket rails.
export function PopularVendorsSection({
  initialVendors,
  title = "Restock Your Kitchen",
  viewAllHref = "/vendors",
}: {
  initialVendors: Vendor[];
  title?: string;
  viewAllHref?: string;
}) {
  const city = useUiStore((s) => s.city);
  const { vendors, isFetching } = useCityFilteredVendors(initialVendors);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollRef = useRef<HTMLUListElement>(null);
  const sentinelRef = useRef<HTMLLIElement>(null);

  const items = useMemo(
    () => vendors.map((v) => vendorToListingItem(v)),
    [vendors]
  );
  const visible = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  // Start over from the first page when the city (and so the list) changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [vendors]);

  // Load the next page when the end-of-rail sentinel scrolls into view.
  useEffect(() => {
    const root = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => c + PAGE_SIZE);
        }
      },
      { root, rootMargin: "0px 300px 0px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);

  return (
    <section className="py-8">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-display text-lg font-bold text-ink sm:text-xl">
          {title}
        </h2>
        <Link
          href={viewAllHref}
          className="text-sm font-semibold text-brand-deep hover:underline"
        >
          View All
        </Link>
      </div>

      {isFetching && <p className="mb-3 text-xs text-ink-soft">Updating…</p>}

      {items.length === 0 ? (
        <p className="text-sm text-ink-soft">
          No vendors found in {cityLabel(city)} yet — try another city.
        </p>
      ) : (
        <ul
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>li]:w-72 [&>li]:shrink-0"
        >
          {visible.map((item) => (
            <VendorListingCard
              key={item.id}
              item={item}
              grid={false}
              FallbackIcon={Store}
            />
          ))}
          {hasMore && (
            <li
              ref={sentinelRef}
              aria-hidden
              style={{ width: 1, flexShrink: 0 }}
            />
          )}
        </ul>
      )}
    </section>
  );
}
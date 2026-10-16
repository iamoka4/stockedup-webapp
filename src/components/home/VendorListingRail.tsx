"use client";

import Link from "next/link";
import { Store, UtensilsCrossed } from "lucide-react";
// ADJUST THIS PATH to wherever VendorListing.tsx lives. It needs one change:
// export its card, i.e. `function VendorCard(` -> `export function VendorListingCard(`.
import { VendorListingCard } from "@/components/vendors/VendorListing";
import { useCityVendorListing } from "@/lib/hooks/useCityVendorListing";
import type { VendorListingItem } from "@/lib/api/vendor-listing";

const ICONS = {
  restaurant: UtensilsCrossed,
  supermarket: Store,
} as const;

const HOME_LIMIT = 10;

// Homepage rail of restaurant or supermarket business cards. Uses the same
// city-aware hook and the same card as the /restaurants and /supermarkets
// pages, so there is no second data source. Hides itself when the city has
// none of that business type.
export function VendorListingRail({
  businessType,
  title,
  viewAllHref,
  initialItems,
  titleClassName = "text-ink",
}: {
  businessType: "restaurant" | "supermarket";
  title: string;
  viewAllHref: string;
  /** Server-rendered list for the default city; starting data only. */
  initialItems: VendorListingItem[];
  titleClassName?: string;
}) {
  const { items } = useCityVendorListing(businessType, initialItems, false);
  const top = items.slice(0, HOME_LIMIT);
  const Icon = ICONS[businessType];

  if (top.length === 0) return null;

  return (
    <section className="py-8">
      <div className="mb-4 flex items-end justify-between">
        <h2 className={`font-display text-lg font-bold sm:text-xl ${titleClassName}`}>
          {title}
        </h2>
        <Link
          href={viewAllHref}
          className="text-sm font-semibold text-brand-deep hover:underline"
        >
          View All
        </Link>
      </div>

      <ul className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>li]:w-72 [&>li]:shrink-0">
        {top.map((item) => (
          <VendorListingCard
            key={item.id}
            item={item}
            grid={false}
            FallbackIcon={Icon}
          />
        ))}
      </ul>
    </section>
  );
}
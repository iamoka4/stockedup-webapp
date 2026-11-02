import Link from "next/link";
import type { Vendor } from "@/lib/api/types";
import type { VendorListingItem } from "@/lib/api/vendor-listing";

// Organic "pebble" shapes, alternated so the grid feels hand-cut, not boxed.
const BLOBS = [
  "rounded-[58%_42%_55%_45%/52%_48%_52%_48%]",
  "rounded-[45%_55%_42%_58%/55%_45%_58%_42%]",
  "rounded-[52%_48%_60%_40%/46%_56%_44%_54%]",
  "rounded-[42%_58%_48%_52%/58%_42%_55%_45%]",
];

// Restaurants we always feature first. Matched to live restaurants by shop
// name (ignoring case, spacing and punctuation) so their logo comes from the
// vendor's own profile. A featured restaurant with no logo is hidden too.
const FEATURED_RESTAURANTS = ["Chukskally Kitchen & Bar", "Jenny's Kitchen"];

// Rating is only used to decide the order; it is never displayed.
type Partner = { key: string; label: string; image: string | null; rating: number };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Business names only: Vendor.name is the owner's personal name, so it is
// never used as a label.
const fromGrocery = (v: Vendor): Partner => ({
  key: `grocery-${v.id}`,
  label: v.shop_name || "",
  image: v.image,
  rating: v.average_rating ?? 0,
});
const fromListing = (v: VendorListingItem, kind: string): Partner => ({
  key: `${kind}-${v.id}`,
  label: v.shop_name || "",
  image: v.logo,
  rating: v.rating?.average ?? 0,
});

// Display only: these are the brands we're proud to work with, not a
// storefront, so nothing here links anywhere and nothing is location-filtered.
// Two rows that fill column by column, so businesses sit in pairs and the
// whole thing scrolls horizontally.
function PartnerRail({ partners }: { partners: Partner[] }) {
  return (
    <ul className="grid auto-cols-[9.5rem] grid-flow-col grid-rows-2 gap-x-4 gap-y-10 overflow-x-auto overscroll-x-contain px-1 pb-4 [scrollbar-width:thin] md:auto-cols-[11rem]">
      {partners.map((p, i) => (
        <li key={p.key} className="flex flex-col items-center">
          <div
            className={`size-32 overflow-hidden bg-brand-tint md:size-36 ${BLOBS[i % BLOBS.length]}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image ?? ""}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          </div>
          <span className="-mt-3 max-w-full truncate rounded-lg bg-brand-tint px-2.5 py-1 text-sm font-bold text-brand-deep">
            {p.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function TopVendors({
  groceries,
  restaurants,
  supermarkets,
}: {
  groceries: Vendor[];
  restaurants: VendorListingItem[];
  supermarkets: VendorListingItem[];
}) {
  if (groceries.length + restaurants.length + supermarkets.length === 0) {
    return null;
  }

  const restaurantPartners = restaurants
    .map((r) => fromListing(r, "restaurant"))
    .filter((p) => p.label);

  // The featured restaurants, resolved to live vendors. If one isn't found,
  // it is skipped (it would have no logo).
  const pinned: Partner[] = FEATURED_RESTAURANTS.flatMap((name) => {
    const target = norm(name);
    const found =
      restaurantPartners.find((p) => norm(p.label) === target) ??
      restaurantPartners.find((p) => norm(p.label).includes(target));
    return found ? [found] : [];
  });
  const pinnedKeys = new Set(pinned.map((p) => p.key));

  // Best rated first, skipping anything already pinned.
  const byRating = (list: Partner[]) =>
    list
      .filter((p) => p.label && !pinnedKeys.has(p.key))
      .sort((a, b) => b.rating - a.rating);

  // Every business in one list: featured restaurants, then the rest of the
  // restaurants, then stores and supermarkets. Only businesses with a logo
  // are shown, and a business listed under two types appears once.
  const seen = new Set<string>();
  const brands = [
    ...pinned,
    ...byRating(restaurantPartners),
    ...byRating([
      ...groceries.map(fromGrocery),
      ...supermarkets.map((s) => fromListing(s, "supermarket")),
    ]),
  ].filter((p) => {
    const id = norm(p.label);
    if (!id || !p.image || seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  if (brands.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-6 md:pt-20">
      <h2 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        Brands on StockedUp
      </h2>

      {/* Horizontal scroll: every business with a logo, two per column */}
      <div className="mt-12">
        <PartnerRail partners={brands} />
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/explore"
          className="inline-flex rounded-full bg-brand px-7 py-3.5 font-bold text-white transition hover:bg-brand-deep"
        >
          Explore restaurants &amp; stores
        </Link>
      </div>
    </section>
  );
}
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

// Restaurants we always feature. Matched to live restaurants by shop name
// (ignoring case, spacing and punctuation) so their logo comes from the
// vendor's own profile. If one isn't found, it still shows by name.
const FEATURED_RESTAURANTS = ["Chukskally Kitchen & Bar", "Jenny's Kitchen"];

// Rating is only used to decide who ranks "top"; it is never displayed.
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

// Display only: these are the partners we're proud to work with, not a
// storefront, so nothing here links anywhere and nothing is location-filtered.
function PartnerGrid({ partners }: { partners: Partner[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
      {partners.map((p, i) => (
        <li key={p.key} className="flex flex-col items-center">
          <div
            className={`size-32 overflow-hidden bg-brand-tint md:size-36 ${BLOBS[i % BLOBS.length]}`}
          >
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image}
                alt=""
                loading="lazy"
                className="size-full object-cover"
              />
            ) : (
              <span className="grid size-full place-items-center font-display text-4xl font-bold text-brand-deep">
                {p.label.charAt(0).toUpperCase()}
              </span>
            )}
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

  // The featured restaurants, resolved to live vendors where possible.
  const pinned: Partner[] = FEATURED_RESTAURANTS.map((name) => {
    const target = norm(name);
    return (
      restaurantPartners.find((p) => norm(p.label) === target) ??
      restaurantPartners.find((p) => norm(p.label).includes(target)) ?? {
        key: `featured-${target}`,
        label: name,
        image: null,
        rating: 0,
      }
    );
  });
  const pinnedKeys = new Set(pinned.map((p) => p.key));

  // Everyone else: best rated first, and only businesses with a logo.
  const withLogo = (list: Partner[]) =>
    list
      .filter((p) => p.label && p.image && !pinnedKeys.has(p.key))
      .sort((a, b) => b.rating - a.rating);

  const groups = [
    {
      title: "Restaurants",
      partners: [...pinned, ...withLogo(restaurantPartners)].slice(0, 4),
    },
    {
      title: "Stores & supermarkets",
      partners: withLogo([
        ...groceries.map(fromGrocery),
        ...supermarkets.map((s) => fromListing(s, "supermarket")),
      ]).slice(0, 4),
    },
  ].filter((g) => g.partners.length > 0);

  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-6 md:pt-20">
      <h2 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        Top businesses on StockedUp
      </h2>

      <div className="mt-12 space-y-14">
        {groups.map((g) => (
          <div key={g.title}>
            <h3 className="mb-8 text-center font-display text-xl font-bold text-brand-deep sm:text-2xl">
              {g.title}
            </h3>
            <PartnerGrid partners={g.partners} />
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
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
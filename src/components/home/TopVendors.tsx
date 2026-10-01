import type { Vendor } from "@/lib/api/types";
import { ExploreNearbyButton } from "./ExploreNearby";

// Organic "pebble" shapes, alternated so the grid feels hand-cut, not boxed.
const BLOBS = [
  "rounded-[58%_42%_55%_45%/52%_48%_52%_48%]",
  "rounded-[45%_55%_42%_58%/55%_45%_58%_42%]",
  "rounded-[52%_48%_60%_40%/46%_56%_44%_54%]",
  "rounded-[42%_58%_48%_52%/58%_42%_55%_45%]",
];

// TODO: swap this for the real field once confirmed in Vendor (lib/api/types).
// Until then it guesses from a few likely fields. Deliberately does NOT match
// "food", so foodstuff vendors stay in the stores group.
function isRestaurant(v: Vendor): boolean {
  const f = v as unknown as Record<string, unknown>;
  const raw = [f.vendor_type, f.business_type, f.category, f.category_name, f.type]
    .filter((x): x is string => typeof x === "string")
    .join(" ")
    .toLowerCase();
  return /restaurant|kitchen|cooked|eatery|meal/.test(raw);
}

// Display only: these are the partners we're proud to work with, not a
// storefront, so nothing here links anywhere and nothing is location-filtered.
function VendorGrid({ vendors }: { vendors: Vendor[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
      {vendors.map((v, i) => {
        const label = v.shop_name || v.name;
        return (
          <li key={v.id} className="flex flex-col items-center">
            <div
              className={`size-32 overflow-hidden bg-brand-tint md:size-36 ${BLOBS[i % BLOBS.length]}`}
            >
              {v.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={v.image}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover"
                />
              ) : (
                <span className="grid size-full place-items-center font-display text-4xl font-bold text-brand-deep">
                  {label.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="-mt-3 max-w-full truncate rounded-lg bg-brand-tint px-2.5 py-1 text-sm font-bold text-brand-deep">
              {label}
            </span>
            {v.average_rating > 0 && (
              <span className="tabular mt-1 text-xs text-ink-soft">
                ★ {Number(v.average_rating).toFixed(1)}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function TopVendors({ vendors }: { vendors: Vendor[] }) {
  const rated = [...vendors].sort(
    (a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0)
  );

  if (rated.length === 0) return null;

  const restaurants = rated.filter(isRestaurant).slice(0, 4);
  const stores = rated.filter((v) => !isRestaurant(v)).slice(0, 4);
  // Only split into two groups when both have something to show.
  const split = restaurants.length > 0 && stores.length > 0;

  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-6 md:pt-20">
      <h2 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        Top businesses on StockedUp
      </h2>

      {split ? (
        <div className="mt-12 space-y-14">
          <div>
            <h3 className="mb-8 text-center font-display text-xl font-bold text-brand-deep sm:text-2xl">
              Restaurants
            </h3>
            <VendorGrid vendors={restaurants} />
          </div>
          <div>
            <h3 className="mb-8 text-center font-display text-xl font-bold text-brand-deep sm:text-2xl">
              Stores &amp; supermarkets
            </h3>
            <VendorGrid vendors={stores} />
          </div>
        </div>
      ) : (
        <div className="mt-12">
          <VendorGrid vendors={rated.slice(0, 8)} />
        </div>
      )}

      <div className="mt-10 text-center">
        <ExploreNearbyButton />
      </div>
    </section>
  );
}
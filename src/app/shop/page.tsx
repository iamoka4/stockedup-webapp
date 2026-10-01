import type { Metadata } from "next";
import Link from "next/link";
import { LocationDropdown } from "@/components/LocationDropdown";
import { getCategories } from "@/lib/api/categories";
import { getVendors } from "@/lib/api/vendors";
import { getProducts } from "@/lib/api/products";
import type { Product } from "@/lib/api/types";
import { HomeSegmentTabs } from "@/components/home/HomeSegmentTabs";
import { PromoBanner } from "@/components/home/PromoBanner";
import { CategoryScroller } from "@/components/home/CategoryScroller";
import { PopularVendorsSection } from "@/components/home/PopularVendorsSection";
import { ProductRail } from "@/components/home/ProductRail";
import { RecommendedSection } from "@/components/home/RecommendedSection";
import { TrendingDrinksSection } from "@/components/home/TrendingDrinksSection";
import { HotProductsSection } from "@/components/home/HotProductsSection";
import { DEFAULT_CITY } from "@/lib/config";

export const revalidate = 60;

export const metadata: Metadata = {
  description:
    "Order cooked meals, groceries, supermarket essentials and more from businesses around you in Awka. Delivered by KoulriaGo.",
};

// Same category list the mobile app uses to separate drinks from featured items.
const DRINK_CATEGORIES = ["drinks", "water", "soft drinks", "beer & alcohol"];
const isDrink = (p: Product) =>
  DRINK_CATEGORIES.includes((p.category || "").trim().toLowerCase());

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// App-style home: mirrors the mobile home screen section for section.
export default async function HomePage() {
  const [{ categories }, { vendors }, products] = await Promise.all([
    getCategories().catch((err) => {
      console.error("[home] getCategories failed:", err);
      return { categories: [] };
    }),
    getVendors().catch((err) => {
      console.error("[home] getVendors failed:", err);
      return { vendors: [] };
    }),
    getProducts({ city: DEFAULT_CITY }).catch((err) => {
      console.error("[home] getProducts failed:", err);
      return [] as Product[];
    }),
  ]);

  // Mobile filters vendors by the selected city; fall back to all if none match.
  const inCity = vendors.filter(
    (v) => v.city?.toLowerCase() === DEFAULT_CITY.toLowerCase()
  );
  const cityVendors = inCity.length > 0 ? inCity : vendors;

  // Featured: everything except drinks, shuffled (reshuffled on each revalidation).
  const featured = shuffle(products.filter((p) => !isDrink(p)));
  // Popular Demand: mobile's no-history fallback (random 20). Personalised
  // scoring needs browsing history, which only exists in the browser.
  const popular = shuffle(products).slice(0, 20);

  return (
    <>
      {/* Location bar (mobile's SearchHeader) */}
      <div className="bg-brand pb-4 pt-2">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex max-w-xl items-center rounded-full bg-bg-raised p-2 text-ink shadow-lg shadow-black/15">
            <div className="min-w-0 flex-1 px-2">
              <LocationDropdown />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <HomeSegmentTabs />

        <div className="mt-6">
          <PromoBanner />
        </div>

        <section className="py-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink sm:text-xl">
              Categories
            </h2>
            <Link
              href="/categories"
              className="text-sm font-semibold text-brand-deep hover:underline"
            >
              View All
            </Link>
          </div>
          <CategoryScroller categories={categories} />
        </section>

        <PopularVendorsSection initialVendors={cityVendors} />

        <ProductRail
          title="Featured Products"
          products={featured}
          rows={3}
        />

        <RecommendedSection initialProducts={products} />
        <TrendingDrinksSection initialProducts={products} />

        <ProductRail
          title="🔥 Popular Demand"
          titleClassName="text-orange-600"
          products={popular}
          rows={2}
        />

        <HotProductsSection />
      </div>
    </>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/api/categories";
import { getVendors } from "@/lib/api/vendors";
import { getProducts } from "@/lib/api/products";
import { getPromoSlides } from "@/lib/api/promo";
import { getRestaurants, getSupermarkets } from "@/lib/api/vendor-listing";
import type { VendorListingItem } from "@/lib/api/vendor-listing";
import type { Product } from "@/lib/api/types";
import type { PromoSlide } from "@/lib/api/promo";
import { PromoBanner } from "@/components/home/PromoBanner";
import { CategoryScroller } from "@/components/home/CategoryScroller";
import { PopularVendorsSection } from "@/components/home/PopularVendorsSection";
import { VendorListingRail } from "@/components/home/VendorListingRail";
import {
  RestaurantMealsSection,
  TrendingDrinksSection,
  PopularDemandSection,
} from "@/components/home/CityProductRails";
import { HotProductsSection } from "@/components/home/HotProductsSection";
import { DEFAULT_CITY } from "@/lib/config";
import { categoryMatches, categoryNames } from "@/lib/utils/categoryMatch";

// Must be a literal here: Next.js can't read a re-exported revalidate value.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Order cooked meals, groceries, supermarket essentials and more from businesses around you in Awka. Delivered by KoulriaGo.",
};

const normalizeCity = (s: string) => s.toLowerCase().replace(/\s+/g, "");

// Loose shape: the API may return category_name or name.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MealCategory = Record<string, any>;

// Image for a meal category: first restaurant product in it that has a photo,
// then the category's own image (may be empty).
function mealCategoryImage(
  c: MealCategory,
  mealProducts: Product[],
): string | null {
  const names = categoryNames(c);
  const match = mealProducts.find(
    (p) => p.image && categoryMatches(p.category, names),
  );
  return match?.image ?? c.image ?? null;
}

// Homepage, section for section (matches the mobile Home screen):
//   Promo banner -> Categories -> Restock Your Kitchen (grocery vendors) ->
//   Refill Your Belly (restaurants) -> Quick Mart Picks (supermarkets) ->
//   What Are You Having Today? (restaurant meals) -> Trending Drinks ->
//   What's Everyone Buying? (Popular Demand) -> Explore Our Meal Categories ->
//   Best Sellers.
export default async function ShopPage() {
  const [
    { categories },
    { categories: mealCategories },
    { vendors },
    products,
    promoSlides,
    restaurants,
    supermarkets,
  ] = await Promise.all([
    // Grocery categories only, so restaurant ones don't leak into this row.
    getCategories("grocery").catch((err) => {
      console.error("[shop] getCategories failed:", err);
      return { categories: [] };
    }),
    getCategories("restaurant").catch((err) => {
      console.error("[shop] meal categories failed:", err);
      return { categories: [] };
    }),
    getVendors(DEFAULT_CITY).catch((err) => {
      console.error("[shop] getVendors failed:", err);
      return { vendors: [] };
    }),
    getProducts({ city: DEFAULT_CITY }).catch((err) => {
      console.error("[shop] getProducts failed:", err);
      return [] as Product[];
    }),
    // A promo failure must never break the page: no banner instead.
    getPromoSlides().catch((err) => {
      console.error("[shop] getPromoSlides failed:", err);
      return [] as PromoSlide[];
    }),
    getRestaurants(DEFAULT_CITY).catch((err) => {
      console.error("[shop] restaurants failed:", err);
      return [] as VendorListingItem[];
    }),
    getSupermarkets(DEFAULT_CITY).catch((err) => {
      console.error("[shop] supermarkets failed:", err);
      return [] as VendorListingItem[];
    }),
  ]);

  // Only vendors in the default city, no fallback to other cities.
  const cityVendors = vendors.filter(
    (v) => normalizeCity(v.city || "") === normalizeCity(DEFAULT_CITY),
  );

  // Meal categories, each with an image taken from one of its products.
  // The explicit MealCategory types stop TypeScript from narrowing the
  // spread result to `{ image: string | null }`.
  const mealProducts = products.filter((p) => p.business_type === "restaurant");
  const meals: MealCategory[] = ((mealCategories ?? []) as MealCategory[]).map(
    (c): MealCategory => ({
      ...c,
      image: mealCategoryImage(c, mealProducts),
    }),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {promoSlides.length > 0 && (
        <div>
          <PromoBanner slides={promoSlides} />
        </div>
      )}

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

      {/* 4. Restock Your Kitchen: grocery vendors */}
      <PopularVendorsSection
        title="Restock Your Kitchen"
        viewAllHref="/vendors"
        initialVendors={cityVendors}
      />

      {/* 5. Refill Your Belly: restaurant business cards */}
      <VendorListingRail
        businessType="restaurant"
        title="Refill Your Belly"
        viewAllHref="/restaurants"
        initialItems={restaurants}
      />

      {/* 6. Quick Mart Picks: supermarket business cards */}
      <VendorListingRail
        businessType="supermarket"
        title="Quick Mart Picks"
        viewAllHref="/supermarkets"
        initialItems={supermarkets}
      />

      {/* 7. What Are You Having Today?: restaurant meals (no drinks) */}
      <RestaurantMealsSection initialProducts={products} />

      {/* 8. Trending Drinks */}
      <TrendingDrinksSection initialProducts={products} />

      {/* 9. What's Everyone Buying? */}
      <PopularDemandSection initialProducts={products} />

      {/* 10. Explore Our Meal Categories: image comes from a product in the category */}
      {meals.length > 0 && (
        <section className="py-6">
          <h2 className="mb-4 font-display text-lg font-bold text-ink sm:text-xl">
            Explore Our Meal Categories
          </h2>
          <div className="scrollbar-none flex snap-x gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {meals.map((c) => {
              const name: string = c.category_name ?? c.name ?? "Category";
              return (
                <div
                  key={c.id}
                  className="w-[44vw] max-w-65 shrink-0 snap-start sm:w-56 lg:w-64"
                >
                  <Link
                    href={`/food?category=${encodeURIComponent(name)}`}
                    className="group block rounded-2xl border border-line bg-bg-raised p-2.5"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-brand-tint">
                      {c.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.image}
                          alt={name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <span className="grid size-full place-items-center text-4xl">
                          🍽️
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-black/45 px-3 py-2.5">
                        <p className="line-clamp-1 font-body text-[15px] font-bold text-white">
                          {name}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 11. Best Sellers */}
      <HotProductsSection />
    </div>
  );
}
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

// Must be a literal here: Next.js can't read a re-exported revalidate value.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Order cooked meals, groceries, supermarket essentials and more from businesses around you in Awka. Delivered by KoulriaGo.",
};

const normalizeCity = (s: string) => s.toLowerCase().replace(/\s+/g, "");

// Homepage, section for section (matches the mobile Home screen):
//   Promo banner -> Categories -> Restock Your Kitchen (grocery vendors) ->
//   Recharge Your Belly (restaurants) -> Supermarket Picks (supermarkets) ->
//   What Are You Having Today? (restaurant meals) -> Trending Drinks ->
//   What's Everyone Buying? (Popular Demand) -> Best Sellers.
// The Groceries / Restaurants / Supermarkets tabs no longer appear here; they
// live on the vendors pages (see VendorTypeTabs).
// The notification bell lives in the site header (see NotificationBell).
export default async function ShopPage() {
  const [
    { categories },
    { vendors },
    products,
    promoSlides,
    restaurants,
    supermarkets,
  ] = await Promise.all([
    getCategories().catch((err) => {
      console.error("[shop] getCategories failed:", err);
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {promoSlides.length > 0 && (
        <div>
          <PromoBanner slides={promoSlides} />
        </div>
      )}

      <section className="py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink sm:text-xl">Categories</h2>
          <Link
            href="/categories"
            className="text-sm font-semibold text-brand-deep hover:underline"
          >
            View All
          </Link>
        </div>
        <CategoryScroller categories={categories} />
      </section>

      {/* 4. Restock Your Kitchen: grocery vendors (renamed Popular vendors) */}
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

      {/* 6. Supermarket Picks: supermarket business cards */}
      <VendorListingRail
        businessType="supermarket"
        title="Supermarket Picks"
        viewAllHref="/supermarkets"
        initialItems={supermarkets}
      />

      {/* 7. What Are You Having Today?: restaurant meals (no drinks) */}
      <RestaurantMealsSection initialProducts={products} />

      {/* 8. Trending Drinks: repositioned, logic unchanged */}
      <TrendingDrinksSection initialProducts={products} />

      {/* 9. What's Everyone Buying?: Popular Demand, heading renamed */}
      <PopularDemandSection initialProducts={products} />

      {/* 10. Best Sellers */}
      <HotProductsSection />
    </div>
  );
}
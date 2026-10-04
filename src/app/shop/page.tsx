import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/api/categories";
import { getVendors } from "@/lib/api/vendors";
import { getProducts } from "@/lib/api/products";
import type { Product } from "@/lib/api/types";
import { HomeSegmentTabs } from "@/components/home/HomeSegmentTabs";
import { PromoBanner } from "@/components/home/PromoBanner";
import { CategoryScroller } from "@/components/home/CategoryScroller";
import { PopularVendorsSection } from "@/components/home/PopularVendorsSection";
import {
  FeaturedProductsSection,
  PopularDemandSection,
} from "@/components/home/CityProductRails";
import { RecommendedSection } from "@/components/home/RecommendedSection";
import { TrendingDrinksSection } from "@/components/home/TrendingDrinksSection";
import { HotProductsSection } from "@/components/home/HotProductsSection";
import { DEFAULT_CITY } from "@/lib/config";

export const revalidate = 60;

export const metadata: Metadata = {
  description:
    "Order cooked meals, groceries, supermarket essentials and more from businesses around you in Awka. Delivered by KoulriaGo.",
};

const normalizeCity = (s: string) => s.toLowerCase().replace(/\s+/g, "");

// App-style home: mirrors the mobile home screen section for section.
export default async function HomePage() {
  const [{ categories }, { vendors }, products] = await Promise.all([
    getCategories().catch((err) => {
      console.error("[home] getCategories failed:", err);
      return { categories: [] };
    }),
    getVendors(DEFAULT_CITY).catch((err) => {
      console.error("[home] getVendors failed:", err);
      return { vendors: [] };
    }),
    getProducts({ city: DEFAULT_CITY }).catch((err) => {
      console.error("[home] getProducts failed:", err);
      return [] as Product[];
    }),
  ]);

  // Only vendors in the default city. No fallback to "all vendors": if there
  // are none, the section says so instead of showing other cities.
  const cityVendors = vendors.filter(
    (v) => normalizeCity(v.city || "") === normalizeCity(DEFAULT_CITY)
  );

  return (
    <>
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

        <FeaturedProductsSection initialProducts={products} />

        <RecommendedSection initialProducts={products} />
        <TrendingDrinksSection initialProducts={products} />

        <PopularDemandSection initialProducts={products} />

        <HotProductsSection />
      </div>
    </>
  );
}
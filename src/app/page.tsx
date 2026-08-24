import Link from "next/link";
import { getCategories } from "@/lib/api/categories";
import { getVendors } from "@/lib/api/vendors";
import { getProducts } from "@/lib/api/products";
import { PromoBanner } from "@/components/home/PromoBanner";
import { CategoryScroller } from "@/components/home/CategoryScroller";
import { InstallAppBanner } from "@/components/home/InstallAppBanner";
import { PopularVendorsSection } from "@/components/home/PopularVendorsSection";
import { FreshPicksSection } from "@/components/home/FreshPicksSection";
import { DEFAULT_CITY } from "@/lib/config";

export const revalidate = 60;

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
      return [];
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <PromoBanner />

      <section className="py-8">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
            Shop by category
          </h2>
          <Link href="/categories" className="text-sm font-medium text-brand-deep hover:underline">
            See all {categories.length > 0 ? `(${categories.length})` : ""}
          </Link>
        </div>
        <CategoryScroller categories={categories} />
      </section>

      <div className="my-8">
        <InstallAppBanner />
      </div>

      <PopularVendorsSection initialVendors={vendors} />
      <FreshPicksSection initialProducts={products} />
    </div>
  );
}
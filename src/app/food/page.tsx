import type { Metadata } from "next";
import { getFoodProducts } from "@/lib/api/products";
import { ProductListingPage } from "@/components/shop/ProductListingPage";
import { DEFAULT_CITY } from "@/lib/config";
import type { Product } from "@/lib/api/types";

export const metadata: Metadata = {
  title: `Food — order cooked meals in ${DEFAULT_CITY}`,
  description: `Order cooked meals from restaurants and food vendors in ${DEFAULT_CITY}, delivered by KoulriaGo.`,
};

export const revalidate = 60;

type SearchParams = { category?: string };

function matchesCategory(p: Product, wanted: string): boolean {
  const cat = (p.category || "").trim().toLowerCase();
  if (!cat) return false;
  if (cat === wanted) return true;
  if (cat.includes(" & ") || cat.includes(" and ")) {
    return cat
      .split(/\s*&\s*|\s+and\s+/i)
      .some((part) => part.trim() === wanted);
  }
  return false;
}

export default async function FoodPage({
  searchParams,
}: {
  // A Promise in Next 15, a plain object in Next 14. `await` handles both.
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const { category } = (await searchParams) ?? {};
  const wanted = category?.trim().toLowerCase();

  let products: Product[] = [];
  let failed = false;
  try {
    products = await getFoodProducts({ city: DEFAULT_CITY });
  } catch (err) {
    console.error("[food] getFoodProducts failed:", err);
    failed = true;
  }

  if (wanted) {
    products = products.filter((p) => matchesCategory(p, wanted));
  }

  return (
    <ProductListingPage
      title={category?.trim() || "Food"}
      mainLabel={category?.trim() || "Meals"}
      intro={
        wanted
          ? `${category} meals from restaurants and food vendors around you.`
          : "Cooked meals from restaurants and food vendors around you."
      }
      products={products}
      failed={failed}
      emptyText={
        wanted
          ? `No ${category} meals are listed yet. Check back soon.`
          : "No meals are listed yet. Check back soon."
      }
    />
  );
}
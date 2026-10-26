import type { Metadata } from "next";
import { getFoodProducts } from "@/lib/api/products";
import { ProductListingPage } from "@/components/shop/ProductListingPage";
import { DEFAULT_CITY } from "@/lib/config";
import { categoryMatches } from "@/lib/utils/categoryMatch";
import type { Product } from "@/lib/api/types";

export const metadata: Metadata = {
  title: `Food — order cooked meals in ${DEFAULT_CITY}`,
  description: `Order cooked meals from restaurants and food vendors in ${DEFAULT_CITY}, delivered by KoulriaGo.`,
};

export const revalidate = 60;

type SearchParams = { category?: string };

export default async function FoodPage({
  searchParams,
}: {
  // A Promise in Next 15+, a plain object in Next 14. `await` handles both.
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const { category } = (await searchParams) ?? {};
  const wanted = category?.trim();

  let products: Product[] = [];
  let failed = false;
  try {
    products = await getFoodProducts({ city: DEFAULT_CITY });
  } catch (err) {
    console.error("[food] getFoodProducts failed:", err);
    failed = true;
  }

  // Same matching rule as the image on the home page's meal category cards,
  // so a card that shows a product always opens a list that contains it.
  if (wanted) {
    products = products.filter((p) => categoryMatches(p.category, [wanted]));
  }

  return (
    <ProductListingPage
      title={wanted || "Food"}
      mainLabel={wanted || "Meals"}
      intro={
        wanted
          ? `${wanted} meals from restaurants and food vendors around you.`
          : "Cooked meals from restaurants and food vendors around you."
      }
      products={products}
      failed={failed}
      emptyText={
        wanted
          ? `No ${wanted} meals are listed yet. Check back soon.`
          : "No meals are listed yet. Check back soon."
      }
    />
  );
}
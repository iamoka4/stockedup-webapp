import type { Metadata } from "next";
import { getGroceryProducts } from "@/lib/api/products";
import { ProductListingPage } from "@/components/shop/ProductListingPage";
import { DEFAULT_CITY } from "@/lib/config";
import type { Product } from "@/lib/api/types";

export const metadata: Metadata = {
  title: `Groceries — fresh produce and foodstuff in ${DEFAULT_CITY}`,
  description: `Shop fresh produce, foodstuff and everyday essentials in ${DEFAULT_CITY}, delivered by KoulriaGo.`,
};

export const revalidate = 60;

export default async function GroceriesPage() {
  let products: Product[] = [];
  let failed = false;
  try {
    products = await getGroceryProducts({ city: DEFAULT_CITY });
  } catch (err) {
    console.error("[groceries] getGroceryProducts failed:", err);
    failed = true;
  }

  return (
    <ProductListingPage
      title="Groceries"
      intro="Fresh produce, foodstuff and everyday essentials."
      products={products}
      failed={failed}
      emptyText="No grocery items are listed yet. Check back soon."
    />
  );
}
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

export default async function FoodPage() {
  let products: Product[] = [];
  let failed = false;
  try {
    products = await getFoodProducts({ city: DEFAULT_CITY });
  } catch (err) {
    console.error("[food] getFoodProducts failed:", err);
    failed = true;
  }

  return (
    <ProductListingPage
      title="Food"
      mainLabel="Meals"
      intro="Cooked meals from restaurants and food vendors around you."
      products={products}
      failed={failed}
      emptyText="No meals are listed yet. Check back soon."
    />
  );
}
import type { Metadata } from "next";
import { getSupermarketProducts } from "@/lib/api/products";
import { ProductListingPage } from "@/components/shop/ProductListingPage";
import { DEFAULT_CITY } from "@/lib/config";
import type { Product } from "@/lib/api/types";

export const metadata: Metadata = {
  title: `Supermarkets — shop and get it delivered in ${DEFAULT_CITY}`,
  description: `Shop from supermarkets in ${DEFAULT_CITY} and get your items delivered by KoulriaGo.`,
};

export const revalidate = 60;

export default async function SupermarketsPage() {
  let products: Product[] = [];
  let failed = false;
  try {
    products = await getSupermarketProducts({ city: DEFAULT_CITY });
  } catch (err) {
    console.error("[supermarkets] getSupermarketProducts failed:", err);
    failed = true;
  }

  return (
    <ProductListingPage
      title="Supermarkets"
      intro="Shop from your favourite supermarkets and get your items delivered."
      products={products}
      failed={failed}
      emptyText="No supermarket items are listed yet. Check back soon."
    />
  );
}

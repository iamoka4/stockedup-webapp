import type { Metadata } from "next";
import { VendorListing } from "@/components/vendors/VendorListing";
import { getRestaurants } from "@/lib/api/vendor-listing";
import type { VendorListingItem } from "@/lib/api/vendor-listing";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Restaurants",
  description: "Order cooked meals from restaurants near you on StockedUp.",
};

export default async function RestaurantsPage() {
  let items: VendorListingItem[] = [];
  let failed = false;
  try {
    items = await getRestaurants();
  } catch (err) {
    console.error("[restaurants] getRestaurants failed:", err);
    failed = true;
  }
  return <VendorListing businessType="restaurant" items={items} failed={failed} />;
}
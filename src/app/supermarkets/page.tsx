import type { Metadata } from "next";
import { VendorListing } from "@/components/vendors/VendorListing";
import { getSupermarkets } from "@/lib/api/vendor-listing";
import type { VendorListingItem } from "@/lib/api/vendor-listing";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Supermarkets",
  description: "Shop supermarket essentials from stores near you on StockedUp.",
};

export default async function SupermarketsPage() {
  let items: VendorListingItem[] = [];
  let failed = false;
  try {
    items = await getSupermarkets();
  } catch (err) {
    console.error("[supermarkets] getSupermarkets failed:", err);
    failed = true;
  }
  return <VendorListing businessType="supermarket" items={items} failed={failed} />;
}
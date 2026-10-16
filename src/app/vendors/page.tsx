import type { Metadata } from "next";
import { getVendors } from "@/lib/api/vendors";
import { VendorGridClient } from "./VendorGridClient";
import { VendorTypeTabs } from "@/components/vendors/VendorTypeTabs";
import { DEFAULT_CITY } from "@/lib/config";

export const revalidate = 60;

export const metadata: Metadata = {
  title: `Vendors in ${DEFAULT_CITY} — Foodstuff delivery`,
  description: `Browse local foodstuff and grocery vendors delivering across ${DEFAULT_CITY}. Compare ratings and shop directly from their storefronts.`,
};

export default async function VendorsPage() {
  const { vendors } = await getVendors().catch((err) => {
    console.error("[vendors] getVendors failed:", err);
    return { vendors: [] };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Groceries is this page; Restaurants and Supermarkets link to their own routes */}
      <div className="mb-8">
        <VendorTypeTabs active="groceries" />
      </div>

      <VendorGridClient initialVendors={vendors} />
    </div>
  );
}
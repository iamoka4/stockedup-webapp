import type { Metadata } from "next";
import { getVendors } from "@/lib/api/vendors";
import { VendorGridClient } from "./VendorGridClient";
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

  // VendorGridClient renders the full page (header, tabs and cards) so this
  // route matches the Restaurants and Supermarkets pages exactly.
  return <VendorGridClient initialVendors={vendors} />;
}
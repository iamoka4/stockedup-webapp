import type { Metadata } from "next";
import { StickyLocationBar } from "@/components/home/StickyLocationBar";
import { Hero } from "@/components/home/Hero";
import { PlatformCards } from "@/components/home/PlatformCards";
import { TopVendors } from "@/components/home/TopVendors";
import { HowItWorks } from "@/components/home/HowItWorks";
import { KoulriaGo } from "@/components/home/KoulriaGo";
import { WhereWeDeliver } from "@/components/home/WhereWeDeliver";
import { AppDownload } from "@/components/home/AppDownload";
import { JoinUs } from "@/components/home/JoinUs";
import { CtaBand } from "@/components/home/CtaBand";
import { getVendors } from "@/lib/api/vendors";
import { getRestaurants, getSupermarkets } from "@/lib/api/vendor-listing";
import type { Vendor } from "@/lib/api/types";

export const metadata: Metadata = {
  description:
    "Order cooked meals, groceries, supermarket essentials and more from businesses around you in Awka. Delivered by KoulriaGo.",
};

// Re-fetch partners at most every 5 minutes instead of on every visit.
export const revalidate = 300;

// Informative landing page only. The marketplace (products, vendors,
// categories) lives at /shop, for logged-in users.
export default async function HomePage() {
  // "Top businesses" is informational, not a storefront, so it is not
  // location-filtered: restaurants and supermarkets are fetched for every
  // city (city = null). If an API call fails, that part is simply left out.
  const [groceries, restaurants, supermarkets] = await Promise.all([
    getVendors()
      .then((res) => res.vendors ?? [])
      .catch(() => [] as Vendor[]),
    getRestaurants(null).catch(() => []),
    getSupermarkets(null).catch(() => []),
  ]);

  return (
    <>
      <StickyLocationBar />
      <Hero />
      <PlatformCards />
      <TopVendors
        groceries={groceries}
        restaurants={restaurants}
        supermarkets={supermarkets}
      />
      <HowItWorks />
      <KoulriaGo />
      <WhereWeDeliver />
      <AppDownload />
      <JoinUs />
      <CtaBand />
    </>
  );
}
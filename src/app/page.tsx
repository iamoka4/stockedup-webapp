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
import type { Vendor } from "@/lib/api/types";

export const metadata: Metadata = {
  description:
    "Order cooked meals, groceries, supermarket essentials and more from businesses around you in Awka. Delivered by KoulriaGo.",
};

// Re-fetch vendors at most every 5 minutes instead of on every visit.
export const revalidate = 300;

// Informative landing page only. The marketplace (products, vendors,
// categories) lives at /shop, for logged-in users.
export default async function HomePage() {
  // If the API is down, the landing page should still load without the vendors section.
  let vendors: Vendor[] = [];
  try {
    const res = await getVendors();
    vendors = res.vendors ?? [];
  } catch {
    vendors = [];
  }

  return (
    <>
      <StickyLocationBar />
      <Hero />
      <PlatformCards />
      <TopVendors vendors={vendors} />
      <HowItWorks />
      <KoulriaGo />
      <WhereWeDeliver />
      <AppDownload />
      <JoinUs />
      <CtaBand />
    </>
  );
}
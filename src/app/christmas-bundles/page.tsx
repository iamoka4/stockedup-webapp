// src/app/christmas-bundles/page.tsx
import type { Metadata } from "next";
import { ChristmasBundlesListing } from "@/components/shop/ChristmasBundlesListing";

export const metadata: Metadata = {
  title: "Christmas Bundles Sales",
  description: "Everything you need for a joyful Christmas, bundled in one place.",
};

export default function ChristmasBundlesPage() {
  return <ChristmasBundlesListing />;
}
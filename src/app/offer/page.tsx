import type { Metadata } from "next";
import { OfferSection } from "@/components/home/OfferSection";

export const metadata: Metadata = {
  title: "What We Offer",
};

export default function OfferPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <OfferSection />
    </div>
  );
}
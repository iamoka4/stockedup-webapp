import type { Metadata } from "next";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";

export const metadata: Metadata = {
  title: "How It Works",
};

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HowItWorksSection />
    </div>
  );
}
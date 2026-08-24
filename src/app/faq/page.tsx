import type { Metadata } from "next";
import { FaqSection } from "@/components/home/FaqSection";

export const metadata: Metadata = {
  title: "FAQ",
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <FaqSection />
    </div>
  );
}
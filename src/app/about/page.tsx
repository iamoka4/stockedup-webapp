import type { Metadata } from "next";
import { AboutSection } from "@/components/home/AboutSection";

export const metadata: Metadata = {
  title: "About Us",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <AboutSection />
    </div>
  );
}
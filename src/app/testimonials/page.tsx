import type { Metadata } from "next";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";

export const metadata: Metadata = {
  title: "Testimonials",
};

export default function TestimonialsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <TestimonialsSection />
    </div>
  );
}
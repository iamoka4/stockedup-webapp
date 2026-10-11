import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/vendor/OnboardingFlow";

export const metadata: Metadata = {
  title: "Set up your shop",
  robots: { index: false, follow: false },
};

export default function MerchantOnboardingPage() {
  return <OnboardingFlow />;
}
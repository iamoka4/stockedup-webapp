import type { Metadata } from "next";
import type { ReactNode } from "react";
import { VendorGuard } from "@/components/vendor/VendorGuard";

export const metadata: Metadata = {
  title: "Merchant dashboard",
  robots: { index: false, follow: false },
};

export default function VendorLayout({ children }: { children: ReactNode }) {
  return <VendorGuard>{children}</VendorGuard>;
}
import type { ReactNode } from "react";
import { VendorGuard } from "@/components/vendor/VendorGuard";
import { VendorBottomNav } from "@/components/vendor/VendorBottomNav";

// Wraps every page inside src/app/merchants/(portal)/ — dashboard, shop, orders, menu,
// notifications. The "(portal)" folder name is a route group, so it does not appear in the URL.
//
// VendorGuard sends visitors who aren't logged in as a vendor to /merchants/login,
// and vendors who haven't finished setup to /merchants/onboarding.
export default function MerchantPortalLayout({ children }: { children: ReactNode }) {
  return (
    <VendorGuard>
      {/* Bottom padding keeps content clear of the fixed tab bar. */}
      <div className="pb-24">{children}</div>
      <VendorBottomNav />
    </VendorGuard>
  );
}
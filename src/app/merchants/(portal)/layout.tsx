import type { ReactNode } from "react";
import { VendorBottomNav } from "@/components/vendor/VendorBottomNav";

// Wraps every page inside src/app/merchants/(portal)/ — dashboard, shop, orders, menu.
// The "(portal)" folder name is a route group, so it does not appear in the URL.
export default function MerchantPortalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Bottom padding keeps content clear of the fixed tab bar. */}
      <div className="pb-24">{children}</div>
      <VendorBottomNav />
    </>
  );
}
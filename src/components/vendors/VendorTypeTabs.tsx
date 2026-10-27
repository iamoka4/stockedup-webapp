import Link from "next/link";
import { ShoppingCart, UtensilsCrossed, Store } from "lucide-react";

// The Groceries / Restaurants / Supermarkets pill (was HomeSegmentTabs on the
// homepage). It now sits at the top of the vendors pages; each tab is a real
// route, so SSR, deep links and the back button keep working.
export type VendorTypeTab = "groceries" | "restaurants" | "supermarkets";

const TABS = [
  { key: "groceries", label: "Groceries", icon: ShoppingCart, href: "/vendors" },
  { key: "restaurants", label: "Restaurants", icon: UtensilsCrossed, href: "/restaurants" },
  { key: "supermarkets", label: "Supermarkets", icon: Store, href: "/supermarkets" },
] as const;

export function VendorTypeTabs({ active }: { active: VendorTypeTab }) {
  return (
    <nav
      aria-label="Business types"
      className="flex rounded-full bg-brand p-1 sm:max-w-md"
    >
      {TABS.map(({ key, label, icon: Icon, href }) => {
        const base =
          "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold sm:text-sm";
        return key === active ? (
          <span
            key={key}
            aria-current="page"
            className={`${base} bg-white dark:bg-bg-raised font-bold text-brand`}
          >
            <Icon size={16} />
            {label}
          </span>
        ) : (
          <Link key={key} href={href} className={`${base} text-white`}>
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
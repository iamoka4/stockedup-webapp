import Link from "next/link";
import { ShoppingCart, UtensilsCrossed, Store } from "lucide-react";

// Mobile's pill selector: Groceries is active on Home, the others navigate away.
const TABS = [
  { label: "Groceries", icon: ShoppingCart, href: null },
  { label: "Restaurants", icon: UtensilsCrossed, href: "/restaurants" },
  { label: "Supermarkets", icon: Store, href: "/supermarkets" },
] as const;

export function HomeSegmentTabs() {
  return (
    <nav
      aria-label="Shop sections"
      className="flex rounded-full bg-brand p-1 sm:max-w-md"
    >
      {TABS.map(({ label, icon: Icon, href }) => {
        const base =
          "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold sm:text-sm";
        return href ? (
          <Link key={label} href={href} className={`${base} text-white`}>
            <Icon size={16} />
            {label}
          </Link>
        ) : (
          <span
            key={label}
            aria-current="page"
            className={`${base} bg-white font-bold text-brand`}
          >
            <Icon size={16} />
            {label}
          </span>
        );
      })}
    </nav>
  );
}
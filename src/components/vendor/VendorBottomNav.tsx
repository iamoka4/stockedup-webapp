"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VendorIcon, type VendorIconName } from "./icons";

type Tab = {
  label: string;
  href: string;
  icon: VendorIconName;
  // Set to true as each page gets built. Unbuilt tabs show greyed out instead of 404ing.
  ready: boolean;
};

// Same four tabs, order and symbols as the mobile vendor app:
// Home, Shop, Orders, Menu.
const TABS: Tab[] = [
  { label: "Home", href: "/merchants/dashboard", icon: "home", ready: true },
  { label: "Shop", href: "/merchants/shop-profile", icon: "shop", ready: true },
  { label: "Orders", href: "/merchants/orders", icon: "orders", ready: true },
  { label: "Menu", href: "/merchants/menu", icon: "menu", ready: true },
];

export function VendorBottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Merchant navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-4">
        {TABS.map((tab) => {
          const focused = pathname === tab.href || pathname.startsWith(tab.href + "/");

          const inner = (
            <>
              {/* Focused: orange filled circle with white symbol (as on mobile). */}
              <span
                className={`flex size-9 items-center justify-center rounded-full transition ${
                  focused ? "bg-brand text-white" : "text-black"
                }`}
              >
                <VendorIcon name={tab.icon} className="size-5" />
              </span>
              <span
                className={`text-[11px] font-semibold ${focused ? "text-brand" : "text-black"}`}
              >
                {tab.label}
              </span>
            </>
          );

          const base = "flex h-[60px] flex-col items-center justify-center gap-0.5 px-2";

          return (
            <li key={tab.label}>
              {tab.ready ? (
                <Link href={tab.href} aria-current={focused ? "page" : undefined} className={base}>
                  {inner}
                </Link>
              ) : (
                <span
                  aria-disabled
                  title="Coming soon"
                  className={`${base} cursor-not-allowed opacity-40`}
                >
                  {inner}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
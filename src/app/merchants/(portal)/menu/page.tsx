"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/lib/api/auth";
import { getOrdersMetric, type OrderMetric } from "@/lib/api/vendor";
import { VendorIcon, type VendorIconName } from "@/components/vendor/icons";

type MenuItem = {
  id: string;
  icon: VendorIconName;
  title: string;
  subtitle: string;
  badge?: string | null;
  badgeClass?: string;
  href?: string;
  external?: boolean;
  highlight?: boolean;
  // false = page not built on web yet, shown as "Soon" instead of leading to a 404.
  ready: boolean;
};

type MenuSection = { title: string; items: MenuItem[] };

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.africa.stockedup";

export default function MerchantMenuPage() {
  const router = useRouter();
  const [metric, setMetric] = useState<OrderMetric | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    getOrdersMetric()
      .then(setMetric)
      .catch(() => { });
  }, []);

  const pending = metric?.metrics?.pendingOrders ?? 0;
  const avgRating = metric?.rating?.avgRating ?? 0;
  const totalReviews = metric?.rating?.totalReviews ?? 0;

  function handleLogout() {
    setLoggingOut(true);
    logout();
    router.replace("/merchants/login");
    router.refresh();
  }

  const sections: MenuSection[] = [
    {
      title: "Financial",
      items: [
        {
          id: "wallet",
          icon: "wallet",
          title: "Wallet",
          subtitle: "View balance and transactions",
          href: "/merchants/wallet",
          ready: false,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          id: "personal-info",
          icon: "person",
          title: "Personal Information",
          subtitle: "Update your profile details",
          href: "/merchants/personal-information",
          ready: false,
        },
      ],
    },
    {
      title: "Business",
      items: [
        {
          id: "products",
          icon: "package",
          title: "Product Listing",
          subtitle: "Manage your products inventory",
          href: "/merchants/products",
          ready: true,
        },
        {
          id: "orders",
          icon: "clipboard",
          title: "Order Management",
          subtitle: "Track and fulfill customer orders",
          badge: pending > 0 ? `${pending} New` : null,
          badgeClass: "bg-red-500",
          href: "/merchants/order-management",
          ready: true,
        },
        {
          id: "scheduled-orders",
          icon: "calendar",
          title: "Scheduled Orders",
          subtitle: "View and manage scheduled deliveries",
          href: "/merchants/orders?tab=Scheduled",
          ready: true,
        },
        {
          id: "analytics",
          icon: "chart",
          title: "Analytics & Reports",
          subtitle: "View sales performance insights",
          href: "/merchants/analytics",
          ready: true,
        },
        {
          id: "referral-analytics",
          icon: "people",
          title: "Referral Analytics",
          subtitle: "Track referrals and rewards performance",
          href: "/merchants/referrals",
          ready: true,
        },
        {
          id: "shop-location",
          icon: "location",
          title: "Shop Location",
          subtitle: "Update your shop's pin on the map",
          href: "/merchants/shop-location",
          ready: false,
        },
      ],
    },
    {
      title: "Support & Settings",
      items: [
        {
          id: "reviews",
          icon: "star",
          title: "Reviews",
          subtitle: "See what customers are saying",
          badge: totalReviews > 0 ? avgRating.toFixed(1) : null,
          badgeClass: "bg-amber-500",
          href: "/merchants/reviews",
          ready: false,
        },
        {
          id: "support",
          icon: "help",
          title: "Support",
          subtitle: "Get assistance and contact us",
          href: "/merchants/support",
          ready: false,
        },
        {
          id: "notification-settings",
          icon: "bell",
          title: "Notification Settings",
          subtitle: "Manage your push notifications",
          href: "/merchants/notification-settings",
          ready: true,
        },
      ],
    },
    {
      title: "Rate Us",
      items: [
        {
          id: "rate-us",
          icon: "star",
          title: "Rate Us",
          subtitle: "Enjoying the app? Leave us a review",
          href: PLAY_STORE_URL,
          external: true,
          highlight: true,
          ready: true,
        },
      ],
    },
  ];

  function Row({ item }: { item: MenuItem }) {
    const rowBase = `flex items-center gap-3.5 rounded-2xl border p-3.5 ${item.highlight ? "border-amber-400 bg-[#FFFDF5]" : "border-line bg-white"
      }`;

    const body = (
      <>
        <span
          className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${item.highlight ? "bg-[#FFF9E6] text-amber-500" : "bg-brand text-white"
            }`}
        >
          <VendorIcon name={item.icon} />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`block text-[15px] font-bold ${item.highlight ? "text-[#B8860B]" : "text-gray-900"
              }`}
          >
            {item.title}
          </span>
          <span className="mt-0.5 block text-xs leading-4 text-gray-500">{item.subtitle}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {!item.ready ? (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">
              Soon
            </span>
          ) : (
            item.badge && (
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold text-white ${item.badgeClass ?? "bg-brand"
                  }`}
              >
                {item.badge}
              </span>
            )
          )}
          <VendorIcon name="chevron" className="size-5 text-gray-400" />
        </span>
      </>
    );

    if (!item.ready || !item.href) {
      return (
        <div aria-disabled className={`${rowBase} cursor-not-allowed opacity-60`}>
          {body}
        </div>
      );
    }
    if (item.external) {
      return (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${rowBase} transition hover:border-brand`}
        >
          {body}
        </a>
      );
    }
    return (
      <Link href={item.href} className={`${rowBase} transition hover:border-brand`}>
        {body}
      </Link>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-5 pb-5 pt-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-extrabold">Menu</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your vendor account</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="mb-3 ml-1 mt-6 text-[13px] font-bold uppercase tracking-wide text-gray-400">
              {section.title}
            </h2>
            <div className="space-y-2.5">
              {section.items.map((item) => (
                <Row key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}

        {/* App info */}
        <div className="mt-8 text-center">
          <p className="text-[13px] font-medium text-gray-400">StockedUp Africa</p>
          <p className="mt-1 text-[11px] text-gray-300">© 2026 All rights reserved</p>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={loggingOut}
          className="mx-auto mt-4 flex items-center justify-center gap-2 py-3.5 text-base font-semibold text-red-500 disabled:opacity-60"
        >
          <VendorIcon name="logout" className="size-5" />
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>

      {/* Logout confirmation */}
      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm log out"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5"
          onClick={() => !loggingOut && setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-xs rounded-3xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-6 text-center text-xl font-bold">Confirm Log Out?</h3>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="min-h-12 flex-1 rounded-xl bg-brand font-semibold text-white disabled:opacity-70"
              >
                {loggingOut ? "..." : "Yes"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={loggingOut}
                className="min-h-12 flex-1 rounded-xl border-2 border-brand bg-white font-semibold text-brand"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Wallet,
  Package,
  Gift,
  Headset,
  MapPin,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAuthModalStore } from "@/store/authModalStore";

export default function AccountPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const openLogin = useAuthModalStore((s) => s.openLogin);

  useEffect(() => {
    if (!isLoading && !user) {
      openLogin("/account");
      router.replace("/");
    }
  }, [isLoading, user, router, openLogin]);

  if (isLoading || !user) {
    return <div className="mx-auto max-w-lg px-4 py-16 text-ink-soft">Loading…</div>;
  }

  const displayName = user.first_name ?? user.full_name ?? "there";
  const initials = displayName.slice(0, 1).toUpperCase();

  const menuItems = [
    {
      id: "profile-detail",
      icon: <User size={20} />,
      title: "Profile Detail",
      subtitle: "Update your personal information",
      href: "/account/profile",
    },
    {
      id: "wallet",
      icon: <Wallet size={20} />,
      title: "Wallet",
      subtitle: "View your balance and history",
      href: "/account/wallet",
    },
    {
      id: "orders",
      icon: <Package size={20} />,
      title: "Order history",
      subtitle: "View your past orders",
      href: "/account/orders",
    },
    {
      id: "addresses",
      icon: <MapPin size={20} />,
      title: "Saved addresses",
      subtitle: "Manage your delivery addresses",
      href: "/account/addresses",
    },
    {
      id: "referrals",
      icon: <Gift size={20} />,
      title: "Refer & Earn",
      subtitle: "Invite friends and earn rewards",
      href: "/account/referrals",
    },
    {
      id: "support",
      icon: <Headset size={20} />,
      title: "Support",
      subtitle: "Get help and contact us",
      href: "/contact",
    },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-deep/10 text-xl font-semibold text-brand-deep">
          {initials}
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Hi, {displayName}
          </h1>
          <p className="mt-0.5 text-sm text-ink-soft">{user.email}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {menuItems.map((item) => (
          <AccountLink key={item.id} {...item} />
        ))}

        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="flex items-center gap-3 rounded-2xl border border-line bg-bg-raised p-4 text-left text-sm font-medium text-clay hover:border-clay"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay/10 text-clay">
            <LogOut size={20} />
          </span>
          Sign out
        </button>
      </div>

      <p className="mt-10 text-center text-xs text-ink-soft">
        StockedUp Africa · © {new Date().getFullYear()}
      </p>
    </div>
  );
}

function AccountLink({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-line bg-bg-raised p-4 hover:border-brand-deep"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-deep/10 text-brand-deep">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-medium text-ink">{title}</span>
        <span className="block text-xs text-ink-soft">{subtitle}</span>
      </span>
      <ChevronRight size={18} className="text-ink-soft" />
    </Link>
  );
}
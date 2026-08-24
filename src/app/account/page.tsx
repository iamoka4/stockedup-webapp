"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Package, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export default function AccountPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login?next=/account");
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <div className="mx-auto max-w-lg px-4 py-16 text-ink-soft">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">
        Hi, {user.first_name ?? user.full_name ?? "there"}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">{user.email}</p>

      <div className="mt-8 flex flex-col gap-3">
        <AccountLink href="/account/orders" icon={<Package size={20} />} label="Order history" />
        <AccountLink href="/account/addresses" icon={<MapPin size={20} />} label="Saved addresses" />
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="flex items-center gap-3 rounded-2xl border border-line bg-bg-raised p-4 text-left text-sm font-medium text-clay hover:border-clay"
        >
          <LogOut size={20} />
          Sign out
        </button>
      </div>
    </div>
  );
}

function AccountLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-line bg-bg-raised p-4 text-sm font-medium text-ink hover:border-brand"
    >
      <span className="text-brand">{icon}</span>
      {label}
    </Link>
  );
}

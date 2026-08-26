"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, Menu } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAuthModalStore } from "@/store/authModalStore";
import { LocationDropdown } from "@/components/LocationDropdown";
import { AppStoreBadges } from "@/components/AppStoreBadges";
import { MobileMenu } from "@/components/MobileMenu";
import { useState } from "react";

export function Header() {
  const { data: cart } = useCart();
  const { user, logout } = useAuth();
  const openLogin = useAuthModalStore((s) => s.openLogin);
  const openRegister = useAuthModalStore((s) => s.openRegister);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim())
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:gap-4">
        {/* Hamburger — mobile only. Everything it opens (account/login,
            location, app links) already exists elsewhere in this header
            but is hidden below the md breakpoint, so this is the only way
            in on a phone-width viewport without switching to desktop mode. */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink hover:bg-bg-raised md:hidden"
        >
          <Menu size={22} />
        </button>

        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/weblogo.png"
            alt="StockedUp Africa"
            width={144}
            height={36}
            priority
            style={{ width: "auto", height: "36px" }}
          />
        </Link>

        <div className="hidden shrink-0 md:block">
          <LocationDropdown />
        </div>

        <form onSubmit={handleSearch} className="relative min-w-0 flex-1">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for rice, tomatoes, vendors…"
            className="w-full rounded-full border border-line bg-bg-raised py-2.5 pl-9 pr-4 text-sm outline-none focus:border-brand"
          />
        </form>

        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <Link
              href="/account"
              className="hidden items-center rounded-full px-3 py-2 text-sm font-medium text-ink hover:text-brand-deep sm:flex"
            >
              {user.first_name ?? "Account"}
            </Link>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => openLogin()}
                className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-ink"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => openRegister()}
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-deep"
              >
                Sign up
              </button>
            </div>
          )}

          <div className="hidden items-center gap-2 border-l border-line pl-3 md:flex">
            <AppStoreBadges />
          </div>

          <CartLink count={cart?.count ?? 0} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line px-4 py-2 md:hidden">
        <LocationDropdown compact />

        {!user && (
          <button
            type="button"
            onClick={() => openLogin()}
            className="text-xs font-semibold text-brand-deep"
          >
            Sign in
          </button>
        )}
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        onLogin={openLogin}
        onRegister={openRegister}
        onLogout={logout}
      />
    </header>
  );
}

function CartLink({ count }: { count: number }) {
  return (
    <Link
      href="/cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-sm transition-all hover:bg-brand-deep hover:shadow-md"
      aria-label="View cart"
    >
      <ShoppingCart size={21} strokeWidth={2.2} />

      {count > 0 && (
        <span className="tabular absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-bg bg-white px-1 text-[11px] font-bold text-brand-deep">
          {count}
        </span>
      )}
    </Link>
  );
}

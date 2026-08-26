"use client";

import Image from "next/image";
import Link from "next/link";
import { X, User, LogOut, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AppStoreBadges } from "@/components/AppStoreBadges";
import { LocationDropdown } from "@/components/LocationDropdown";
import type { AuthUser } from "@/lib/api/types";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  user: AuthUser | null;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
}

export function MobileMenu({ open, onClose, user, onLogin, onRegister, onLogout }: MobileMenuProps) {
  // document.body only exists client-side, after hydration — guard the
  // portal target with a mounted flag so this never runs during SSR.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open || !mounted) return null;

  const displayName =
    user?.full_name ??
    ([user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Account");

  // FIX: this used to return the JSX directly, rendered inline inside
  // <header>. The header has backdrop-blur (backdrop-filter), which per
  // the CSS spec makes it the containing block for any position:fixed
  // descendant — so "fixed inset-0" was being measured against the
  // header's own bounding box, not the viewport, clipping the drawer to
  // a small box at the top of the screen instead of covering the full
  // page. Rendering through a portal to document.body escapes that
  // containing block entirely.
  return createPortal(
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* Panel */}
      <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col overflow-y-auto bg-bg shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <Image
            src="/weblogo.png"
            alt="StockedUp Africa"
            width={128}
            height={32}
            style={{ width: "auto", height: "32px" }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-bg-raised"
          >
            <X size={20} />
          </button>
        </div>

        {/* Account section */}
        {user ? (
          <div className="border-b border-line px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-deep">
                <User size={20} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-base font-semibold text-ink">{displayName}</p>
                <p className="truncate text-sm text-ink-soft">{user.email}</p>
              </div>
            </div>

            <Link
              href="/account"
              onClick={onClose}
              className="mt-4 block rounded-full border border-line px-4 py-2.5 text-center text-sm font-semibold text-ink hover:border-brand"
            >
              My Account
            </Link>

            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-clay hover:bg-bg-raised"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        ) : (
          <div className="border-b border-line px-4 py-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogin();
              }}
              className="block w-full rounded-full border border-line px-4 py-2.5 text-center text-sm font-semibold text-ink hover:border-ink"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRegister();
              }}
              className="mt-2 block w-full rounded-full bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-deep"
            >
              Create account
            </button>
          </div>
        )}

        {/* Location */}
        <div className="border-b border-line px-4 py-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            <MapPin size={13} />
            Delivery location
          </p>
          <LocationDropdown />
        </div>

        {/* Get the app */}
        <div className="px-4 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Get the app</p>
          <AppStoreBadges />
        </div>
      </div>
    </div>,
    document.body
  );
}
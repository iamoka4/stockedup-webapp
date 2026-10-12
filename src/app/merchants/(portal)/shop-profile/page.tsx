"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getShopProfile, type ShopProfile } from "@/lib/api/vendor";
import { ShopCard } from "@/components/vendor/ShopCard";
import { ProfileStep } from "@/components/vendor/ProfileStep";
import { ErrorBanner, errorMessage } from "@/components/vendor/ui";

export default function ShopProfilePage() {
  const [profile, setProfile] = useState<ShopProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  // Changing this remounts the form with fresh data after each save.
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getShopProfile()
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSaved() {
    try {
      const fresh = await getShopProfile();
      setProfile(fresh);
      setSaved(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setFormKey((k) => k + 1);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Shop profile</h1>
        <Link
          href="/merchants/dashboard"
          className="text-sm font-semibold text-brand-deep underline underline-offset-4"
        >
          Back to dashboard
        </Link>
      </div>

      <ErrorBanner message={error} />

      {saved && (
        <div
          role="status"
          className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          Shop profile saved.
        </div>
      )}

      {!profile ? (
        !error && <p className="text-ink-soft">Loading…</p>
      ) : (
        <>
          <ShopCard profile={profile} />

          <div className="rounded-3xl border border-line bg-bg-raised p-5 sm:p-6">
            <p className="mb-6 rounded-2xl bg-brand-tint px-4 py-3 text-sm">
              Changes to your shop name, description and photos appear to customers right away.
            </p>
            <ProfileStep
              key={formKey}
              profile={profile}
              onSaved={handleSaved}
              submitLabel="Save changes"
            />
          </div>
        </>
      )}
    </div>
  );
}
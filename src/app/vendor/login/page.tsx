"use client";

import { useState } from "react";
import Link from "next/link";
import { Store, ArrowLeft } from "lucide-react";
import { vendorLogin } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuthModalStore } from "@/store/authModalStore";

export default function VendorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signedInAs, setSignedInAs] = useState<string | null>(null);
  const openLogin = useAuthModalStore((s) => s.openLogin);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const vendor = await vendorLogin(email, password);
      setSignedInAs(vendor.shop_name ?? vendor.full_name ?? "your account");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (signedInAs) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20 text-center">
        <Store size={40} className="mx-auto text-brand" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          You&apos;re signed in as {signedInAs}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          The vendor dashboard isn&apos;t on the web yet — for now, please manage your
          products, inventory and orders from the StockedUp mobile app. Web vendor
          tools are coming soon.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-brand-deep">
          ← Back to shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <button
        type="button"
        onClick={() => openLogin()}
        className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to buyer sign in
      </button>

      <div className="mt-6 flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-tint">
          <Store size={34} className="text-indigo" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Vendor sign in</h1>
        <p className="mt-1 text-sm text-ink-soft">Manage your StockedUp storefront.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          placeholder="Vendor email"
          className="input w-full"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="input w-full"
        />
        {error && <p className="text-sm text-clay">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-indigo py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        New vendor?{" "}
        <Link href="/vendor/register" className="font-medium text-brand-deep hover:underline">
          Register your store
        </Link>
      </p>
    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { login } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";
import { AuthLayout, AuthFormHeading } from "@/components/auth/AuthLayout";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { setUser } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";
  const guestHref = next === "/account" ? "/" : next;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      setUser(user);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      heading="Groceries from vendors you already trust."
      subheading="Sign in to check out faster, track orders, and pick up right where you left off."
    >
      <AuthFormHeading title="Sign in" subtitle="Welcome back to StockedUp" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="Email address">
          <div className="relative">
            <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              placeholder="you@example.com"
              autoComplete="email"
              className="input w-full pl-10"
            />
          </div>
        </Field>

        <Field label="Password">
          <div className="relative">
            <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="input w-full pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>

        <div className="-mt-1 flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-brand-deep hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-sm text-clay">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        New to StockedUp?{" "}
        <Link href="/register" className="font-semibold text-brand-deep hover:underline">
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-sm text-ink-soft">
        Just browsing?{" "}
        <Link href={guestHref} className="font-semibold text-brand-deep hover:underline">
          Continue as guest
        </Link>
      </p>

      <div className="mt-8 flex items-center justify-between border-t border-line pt-6 text-sm">
        <Link href="/vendor/login" className="text-ink-soft hover:text-ink">
          Sign in as a vendor
        </Link>
        <a href="mailto:support@stockedup.africa" className="text-ink-soft hover:text-ink">
          Need help?
        </a>
      </div>
    </AuthLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
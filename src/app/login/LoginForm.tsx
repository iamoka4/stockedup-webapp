"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn, HelpCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { login } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";
import { AuthHeader } from "@/components/auth/AuthHeader";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { setUser } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";
  // "Continue as guest" must never target an auth-gated page (like the
  // default /account) — that would just redirect straight back to login.
  const guestHref = next === "/account" ? "/" : next;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      setUser(user);
      // Guest cart was just merged server-side by login.php — refresh the
      // cached cart so the header badge and cart page reflect it.
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <AuthHeader title="Welcome" subtitle="Log in to continue shopping fresh groceries" />

      <div className="mt-8 rounded-3xl border border-line bg-bg-raised p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Email Address">
            <div className="relative">
              <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="your@email.com"
                autoComplete="email"
                className="input w-full pl-11"
              />
            </div>
          </Field>

          <Field label="Password">
            <div className="relative">
              <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="input w-full pl-11 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </Field>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-line accent-[var(--brand)]"
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-sm font-semibold text-brand-deep hover:underline">
              Forgot Password?
            </Link>
          </div>

          {error && <p className="text-sm text-clay">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-base font-bold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
          >
            <LogIn size={20} />
            {submitting ? "Signing in…" : "Sign In"}
          </button>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs font-medium text-ink-soft">OR</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <p className="text-center text-[13px] leading-5 text-ink-soft">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="font-extrabold text-brand-deep">
              Create account
            </Link>{" "}
            <span className="font-bold text-ink">or</span>{" "}
            <Link href={guestHref} className="font-extrabold text-brand-deep">
              continue as guest
            </Link>
          </p>

          <div className="border-t border-line pt-4 text-center">
            <Link href="/vendor/login" className="text-sm text-ink-soft">
              Are you a vendor? <span className="font-semibold text-brand-deep">Log in as Vendor</span>
            </Link>
          </div>

          <a
            href="mailto:support@stockedup.africa"
            className="flex items-center justify-center gap-1.5 pt-1 text-sm text-ink-soft hover:text-ink"
          >
            <HelpCircle size={17} />
            Need help?
          </a>
        </form>
      </div>

      <div className="mt-8 text-center text-xs text-ink-soft">
        By logging in, you agree to our{" "}
        <a href="https://stockedup.africa/terms.php" className="font-semibold text-brand-deep">
          Terms
        </a>{" "}
        and{" "}
        <a href="https://stockedup.africa/privacy.php" className="font-semibold text-brand-deep">
          Privacy Policy
        </a>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

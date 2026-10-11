"use client";

import Link from "next/link";
import { useState } from "react";
import { vendorLogin } from "@/lib/api/auth";
import { AuthShell, ErrorBanner, Field, PasswordInput, PrimaryButton, errorMessage } from "./ui";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      await vendorLogin(email.trim().toLowerCase(), password);
      // Full navigation so every provider re-reads the new vendor session.
      // The vendor guard sends unfinished vendors on to onboarding.
      window.location.assign("/vendor/dashboard");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Merchant login"
      subtitle="Welcome back. Log in to manage your store."
      footer={
        <>
          New to StockedUp?{" "}
          <Link href="/merchant/register" className="font-semibold text-brand-deep underline">
            Become a Merchant
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <ErrorBanner message={error} />
        <Field label="Email address">
          <input
            className="input w-full"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="your@email.com"
          />
        </Field>
        <Field label="Password">
          <PasswordInput
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            placeholder="Enter your password"
          />
        </Field>
        <div className="text-right text-sm">
          <Link
            href="/merchant/forgot-password"
            className="font-semibold text-brand-deep underline underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>
        <PrimaryButton type="submit" busy={busy}>
          Log in
        </PrimaryButton>
        <p className="text-center text-xs text-ink-soft">
          Logging in as a merchant signs you out of any customer session in this browser.
        </p>
      </form>
    </AuthShell>
  );
}
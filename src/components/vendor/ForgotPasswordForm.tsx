"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { resetPassword, sendOtp, verifyOtp } from "@/lib/api/auth";
import { passwordIssue } from "@/lib/vendor/validation";
import { AuthShell, ErrorBanner, Field, PasswordInput, PrimaryButton, errorMessage } from "./ui";

type Step = "email" | "code" | "password" | "done";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const cleanEmail = email.trim().toLowerCase();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function requestCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      await sendOtp(cleanEmail, "forgot_password", "vendor");
      setCooldown(30);
      setStep("code");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function checkCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (otp.trim().length < 4) {
      setError("Enter the code we sent you.");
      return;
    }
    setBusy(true);
    try {
      const res = await verifyOtp(cleanEmail, otp.trim(), "forgot_password");
      if (!res.reset_token) {
        setError("We couldn't verify that code. Please request a new one.");
        return;
      }
      setResetToken(res.reset_token);
      setStep("password");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const issue = passwordIssue(password);
    if (issue) {
      setError(issue);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await resetPassword(cleanEmail, resetToken, password, "vendor");
      setStep("done");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const loginFooter = (
    <Link href="/merchants/login" className="font-semibold text-brand-deep underline">
      Back to login
    </Link>
  );

  if (step === "done") {
    return (
      <AuthShell
        title="Password updated"
        subtitle="Your password has been reset and you've been signed out on all devices. Log in with your new password."
      >
        <Link
          href="/merchants/login"
          className="inline-flex w-full items-center justify-center rounded-full bg-brand px-7 py-3.5 font-bold text-white transition hover:bg-brand-deep"
        >
          Go to login
        </Link>
      </AuthShell>
    );
  }

  if (step === "password") {
    return (
      <AuthShell title="Choose a new password" footer={loginFooter}>
        <form onSubmit={savePassword} className="space-y-5" noValidate>
          <ErrorBanner message={error} />
          <Field
            label="New password"
            hint="At least 8 characters with uppercase, lowercase, a number and a special character."
          >
            <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password">
            <PasswordInput value={confirm} onChange={setConfirm} autoComplete="new-password" />
          </Field>
          <PrimaryButton type="submit" busy={busy}>
            Reset password
          </PrimaryButton>
        </form>
      </AuthShell>
    );
  }

  if (step === "code") {
    return (
      <AuthShell
        title="Enter the code"
        subtitle={`We sent a code to ${cleanEmail}.`}
        footer={loginFooter}
      >
        <form onSubmit={checkCode} className="space-y-5" noValidate>
          <ErrorBanner message={error} />
          <Field label="Verification code">
            <input
              className="input w-full tracking-widest"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
          </Field>
          <PrimaryButton type="submit" busy={busy}>
            Verify code
          </PrimaryButton>
          <button
            type="button"
            onClick={() => requestCode()}
            disabled={cooldown > 0 || busy}
            className="w-full text-center text-sm font-semibold text-brand-deep underline underline-offset-4 disabled:opacity-50"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your merchant email and we'll send you a code to reset it."
      footer={loginFooter}
    >
      <form onSubmit={requestCode} className="space-y-5" noValidate>
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
        <PrimaryButton type="submit" busy={busy}>
          Send code
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}
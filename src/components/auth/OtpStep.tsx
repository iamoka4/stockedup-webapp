"use client";

import { useState } from "react";
import { verifyOtp, sendOtp } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { AuthLayout, AuthFormHeading } from "@/components/auth/AuthLayout";

interface Props {
  email: string;
  phone?: string;
  purpose: "signup" | "forgot_password";
  role?: "buyer" | "vendor";
  onVerified: (result: { email: string; purpose: string; reset_token?: string }) => void;
  onBack: () => void;
}

export function OtpStep({ email, phone, purpose, role = "buyer", onVerified, onBack }: Props) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await verifyOtp(email, otp, purpose);
      onVerified(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't verify that code.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    try {
      await sendOtp(email, purpose, role, phone);
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't resend the code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Almost there"
      heading="One more step to confirm it's you."
      subheading="This keeps your account secure and stops anyone else from signing up with your email."
    >
      <AuthFormHeading title="Enter your code" subtitle={`We sent a 6-digit code to ${email}`} />

      <form onSubmit={handleVerify} className="flex flex-col gap-4">
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          placeholder="000000"
          className="input tabular text-center text-2xl tracking-[0.5em]"
          maxLength={6}
          autoFocus
        />
        {error && <p className="text-sm text-clay">{error}</p>}
        {resent && <p className="text-sm text-leaf">A new code is on its way.</p>}

        <button
          type="submit"
          disabled={submitting || otp.length !== 6}
          className="rounded-xl bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
        >
          {submitting ? "Verifying…" : "Verify code"}
        </button>

        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={onBack} className="text-ink-soft hover:text-ink">
            ← Back
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-medium text-brand-deep hover:underline disabled:opacity-60"
          >
            {resending ? "Resending…" : "Resend code"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
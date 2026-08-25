"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { sendOtp, resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { OtpStep } from "@/components/auth/OtpStep";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { useAuthModalStore } from "@/store/authModalStore";

type Step = "email" | "otp" | "reset" | "done";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const openLogin = useAuthModalStore((s) => s.openLogin);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await sendOtp(email, "forgot_password", "buyer");
      setStep("otp");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send the code. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOtpVerified(result: { reset_token?: string }) {
    if (result.reset_token) setResetToken(result.reset_token);
    setStep("reset");
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!resetToken) {
      setError("Your verification expired. Please start over.");
      setStep("email");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email, resetToken, newPassword);
      setStep("done");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't reset your password — please try again or contact support."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "otp") {
    return (
      <OtpStep
        email={email}
        purpose="forgot_password"
        role="buyer"
        onVerified={handleOtpVerified}
        onBack={() => setStep("email")}
      />
    );
  }

  if (step === "reset") {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="font-display text-2xl font-semibold text-ink">Set a new password</h1>
        <p className="mt-1 text-sm text-ink-soft">Choose a new password for {email}.</p>

        <form onSubmit={handleResetPassword} className="mt-8 flex flex-col gap-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="input w-full pr-11"
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
          <input
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="input w-full"
          />

          {error && <p className="text-sm text-clay">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Reset password"}
          </button>
        </form>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Password updated</h1>
        <p className="mt-2 text-sm text-ink-soft">You can now sign in with your new password.</p>
        <button
          type="button"
          onClick={() => {
            router.push("/");
            openLogin();
          }}
          className="mt-6 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-deep"
        >
          Go to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <AuthHeader
        title="Forgot password?"
        subtitle="Enter your email and we'll send you a code to reset it."
      />
      <form onSubmit={handleSendOtp} className="mt-8 flex flex-col gap-4 rounded-3xl border border-line bg-bg-raised p-6">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          placeholder="your@email.com"
          className="input w-full"
        />
        {error && <p className="text-sm text-clay">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-brand py-4 text-base font-bold text-white hover:bg-brand-deep disabled:opacity-60"
        >
          {submitting ? "Sending code…" : "Send reset code"}
        </button>
        <button
          type="button"
          onClick={() => {
            router.push("/");
            openLogin();
          }}
          className="text-center text-sm text-ink-soft hover:text-ink"
        >
          ← Back to sign in
        </button>
      </form>
    </div>
  );
}
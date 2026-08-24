"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { sendOtp, verifyOtp, register, login } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";
import { useAuthModalStore } from "@/store/authModalStore";

type Step = "form" | "otp" | "creating";

export function RegisterModalView() {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const { setUser } = useAuth();
  const close = useAuthModalStore((s) => s.close);
  const setView = useAuthModalStore((s) => s.setView);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await sendOtp(form.email, "signup", "buyer", form.phone || undefined);
      setStep("otp");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send the code. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyAndRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await verifyOtp(form.email, otp, "signup");
      setStep("creating");
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        emailAddress: form.email,
        phone: form.phone || undefined,
        password: form.password,
        confirmPassword: form.confirmPassword,
        otp_verified: true,
      });
      const user = await login(form.email, form.password);
      setUser(user);
      close();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
      setStep("otp");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    try {
      await sendOtp(form.email, "signup", "buyer", form.phone || undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't resend the code.");
    } finally {
      setResending(false);
    }
  }

  if (step === "creating") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" />
        <p className="text-sm text-ink-soft">Creating your account…</p>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">Enter your code</h2>
        <p className="mt-1 text-sm text-ink-soft">We sent a 6-digit code to {form.email}.</p>

        <form onSubmit={handleVerifyAndRegister} className="mt-6 flex flex-col gap-4">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            placeholder="000000"
            autoFocus
            className="input tabular text-center text-2xl tracking-[0.5em]"
            maxLength={6}
          />
          {error && <p className="text-sm text-clay">{error}</p>}

          <button
            type="submit"
            disabled={submitting || otp.length !== 6}
            className="rounded-xl bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
          >
            {submitting ? "Verifying…" : "Verify & create account"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => setStep("form")} className="text-ink-soft hover:text-ink">
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
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink">Create account</h2>
      <p className="mt-1 text-sm text-ink-soft">Join StockedUp to check out faster.</p>

      <form onSubmit={handleSendOtp} className="mt-6 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            required
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            placeholder="First name"
            className="input w-full"
          />
          <input
            required
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            placeholder="Last name"
            className="input w-full"
          />
        </div>

        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value.toLowerCase())}
          placeholder="Email address"
          className="input w-full"
        />

        <input
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="Phone number (optional)"
          className="input w-full"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="Password (min. 8 characters)"
            className="input w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <input
          type={showPassword ? "text" : "password"}
          required
          value={form.confirmPassword}
          onChange={(e) => update("confirmPassword", e.target.value)}
          placeholder="Confirm password"
          className="input w-full"
        />

        {error && <p className="text-sm text-clay">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 rounded-xl bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
        >
          {submitting ? "Sending code…" : "Continue"}
        </button>
      </form>

      <p className="mt-5 border-t border-line pt-5 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => setView("login")}
          className="font-semibold text-brand-deep hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
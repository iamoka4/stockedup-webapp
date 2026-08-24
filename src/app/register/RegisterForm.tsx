"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { sendOtp, register, login } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";
import { OtpStep } from "@/components/auth/OtpStep";
import { AuthLayout, AuthFormHeading } from "@/components/auth/AuthLayout";

type Step = "form" | "otp" | "registering";

export function RegisterForm() {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const { setUser } = useAuth();
  const router = useRouter();

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

    setIsSendingOtp(true);
    try {
      await sendOtp(form.email, "signup", "buyer", form.phone || undefined);
      setStep("otp");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send the code. Try again.");
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleOtpVerified() {
    setStep("registering");
    setError(null);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        emailAddress: form.email,
        phone: form.phone || undefined,
        password: form.password,
        confirmPassword: form.confirmPassword,
        otp_verified: true,
        referralCode: form.referralCode || undefined,
      });
      const user = await login(form.email, form.password);
      setUser(user);
      router.push("/account");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
      setStep("form");
    }
  }

  if (step === "otp") {
    return (
      <OtpStep
        email={form.email}
        phone={form.phone || undefined}
        purpose="signup"
        role="buyer"
        onVerified={handleOtpVerified}
        onBack={() => setStep("form")}
      />
    );
  }

  if (step === "registering") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brand" />
        <p className="text-sm text-ink-soft">Creating your account…</p>
      </div>
    );
  }

  return (
    <AuthLayout
      eyebrow="Join StockedUp"
      heading="Fresh foodstuff, delivered across Awka."
      subheading="Create an account to save addresses, track orders, and check out in seconds next time."
      formWidth="md"
    >
      <AuthFormHeading title="Create your account" subtitle="It only takes a minute." />

      <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <input
              required
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              placeholder="John"
              className="input w-full"
            />
          </Field>
          <Field label="Last name">
            <input
              required
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              placeholder="Doe"
              className="input w-full"
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Email address">
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value.toLowerCase())}
              placeholder="you@example.com"
              className="input w-full"
            />
          </Field>
          <Field label="Phone number">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="0801 234 5678"
              className="input w-full"
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Password">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Min. 8 characters"
                className="input w-full pr-10"
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
          <Field label="Confirm password">
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                placeholder="Re-enter password"
                className="input w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </Field>
        </div>

        <Field label="Referral code (optional)">
          <input
            value={form.referralCode}
            onChange={(e) => update("referralCode", e.target.value.toUpperCase())}
            placeholder="e.g. AWKA2026"
            className="input w-full uppercase placeholder:normal-case"
          />
        </Field>

        {error && <p className="text-sm text-clay">{error}</p>}

        <button
          type="submit"
          disabled={isSendingOtp}
          className="mt-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
        >
          {isSendingOtp ? "Sending code…" : "Continue"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-deep hover:underline">
          Sign in
        </Link>
      </p>

      <div className="mt-8 flex items-center justify-between border-t border-line pt-6 text-sm">
        <Link href="/vendor/register" className="text-ink-soft hover:text-ink">
          Register as a vendor
        </Link>
      </div>

      <p className="mt-6 text-xs leading-5 text-ink-soft">
        By signing up, you agree to our{" "}
        <a href="https://stockedup.africa/terms.php" className="font-medium text-brand-deep hover:underline">
          Terms
        </a>{" "}
        and{" "}
        <a href="https://stockedup.africa/privacy.php" className="font-medium text-brand-deep hover:underline">
          Privacy Policy
        </a>
        .
      </p>
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
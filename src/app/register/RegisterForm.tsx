"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, UserPlus } from "lucide-react";
import { sendOtp, register, login } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";
import { OtpStep } from "@/components/auth/OtpStep";

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
      // register.php doesn't return tokens itself, so log in right after —
      // this also runs login.php's guest-cart-merge against whatever the
      // person already added to cart while browsing as a guest.
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brand" />
        <p className="text-sm text-ink-soft">Creating your account…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 rounded-b-3xl bg-brand px-5 pb-6 pt-10 text-white">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-xl font-extrabold">Create Account</h1>
          <p className="mt-0.5 text-xs text-white/80">Join StockedUp Africa</p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 py-6">
        <div className="rounded-2xl border border-line bg-bg-raised p-5">
          <h2 className="font-display text-lg font-semibold text-ink">Start Shopping Today</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Create your account to start shopping smartly with StockedUp Africa. Enjoy
            exclusive deals, fast delivery, and a seamless shopping experience!
          </p>
        </div>

        <form onSubmit={handleSendOtp} className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name *">
              <input
                required
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                placeholder="John"
                className="input w-full"
              />
            </Field>
            <Field label="Last Name *">
              <input
                required
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                placeholder="Doe"
                className="input w-full"
              />
            </Field>
          </div>

          <Field label="Email Address *">
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value.toLowerCase())}
              placeholder="your@email.com"
              className="input w-full"
            />
          </Field>

          <Field label="Phone Number">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="08012345678"
              className="input w-full"
            />
          </Field>

          <Field label="Password *">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Minimum 8 characters"
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
            <span className="text-[11px] italic text-ink-soft">At least 8 characters.</span>
          </Field>

          <Field label="Confirm Password *">
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                placeholder="Re-enter your password"
                className="input w-full pr-11"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </Field>

          <Field label="Referral Code (Optional)">
            <input
              value={form.referralCode}
              onChange={(e) => update("referralCode", e.target.value.toUpperCase())}
              placeholder="Enter referral code"
              className="input w-full"
              style={{ textTransform: "uppercase" }}
            />
          </Field>

          {error && <p className="text-sm text-clay">{error}</p>}

          <button
            type="submit"
            disabled={isSendingOtp}
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-base font-bold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
          >
            <UserPlus size={20} />
            {isSendingOtp ? "Sending code…" : "Continue"}
          </button>

          <Link href="/login" className="py-2 text-center text-sm text-ink-soft">
            Already have an account? <span className="font-bold text-brand-deep">Log In</span>
          </Link>

          <div className="border-t border-line pt-4 text-center">
            <Link href="/vendor/register" className="text-sm text-ink-soft">
              Register as a vendor instead?{" "}
              <span className="font-semibold text-brand-deep">Sign Up as Vendor</span>
            </Link>
          </div>

          <p className="mt-2 text-center text-xs leading-5 text-ink-soft">
            By signing up, you agree to our{" "}
            <a href="https://stockedup.africa/terms.php" className="font-semibold text-brand-deep">
              Terms
            </a>{" "}
            and{" "}
            <a href="https://stockedup.africa/privacy.php" className="font-semibold text-brand-deep">
              Privacy Policy
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

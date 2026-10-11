"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { sendOtp, verifyOtp, vendorRegister } from "@/lib/api/auth";
import { SUPPORTED_CITIES, findCityByKey } from "@/lib/vendor/cities";
import {
  BUSINESS_TYPE_OPTIONS,
  validateVendorSignUp,
  type BusinessType,
  type VendorSignUpErrors,
  type VendorSignUpValues,
} from "@/lib/vendor/validation";
import {
  AuthShell,
  ErrorBanner,
  Field,
  PasswordInput,
  PrimaryButton,
  errorMessage,
} from "./ui";

const EMPTY: VendorSignUpValues = {
  businessType: "",
  fullName: "",
  email: "",
  phone: "",
  businessName: "",
  businessAddress: "",
  city: "",
  state: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
};

export function RegisterForm() {
  const [values, setValues] = useState<VendorSignUpValues>(EMPTY);
  const [cityKey, setCityKey] = useState("");
  const [errors, setErrors] = useState<VendorSignUpErrors>({});
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const email = values.email.trim().toLowerCase();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function set<K extends keyof VendorSignUpValues>(key: K, value: VendorSignUpValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function chooseCity(key: string) {
    setCityKey(key);
    const c = findCityByKey(key);
    setValues((v) => ({ ...v, city: c?.label ?? "", state: c?.state ?? "" }));
    setErrors((e) => ({ ...e, city: undefined, state: undefined }));
  }

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const errs = validateVendorSignUp(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setBusy(true);
    try {
      await sendOtp(email, "signup", "vendor", values.phone);
      setOtp("");
      setVerified(false);
      setCooldown(30);
      setStep("otp");
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (otp.trim().length < 4) {
      setFormError("Enter the code we sent you.");
      return;
    }

    setBusy(true);
    try {
      // A used OTP can't be verified twice, so if account creation failed
      // after a successful verify, a retry skips straight to registration.
      if (!verified) {
        await verifyOtp(email, otp.trim(), "signup");
        setVerified(true);
      }
      await vendorRegister({
        businessType: values.businessType as BusinessType,
        fullName: values.fullName.trim(),
        email,
        phone: values.phone,
        businessName: values.businessName.trim(),
        businessAddress: values.businessAddress.trim(),
        city: values.city,
        state: values.state,
        password: values.password,
        confirmPassword: values.confirmPassword,
        agreeToTerms: true,
      });
      // Full navigation so every provider re-reads the new vendor session.
      window.location.assign("/merchants/onboarding");
    } catch (err) {
      setFormError(errorMessage(err));
      setBusy(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || busy) return;
    setFormError(null);
    setBusy(true);
    try {
      await sendOtp(email, "signup", "vendor", values.phone);
      setVerified(false);
      setCooldown(30);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  // ─── Step 2: OTP ────────────────────────────────────────────────────────────
  if (step === "otp") {
    return (
      <AuthShell title="Verify your email" subtitle={`We sent a code to ${email}.`}>
        <form onSubmit={handleVerify} className="space-y-5" noValidate>
          <ErrorBanner message={formError} />
          <Field label="Verification code">
            <input
              className="input w-full tracking-widest"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter code"
            />
          </Field>
          <PrimaryButton type="submit" busy={busy}>
            Verify and create account
          </PrimaryButton>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep("form");
                setFormError(null);
              }}
              className="font-semibold text-ink-soft underline underline-offset-4"
            >
              Edit details
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || busy}
              className="font-semibold text-brand-deep underline underline-offset-4 disabled:opacity-50"
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </form>
      </AuthShell>
    );
  }

  // ─── Step 1: form ───────────────────────────────────────────────────────────
  return (
    <AuthShell
      wide
      title="Become a Merchant"
      subtitle="Create your StockedUp merchant account and start selling to customers near you."
      footer={
        <>
          Already a merchant?{" "}
          <Link href="/merchants/login" className="font-semibold text-brand-deep underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleContinue} className="space-y-8" noValidate>
        <ErrorBanner message={formError} />

        <fieldset>
          <legend className="mb-3 text-sm font-semibold">What are you selling?</legend>
          <div className="grid grid-cols-3 gap-3">
            {BUSINESS_TYPE_OPTIONS.map((o) => {
              const selected = values.businessType === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => set("businessType", o.value)}
                  className={`rounded-2xl border-2 px-3 py-4 text-sm font-bold transition ${
                    selected
                      ? "border-brand bg-brand text-white"
                      : "border-line bg-bg hover:border-brand"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          {errors.businessType && (
            <p role="alert" className="mt-2 text-xs text-red-600">
              {errors.businessType}
            </p>
          )}
        </fieldset>

        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold">Personal information</h2>
          <Field label="Full name *" error={errors.fullName}>
            <input
              className="input w-full"
              value={values.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              autoComplete="name"
            />
          </Field>
          <Field label="Email address *" error={errors.email}>
            <input
              className="input w-full"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              autoComplete="email"
              placeholder="your@email.com"
            />
          </Field>
          <Field label="Phone number *" error={errors.phone}>
            <input
              className="input w-full"
              inputMode="numeric"
              maxLength={11}
              value={values.phone}
              onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
              autoComplete="tel"
              placeholder="08012345678"
            />
          </Field>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold">Business information</h2>
          <Field label="Business / shop name *" error={errors.businessName}>
            <input
              className="input w-full"
              value={values.businessName}
              onChange={(e) => set("businessName", e.target.value)}
              placeholder="e.g. Fresh Foods Market"
            />
          </Field>
          <Field label="Business address *" error={errors.businessAddress}>
            <input
              className="input w-full"
              value={values.businessAddress}
              onChange={(e) => set("businessAddress", e.target.value)}
              placeholder="e.g. 123 Market Street"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City *" error={errors.city}>
              <select
                className="input w-full"
                value={cityKey}
                onChange={(e) => chooseCity(e.target.value)}
              >
                <option value="">Select city</option>
                {SUPPORTED_CITIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="State">
              <input
                className="input w-full"
                value={values.state}
                readOnly
                placeholder="Filled in from your city"
              />
            </Field>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold">Security</h2>
          <Field
            label="Password *"
            error={errors.password}
            hint="At least 8 characters with uppercase, lowercase, a number and a special character."
          >
            <PasswordInput
              value={values.password}
              onChange={(v) => set("password", v)}
              autoComplete="new-password"
              placeholder="Create a password"
            />
          </Field>
          <Field label="Confirm password *" error={errors.confirmPassword}>
            <PasswordInput
              value={values.confirmPassword}
              onChange={(v) => set("confirmPassword", v)}
              autoComplete="new-password"
              placeholder="Re-enter your password"
            />
          </Field>
        </div>

        <div>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={values.agreeToTerms}
              onChange={(e) => set("agreeToTerms", e.target.checked)}
              className="mt-1 size-4 accent-brand"
            />
            <span>
              I agree to the{" "}
              <Link href="/vendor-terms" target="_blank" className="font-semibold underline">
                Vendor Terms
              </Link>
              ,{" "}
              <Link href="/terms" target="_blank" className="font-semibold underline">
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="font-semibold underline">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.agreeToTerms && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.agreeToTerms}
            </p>
          )}
        </div>

        <PrimaryButton type="submit" busy={busy}>
          Continue
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}
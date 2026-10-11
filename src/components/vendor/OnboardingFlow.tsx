"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  getShopProfile,
  isProfileComplete,
  needsLocation,
  type ShopProfile,
} from "@/lib/api/vendor";
import { useVendorSession } from "@/lib/vendor/useVendorSession";
import { LocationStep } from "./LocationStep";
import { ProfileStep } from "./ProfileStep";
import { AuthShell, ErrorBanner, errorMessage } from "./ui";

type Step = "profile" | "location";

export function OnboardingFlow() {
  const router = useRouter();
  const session = useVendorSession();
  const [profile, setProfile] = useState<ShopProfile | null>(null);
  const [step, setStep] = useState<Step | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (session === "loading") return;
    if (session === "none") {
      router.replace("/merchant/login");
      return;
    }

    let cancelled = false;
    getShopProfile()
      .then((p) => {
        if (cancelled) return;
        if (isProfileComplete(p) && !needsLocation(p)) {
          router.replace("/vendor/dashboard");
          return;
        }
        setProfile(p);
        setStep(isProfileComplete(p) ? "location" : "profile");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          router.replace("/merchant/login");
          return;
        }
        setLoadError(errorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [session, router, attempt]);

  if (loadError) {
    return (
      <AuthShell title="Set up your shop">
        <div className="space-y-4">
          <ErrorBanner message={loadError} />
          <button
            type="button"
            onClick={() => {
              setLoadError(null);
              setAttempt((a) => a + 1);
            }}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-bold hover:border-brand"
          >
            Try again
          </button>
        </div>
      </AuthShell>
    );
  }

  if (!profile || !step) {
    return (
      <AuthShell title="Set up your shop">
        <p className="text-ink-soft">Loading…</p>
      </AuthShell>
    );
  }

  const stepNumber = step === "profile" ? 1 : 2;

  return (
    <AuthShell
      wide
      title={step === "profile" ? "Set up your shop profile" : "Set your shop location"}
      subtitle="Our team reviews new shops within 24–48 hours. You can keep setting up while you wait."
    >
      <div className="mb-6">
        <p className="mb-2 text-sm font-semibold">
          Step {stepNumber} of 2: {step === "profile" ? "Shop profile" : "Shop location"}
        </p>
        <div className="h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: stepNumber === 1 ? "50%" : "100%" }}
          />
        </div>
      </div>

      {step === "profile" ? (
        <ProfileStep
          profile={profile}
          onSaved={() => {
            window.scrollTo({ top: 0 });
            setStep("location");
          }}
        />
      ) : (
        <LocationStep
          initialCity={profile.city}
          onDone={() => router.replace("/vendor/dashboard")}
        />
      )}
    </AuthShell>
  );
}
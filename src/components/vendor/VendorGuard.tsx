"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ApiError } from "@/lib/api/client";
import { getShopProfile, isOnboardingComplete } from "@/lib/api/vendor";
import { useVendorSession } from "@/lib/vendor/useVendorSession";
import { errorMessage } from "./ui";

/**
 * Client-side gate for /vendor/*. Real enforcement is in the PHP API
 * (authenticateRequest('vendor')); this only decides what the person sees.
 *   not logged in as a vendor -> /merchant/login
 *   profile/location unfinished -> /merchant/onboarding
 */
export function VendorGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useVendorSession();
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking");
  const [message, setMessage] = useState("");
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
        if (!isOnboardingComplete(p)) {
          router.replace("/merchant/onboarding");
          return;
        }
        setStatus("ok");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          router.replace("/merchant/login");
          return;
        }
        setMessage(errorMessage(err));
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [session, router, attempt]);

  if (status === "error") {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-ink-soft">{message}</p>
        <button
          type="button"
          onClick={() => {
            setStatus("checking");
            setAttempt((a) => a + 1);
          }}
          className="mt-4 rounded-full border border-line px-5 py-2.5 text-sm font-bold hover:border-brand"
        >
          Try again
        </button>
      </div>
    );
  }

  if (status !== "ok") {
    return <div className="px-6 py-24 text-center text-ink-soft">Loading your dashboard…</div>;
  }

  return <>{children}</>;
}
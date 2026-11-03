"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Gift, Share2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getReferrals, type ReferralData } from "@/lib/api/referrals";
import { ApiError } from "@/lib/api/client";
import { useAuthModalStore } from "@/store/authModalStore";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stockedup.africa";

export default function ReferralsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { openLogin } = useAuthModalStore();

  const [referrals, setReferrals] = useState<ReferralData | null>(null);
  const [refLoading, setRefLoading] = useState(true);
  const [refError, setRefError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the "Copied" timeout if the page unmounts mid-countdown
  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      openLogin("/account/referrals");
      router.replace("/");
    }
  }, [authLoading, user, router, openLogin]);

  const loadReferrals = useCallback(async () => {
    setRefLoading(true);
    setRefError(null);
    try {
      setReferrals(await getReferrals());
    } catch (e) {
      setRefError(e instanceof ApiError ? e.message : "Failed to load referrals");
    } finally {
      setRefLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadReferrals();
  }, [user, loadReferrals]);

  if (authLoading || !user) {
    return <div className="mx-auto max-w-lg px-4 py-16 text-ink-soft">Loading…</div>;
  }

  const referralLink = referrals
    ? `${SITE_URL}/register?ref=${referrals.referralCode}`
    : "";

  async function handleCopy() {
    if (!referrals) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopyFailed(false);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked or unavailable — show the link so it can be copied by hand
      setCopyFailed(true);
    }
  }

  async function handleShare() {
    if (!referrals) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join StockedUp",
          text: `Use my code ${referrals.referralCode} to get started on StockedUp!`,
          url: referralLink,
        });
      } catch (e) {
        // User cancelled the share sheet — nothing to do
        if (e instanceof DOMException && e.name === "AbortError") return;
        handleCopy();
      }
    } else {
      handleCopy();
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link href="/account" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size={16} />
        Back to profile
      </Link>

      <h1 className="font-display text-2xl font-semibold text-ink">Refer & Earn</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Invite friends to StockedUp — earn ₦500 when they complete their first order.
      </p>

      {refLoading ? (
        <p className="mt-8 text-sm text-ink-soft">Loading…</p>
      ) : refError ? (
        <div className="mt-8">
          <p className="text-sm text-clay">{refError}</p>
          <button
            type="button"
            onClick={loadReferrals}
            className="mt-3 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-bg-raised"
          >
            Try again
          </button>
        </div>
      ) : referrals ? (
        <>
          {/* Uses the same tokens as the stat cards so it reads in light and dark */}
          <div className="mt-6 rounded-2xl border border-line bg-bg-raised p-6">
            <p className="text-xs uppercase tracking-wide text-ink-soft">Your referral code</p>
            <p className="mt-1 font-display text-3xl font-semibold tracking-wide text-ink">
              {referrals.referralCode}
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-sm font-medium text-ink transition-opacity hover:opacity-70"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-deep px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
              >
                <Share2 size={16} />
                Share
              </button>
            </div>

            {copyFailed && (
              <p className="mt-3 break-all text-xs text-ink-soft">
                Couldn't copy automatically. Copy this link:{" "}
                <span className="select-all font-medium text-ink">{referralLink}</span>
              </p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <StatCard label="Total referred" value={referrals.totalReferrals} />
            <StatCard label="Completed" value={referrals.completedReferrals} />
            <StatCard label="Pending" value={referrals.pendingReferrals} />
            <StatCard label="Total earned" value={`₦${referrals.totalEarned.toLocaleString("en-NG")}`} />
          </div>

          {referrals.pendingEarned > 0 && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-bg-raised p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-warm text-brand-deep">
                <Gift size={16} />
              </span>
              <p className="text-sm text-ink-soft">
                <span className="font-medium text-ink">
                  ₦{referrals.pendingEarned.toLocaleString("en-NG")}
                </span>{" "}
                pending — credited once your referrals complete their first order.
              </p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-line bg-bg-raised p-4">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}
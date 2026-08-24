"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Gift, Share2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getReferrals, type ReferralData } from "@/lib/api/referrals";
import { ApiError } from "@/lib/api/client";
import { useAuthModalStore } from "@/store/authModalStore";
export default function ReferralsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { openLogin } = useAuthModalStore();

  const [referrals, setReferrals] = useState<ReferralData | null>(null);
  const [refLoading, setRefLoading] = useState(true);
  const [refError, setRefError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
  if (!authLoading && !user) {
    openLogin("/account/referrals");
    router.replace("/");
  }
}, [authLoading, user, router, openLogin]);

  useEffect(() => {
    if (!user) return;
    getReferrals()
      .then(setReferrals)
      .catch((e) => setRefError(e instanceof ApiError ? e.message : "Failed to load referrals"))
      .finally(() => setRefLoading(false));
  }, [user]);

  if (authLoading || !user) {
    return <div className="mx-auto max-w-lg px-4 py-16 text-ink-soft">Loading…</div>;
  }

  const referralLink = referrals
    ? `https://stockedup.africa/register?ref=${referrals.referralCode}`
    : "";

  async function handleCopy() {
    if (!referrals) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — ignore */
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
      } catch {
        /* user cancelled share — ignore */
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
        <p className="mt-8 text-sm text-clay">{refError}</p>
      ) : referrals ? (
        <>
          <div className="mt-6 rounded-2xl bg-ink p-6 text-white">
            <p className="text-xs uppercase tracking-wide text-white/60">Your referral code</p>
            <p className="mt-1 font-display text-3xl font-semibold tracking-wide">
              {referrals.referralCode}
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy link"}
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
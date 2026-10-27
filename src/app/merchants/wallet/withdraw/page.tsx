"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getVendorBalance, requestWithdrawal, type VendorBalance } from "@/lib/api/vendor-wallet";
import { errorMessage } from "@/components/vendor/ui";
import { BackHeader, WalletIcon, formatAmount } from "@/components/vendor/wallet-ui";

const generateIdempotencyKey = () =>
  `wd-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

function Banner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-brand bg-amber-100 dark:bg-brand-tint p-3 text-[13px] font-semibold text-amber-800 dark:text-brand">
      <WalletIcon name="alert-triangle" className="size-3.75 shrink-0" />
      <span className="flex-1">{children}</span>
    </div>
  );
}

export default function WithdrawPage() {
  const [data, setData] = useState<VendorBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  // Stable for as long as this page is open, so a retry after a network error or
  // timeout reuses the same key (the backend replays the original result instead of
  // double-submitting). A fresh key is created after a resolved withdrawal.
  const idempotencyKeyRef = useRef("");
  if (!idempotencyKeyRef.current) idempotencyKeyRef.current = generateIdempotencyKey();

  useEffect(() => {
    getVendorBalance()
      .then(setData)
      .catch((err) => setLoadError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const balance = data?.balance ?? 0;
  const bank = data?.bankDetails;
  const hasBankAccount = !!(bank?.bank_name && bank?.account_number);

  const numericAmount = parseFloat(amount) || 0;
  const isAmountValid = numericAmount >= 100 && numericAmount <= balance;
  const canWithdraw = hasBankAccount && balance > 0 && isAmountValid;

  async function handleWithdraw() {
    if (!canWithdraw) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await requestWithdrawal(numericAmount, idempotencyKeyRef.current);
      setReference(res.reference ?? null);
      setSuccess(true);
      // Fresh key for any future, genuinely new withdrawal.
      idempotencyKeyRef.current = generateIdempotencyKey();
    } catch (err) {
      // Deliberately NOT regenerating the key here — a retry of this same failed
      // attempt should reuse it.
      setSubmitError(errorMessage(err) || "Could not process withdrawal. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-6">
        <BackHeader title="Withdrawal" backHref="/merchants/wallet" />
        <div className="flex flex-col items-center gap-4 px-4 py-14 text-center">
          <span className="mb-2 flex size-24 items-center justify-center rounded-full bg-green-100 dark:bg-leaf-tint text-green-600 dark:text-leaf">
            <WalletIcon name="check-circle" className="size-14" />
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-ink">Withdrawal Initiated!</h2>
          <p className="max-w-sm text-sm leading-5.25 text-gray-500 dark:text-ink-soft">
            Your withdrawal of {formatAmount(numericAmount)} has been submitted successfully. Funds
            will arrive in your bank account within the next 24 hours.
          </p>

          {reference && (
            <div className="w-full max-w-sm rounded-xl bg-gray-100 dark:bg-bg-elevated p-3.5">
              <p className="text-xs font-semibold text-gray-400 dark:text-ink-soft">Withdrawal Reference</p>
              <p className="mt-1 break-all text-[15px] font-bold text-gray-800 dark:text-ink">{reference}</p>
            </div>
          )}

          <Link
            href="/merchants/wallet"
            className="mt-2 rounded-2xl bg-brand px-10 py-3.5 text-[15px] font-extrabold text-white"
          >
            Back to Wallet
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-6">
      <BackHeader title="Withdraw Funds" backHref="/merchants/wallet" />

      {loading ? (
        <p className="py-14 text-center text-sm text-gray-500 dark:text-ink-soft">Loading…</p>
      ) : (
        <div className="mt-5 space-y-4">
          {loadError && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 dark:border-clay bg-red-50 dark:bg-clay-tint px-4 py-3 text-sm font-medium text-red-700 dark:text-clay"
            >
              {loadError}
            </p>
          )}

          {/* Available balance */}
          <div className="rounded-[18px] bg-brand p-6 text-center text-white shadow-lg">
            <p className="mb-2 text-[13px] font-semibold text-white/75">Available Balance</p>
            <p className="text-4xl font-extrabold">{formatAmount(balance)}</p>
          </div>

          {/* Amount */}
          <div className="space-y-2.5">
            <h2 className="text-sm font-bold text-gray-800 dark:text-ink">Amount to Withdraw</h2>
            <div className="flex h-14 items-center rounded-xl border border-gray-200 dark:border-line bg-white dark:bg-bg-raised px-4">
              <span className="mr-2 text-xl font-bold text-gray-700 dark:text-ink-soft">₦</span>
              <input
                className="h-full min-w-0 flex-1 bg-transparent text-2xl font-bold text-gray-900 dark:text-ink outline-none placeholder:text-gray-400 dark:placeholder:text-ink-soft"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              />
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-[13px] text-gray-500 dark:text-ink-soft">Min: ₦100</span>
              <button
                type="button"
                onClick={() => setAmount(String(balance))}
                className="text-[13px] font-bold text-brand-deep"
              >
                Withdraw All
              </button>
            </div>
          </div>

          {/* Destination account */}
          <div className="space-y-2.5">
            <h2 className="text-sm font-bold text-gray-800 dark:text-ink">Destination Account</h2>
            {hasBankAccount ? (
              <div className="flex items-center gap-3 rounded-2xl border border-gray-100 dark:border-line bg-white dark:bg-bg-raised p-3.5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand-deep">
                  <WalletIcon name="briefcase" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-sm font-bold text-gray-900 dark:text-ink">{bank?.bank_name}</p>
                  <p className="mb-0.5 text-xs text-gray-600 dark:text-ink-soft">{bank?.account_name}</p>
                  <p className="text-xs text-gray-400 dark:text-ink-soft">{bank?.account_number}</p>
                </div>
                <Link
                  href="/merchants/wallet/bank-account"
                  className="rounded-lg border border-brand px-3 py-1.5 text-xs font-bold text-brand-deep"
                >
                  Change
                </Link>
              </div>
            ) : (
              <Link
                href="/merchants/wallet/bank-account"
                className="flex items-center gap-2.5 rounded-2xl border-[1.5px] border-dashed border-brand bg-white dark:bg-bg-raised p-4 text-brand-deep"
              >
                <WalletIcon name="plus-circle" />
                <span className="flex-1 text-sm font-semibold">Add a bank account first</span>
                <WalletIcon name="chevron-right" className="size-4" />
              </Link>
            )}
          </div>

          {/* Info */}
          <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 dark:bg-indigo-tint p-3 text-blue-700">
            <WalletIcon name="info" className="mt-0.5 size-3.75 shrink-0 text-blue-500" />
            <p className="flex-1 text-[13px] leading-4.75">
              Withdrawals are processed within the next 24 hours. Minimum withdrawal is ₦100. A
              transfer fee applies.
            </p>
          </div>

          {!hasBankAccount && <Banner>You need to add a bank account before withdrawing</Banner>}
          {hasBankAccount && balance <= 0 && <Banner>No withdrawable balance available yet</Banner>}
          {hasBankAccount && balance > 0 && amount !== "" && numericAmount < 100 && (
            <Banner>Minimum withdrawal amount is ₦100</Banner>
          )}
          {hasBankAccount && balance > 0 && amount !== "" && numericAmount > balance && (
            <Banner>Amount exceeds available balance</Banner>
          )}

          {submitError && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 dark:border-clay bg-red-50 dark:bg-clay-tint px-4 py-3 text-sm font-medium text-red-700 dark:text-clay"
            >
              <strong>Withdrawal Failed.</strong> {submitError}
            </p>
          )}

          <button
            type="button"
            onClick={handleWithdraw}
            disabled={!canWithdraw || submitting}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-base font-extrabold text-white disabled:opacity-50"
          >
            {submitting ? (
              "Processing…"
            ) : (
              <>
                <WalletIcon name="upload" className="size-4.5" />
                Withdraw {canWithdraw ? formatAmount(numericAmount) : ""}
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
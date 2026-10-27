"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  getBankChangeStatus,
  getBankList,
  getVendorBalance,
  resolveBankAccount,
  saveBankDetails,
  type Bank,
  type BankDetails,
  type PendingBankRequest,
} from "@/lib/api/vendor-wallet";
import { errorMessage } from "@/components/vendor/ui";
import { BackHeader, WalletIcon } from "@/components/vendor/wallet-ui";

const inputCls =
  "w-full rounded-xl border border-gray-200 dark:border-line bg-gray-50 dark:bg-bg px-3.5 py-3 text-[15px] text-gray-900 dark:text-ink outline-none focus:border-brand";
const labelCls = "mb-1.5 block text-[13px] font-bold text-gray-800 dark:text-ink";

type Notice = { type: "success" | "error"; title: string; text?: string };

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <span className="text-[13px] font-medium text-gray-400 dark:text-ink-soft">{label}</span>
      <span className="text-right text-[13px] font-bold text-gray-900 dark:text-ink">{value}</span>
    </div>
  );
}

export default function BankAccountPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [pendingRequest, setPendingRequest] = useState<PendingBankRequest | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);

  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState("");

  const hasSavedAccount = !!(bankDetails?.bank_name && bankDetails?.account_number);
  const hasPendingRequest = !!pendingRequest;
  const canSave = !!bankCode && accountNumber.length === 10 && resolved && !resolving;

  const filteredBanks = useMemo(
    () => banks.filter((b) => b.label.toLowerCase().includes(bankSearch.toLowerCase())),
    [banks, bankSearch],
  );

  // ── Load saved account + pending request ───────────────────────────────────
  const loadStatus = useCallback(async () => {
    const [bal, pending] = await Promise.allSettled([getVendorBalance(), getBankChangeStatus()]);
    let firstError: unknown = null;
    if (bal.status === "fulfilled") setBankDetails(bal.value.bankDetails);
    else firstError = bal.reason;
    if (pending.status === "fulfilled") setPendingRequest(pending.value);
    else if (!firstError) firstError = pending.reason;
    setLoadError(firstError ? errorMessage(firstError) : null);
  }, []);

  useEffect(() => {
    Promise.allSettled([loadStatus(), getBankList().then(setBanks)])
      .then((results) => {
        if (results[1].status === "rejected") {
          setNotice({ type: "error", title: "Could not load bank list" });
        }
      })
      .finally(() => setLoading(false));
  }, [loadStatus]);

  // Show the form straight away when there is no saved account and nothing pending.
  useEffect(() => {
    if (!loading && !hasSavedAccount && !hasPendingRequest) setShowUpdateForm(true);
  }, [loading, hasSavedAccount, hasPendingRequest]);

  useEffect(() => {
    if (notice?.type !== "success") return;
    const id = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(id);
  }, [notice]);

  // ── Auto-resolve the account name once the number is 10 digits ─────────────
  useEffect(() => {
    if (accountNumber.length !== 10 || !bankCode) {
      setAccountName("");
      setResolved(false);
      setResolving(false);
      setResolveError(null);
      return;
    }
    let cancelled = false;
    setResolving(true);
    setAccountName("");
    setResolved(false);
    setResolveError(null);
    resolveBankAccount(accountNumber, bankCode)
      .then((name) => {
        if (cancelled) return;
        setAccountName(name);
        setResolved(!!name);
        if (!name) setResolveError("Account not found. Check the account number and bank");
      })
      .catch((err) => {
        if (!cancelled) setResolveError(errorMessage(err) || "Account not found. Check the account number and bank");
      })
      .finally(() => {
        if (!cancelled) setResolving(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accountNumber, bankCode]);

  async function handleSave() {
    if (!bankCode || !bankName || !accountNumber || !accountName) {
      setNotice({
        type: "error",
        title: "Incomplete details",
        text: "Please select a bank and enter a valid account number",
      });
      return;
    }
    setSubmitting(true);
    try {
      await saveBankDetails({ bankCode, bankName, accountNumber, accountName });

      // The backend holds this as a pending review, not an instant change, so reload
      // the real pending request (with its server id / requested_at).
      await loadStatus();
      setJustSubmitted(true);
      setNotice({
        type: "success",
        title: "Submitted for review",
        text: "You'll be notified once it's approved",
      });

      setShowUpdateForm(false);
      setBankCode("");
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      setResolved(false);
    } catch (err) {
      // 409: a pending request already existed (e.g. submitted from another device) —
      // refresh so the page reflects the real state.
      if (err instanceof ApiError && err.status === 409) await loadStatus();
      setNotice({
        type: "error",
        title: "Failed to save",
        text: errorMessage(err) || "Could not save bank details",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-6">
      <BackHeader title="Bank Account" backHref="/merchants/wallet" />

      {notice && (
        <p
          role={notice.type === "error" ? "alert" : "status"}
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            notice.type === "error"
              ? "border-red-200 dark:border-clay bg-red-50 dark:bg-clay-tint text-red-700 dark:text-clay"
              : "border-green-200 dark:border-leaf bg-green-50 dark:bg-leaf-tint text-green-700 dark:text-leaf"
          }`}
        >
          <strong>{notice.title}</strong>
          {notice.text ? ` — ${notice.text}` : ""}
        </p>
      )}

      {loadError && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 dark:border-clay bg-red-50 dark:bg-clay-tint px-4 py-3 text-sm font-medium text-red-700 dark:text-clay"
        >
          {loadError}
        </p>
      )}

      {loading ? (
        <p className="py-14 text-center text-sm text-gray-500 dark:text-ink-soft">Loading…</p>
      ) : (
        <div className="mt-5 space-y-4">
          {/* Pending review card */}
          {hasPendingRequest && pendingRequest && (
            <div className="space-y-3 rounded-2xl border border-amber-200 dark:border-brand bg-amber-50 dark:bg-brand-tint p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-10.5 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-brand-tint text-amber-600 dark:text-brand">
                  <WalletIcon name="clock" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-amber-800 dark:text-brand">
                    {justSubmitted ? "Submitted for review" : "Awaiting review"}
                  </p>
                  <p className="mt-0.5 text-xs leading-4.25 text-amber-700 dark:text-brand">
                    Your current bank account below stays active until this is approved
                  </p>
                </div>
              </div>
              <div className="h-px bg-amber-200" />
              <InfoRow label="New Bank" value={pendingRequest.new_bank_name} />
              <InfoRow label="New Account Name" value={pendingRequest.new_account_name} />
              <InfoRow label="New Account Number" value={pendingRequest.new_account_number} />
            </div>
          )}

          {/* Saved (currently active) account */}
          {hasSavedAccount && (
            <div className="space-y-3 rounded-2xl border border-green-200 dark:border-leaf bg-white dark:bg-bg-raised p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-10.5 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-leaf-tint text-green-700 dark:text-leaf">
                    <WalletIcon name="briefcase" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-ink">Linked Bank Account</p>
                    <p className="mt-px text-xs text-gray-500 dark:text-ink-soft">Verified with Paystack</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-green-100 dark:bg-leaf-tint px-2 py-1 text-[11px] font-bold text-green-700 dark:text-leaf">
                  <WalletIcon name="check" className="size-2.75" />
                  Verified
                </span>
              </div>
              <div className="h-px bg-green-50 dark:bg-leaf-tint" />
              <InfoRow label="Bank" value={bankDetails?.bank_name} />
              <InfoRow label="Account Name" value={bankDetails?.account_name} />
              <InfoRow label="Account Number" value={bankDetails?.account_number} />

              {!hasPendingRequest && (
                <button
                  type="button"
                  onClick={() => setShowUpdateForm((v) => !v)}
                  className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-brand bg-brand/10 py-2.5 text-[13px] font-bold text-brand-deep"
                >
                  <WalletIcon name={showUpdateForm ? "chevron-up" : "edit"} className="size-3.5" />
                  {showUpdateForm ? "Cancel Update" : "Update Account"}
                </button>
              )}
            </div>
          )}

          {/* Update form — hidden entirely while a request is pending (one pending request at a time) */}
          {showUpdateForm && !hasPendingRequest && (
            <div className="space-y-3.5 rounded-2xl border border-gray-100 dark:border-line bg-white dark:bg-bg-raised p-4">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-ink">
                {hasSavedAccount ? "Update Bank Account" : "Add Bank Account"}
              </h2>
              <p className="text-[13px] leading-4.75 text-gray-500 dark:text-ink-soft">
                Select your bank and enter your account number. Your account name will be verified
                automatically.
                {hasSavedAccount
                  ? " Changes are reviewed before they take effect — your current account keeps receiving withdrawals until then."
                  : ""}
              </p>

              {/* Bank picker */}
              <div>
                <label className={labelCls}>Bank *</label>
                <button
                  type="button"
                  onClick={() => setBankModalOpen(true)}
                  className={`${inputCls} relative flex min-h-12.5 items-center pr-10 text-left`}
                >
                  <span className={`truncate ${bankName ? "text-gray-900 dark:text-ink" : "text-gray-400 dark:text-ink-soft"}`}>
                    {bankName || "Select a bank..."}
                  </span>
                  <WalletIcon name="chevron-down" className="absolute right-3.5 size-5 text-gray-400 dark:text-ink-soft" />
                </button>
              </div>

              {/* Account number */}
              <div>
                <label className={labelCls}>Account Number *</label>
                <div className="relative">
                  <input
                    className={`${inputCls} pr-11`}
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  />
                  {resolving && (
                    <span
                      aria-label="Verifying"
                      className="absolute right-3.5 top-3.5 size-4.5 animate-spin rounded-full border-2 border-brand border-t-transparent"
                    />
                  )}
                  {resolved && !resolving && (
                    <WalletIcon name="check-circle" className="absolute right-3.5 top-3.5 size-4.5 text-green-600 dark:text-leaf" />
                  )}
                </div>
                {resolveError && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-clay">{resolveError}</p>}
              </div>

              {/* Account name (auto-resolved) */}
              <div>
                <label className={labelCls}>Account Name</label>
                <div
                  className={`${inputCls} flex min-h-12.5 items-center ${
                    resolved ? "border-green-200 dark:border-leaf bg-green-50 dark:bg-leaf-tint" : ""
                  }`}
                >
                  <span
                    className={
                      resolved
                        ? "text-sm font-bold text-green-700 dark:text-leaf"
                        : "text-sm italic text-gray-400 dark:text-ink-soft"
                    }
                  >
                    {resolving ? "Verifying..." : accountName || "Will be verified automatically"}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 dark:bg-indigo-tint p-3 text-blue-700">
                <WalletIcon name="shield" className="mt-0.5 size-3.75 shrink-0 text-blue-500" />
                <p className="flex-1 text-[13px] leading-4.75">
                  Your account details are verified securely with Paystack, then reviewed before
                  becoming active — this protects your payouts if your account is ever compromised.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave || submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-base font-extrabold text-white disabled:opacity-50"
              >
                {submitting ? (
                  "Submitting…"
                ) : (
                  <>
                    <WalletIcon name="save" className="size-4.5" />
                    {hasSavedAccount ? "Submit for Review" : "Submit Bank Account"}
                  </>
                )}
              </button>
            </div>
          )}

          {/* No account, nothing pending */}
          {!hasSavedAccount && !hasPendingRequest && !showUpdateForm && (
            <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-gray-100 dark:border-line bg-white dark:bg-bg-raised p-8 text-center">
              <WalletIcon name="alert-circle" className="size-10 text-amber-400" />
              <p className="text-base font-bold text-gray-800 dark:text-ink">No bank account linked</p>
              <p className="text-[13px] text-gray-400 dark:text-ink-soft">Add a bank account to enable withdrawals</p>
              <button
                type="button"
                onClick={() => setShowUpdateForm(true)}
                className="mt-2 flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white"
              >
                <WalletIcon name="plus-circle" className="size-4" />
                Add Bank Account
              </button>
            </div>
          )}

          {/* No account yet, but a first-time request is pending */}
          {!hasSavedAccount && hasPendingRequest && (
            <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-gray-100 dark:border-line bg-white dark:bg-bg-raised p-8 text-center">
              <WalletIcon name="clock" className="size-10 text-amber-600 dark:text-brand" />
              <p className="text-base font-bold text-gray-800 dark:text-ink">Account under review</p>
              <p className="text-[13px] text-gray-400 dark:text-ink-soft">You&apos;ll be able to withdraw once it&apos;s approved</p>
            </div>
          )}
        </div>
      )}

      {/* Bank selection modal */}
      {bankModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setBankModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bank-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] min-h-[50vh] w-full max-w-lg flex-col rounded-t-[20px] bg-white dark:bg-bg-raised sm:rounded-[20px]"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 dark:border-line p-4">
              <h2 id="bank-modal-title" className="text-base font-extrabold text-gray-900 dark:text-ink">
                Select Bank
              </h2>
              <button
                type="button"
                onClick={() => setBankModalOpen(false)}
                aria-label="Close"
                className="p-1 text-gray-500 dark:text-ink-soft"
              >
                <WalletIcon name="x" />
              </button>
            </div>

            <div className="m-4 flex shrink-0 items-center rounded-xl border border-gray-200 dark:border-line bg-gray-100 dark:bg-bg-elevated px-3">
              <WalletIcon name="search" className="mr-2 size-4.5 text-gray-400 dark:text-ink-soft" />
              <input
                autoFocus
                className="h-12 min-w-0 flex-1 bg-transparent text-[15px] text-gray-900 dark:text-ink outline-none placeholder:text-gray-400 dark:placeholder:text-ink-soft"
                placeholder="Search banks..."
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
              />
            </div>

            <ul className="flex-1 overflow-y-auto pb-4">
              {filteredBanks.length === 0 ? (
                <li className="mt-6 text-center text-sm text-gray-500 dark:text-ink-soft">No banks found</li>
              ) : (
                filteredBanks.map((item) => (
                  <li key={item.value}>
                    <button
                      type="button"
                      onClick={() => {
                        setBankCode(item.value);
                        setBankName(item.label);
                        setBankModalOpen(false);
                        setBankSearch("");
                      }}
                      className="flex w-full items-center justify-between border-b border-gray-50 px-4 py-3.5 text-left"
                    >
                      <span
                        className={`text-[15px] ${
                          bankCode === item.value ? "font-bold text-brand-deep" : "text-gray-800 dark:text-ink"
                        }`}
                      >
                        {item.label}
                      </span>
                      {bankCode === item.value && (
                        <WalletIcon name="check" className="size-4.5 text-brand-deep" />
                      )}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Send } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getWallet, transferWallet, type WalletData } from "@/lib/api/wallet";
import { ApiError } from "@/lib/api/client";
import Link from "next/link";
import { useAuthModalStore } from "@/store/authModalStore";

export default function WalletPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const openLogin = useAuthModalStore((s) => s.openLogin);

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);

  const [showTransferForm, setShowTransferForm] = useState(false);

  useEffect(() => {
  if (!authLoading && !user) {
    openLogin("/account/wallet");
    router.replace("/");
  }
}, [authLoading, user, router, openLogin]);

  useEffect(() => {
    if (!user) return;
    getWallet()
      .then(setWallet)
      .catch((e) => setWalletError(e instanceof ApiError ? e.message : "Failed to load wallet"))
      .finally(() => setWalletLoading(false));
  }, [user]);

  if (authLoading || !user) {
    return <div className="mx-auto max-w-lg px-4 py-16 text-ink-soft">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link href="/account" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size={16} />
        Back to profile
      </Link>

      <h1 className="font-display text-2xl font-semibold text-ink">Wallet</h1>

      {walletLoading ? (
        <p className="mt-8 text-sm text-ink-soft">Loading wallet…</p>
      ) : walletError ? (
        <p className="mt-8 text-sm text-clay">{walletError}</p>
      ) : wallet ? (
        <>
          <div className="mt-6 rounded-2xl bg-ink p-6 text-white">
            <p className="text-xs uppercase tracking-wide text-white/60">Balance</p>
            <p className="mt-1 font-display text-3xl font-semibold">
              ₦{wallet.balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-3 text-xs text-white/60">
              Wallet ID: <span className="font-medium text-white">{wallet.wallet_id}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowTransferForm((v) => !v)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-deep px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            <Send size={16} />
            Send money
          </button>

          {showTransferForm && (
            <TransferForm
              onSuccess={(updated) => {
                setWallet((prev) =>
                  prev ? { ...prev, balance: prev.balance - updated.amount } : prev
                );
                setShowTransferForm(false);
                // Refresh full transaction list from server
                getWallet().then(setWallet).catch(() => {});
              }}
            />
          )}

          <div className="mt-8">
            <h2 className="text-sm font-medium text-ink">Recent transactions</h2>
            {wallet.transactions.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">No transactions yet.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {wallet.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 rounded-xl border border-line bg-bg-raised p-3"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        tx.type === "credit" ? "bg-leaf/10 text-leaf" : "bg-clay/10 text-clay"
                      }`}
                    >
                      {tx.type === "credit" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{tx.description}</p>
                      <p className="text-xs text-ink-soft">
                        {new Date(tx.created_at).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        tx.type === "credit" ? "text-leaf" : "text-clay"
                      }`}
                    >
                      {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString("en-NG")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function TransferForm({
  onSuccess,
}: {
  onSuccess: (result: { amount: number }) => void;
}) {
  const [recipientWalletId, setRecipientWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      const result = await transferWallet({
        recipient_wallet_id: recipientWalletId.trim().toUpperCase(),
        amount: Number(amount),
      });
      setSuccessMessage(`₦${result.amount.toLocaleString("en-NG")} sent to ${result.recipient_name}`);
      setRecipientWalletId("");
      setAmount("");
      onSuccess({ amount: result.amount });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Transfer failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-2xl border border-line bg-bg-raised p-5">
      <div>
        <label htmlFor="recipientWalletId" className="block text-sm font-medium text-ink">
          Recipient Wallet ID
        </label>
        <input
          id="recipientWalletId"
          type="text"
          required
          placeholder="SW123456"
          value={recipientWalletId}
          onChange={(e) => setRecipientWalletId(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand-deep focus:outline-none focus:ring-1 focus:ring-brand-deep"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="amount" className="block text-sm font-medium text-ink">
          Amount (₦500 – ₦20,000)
        </label>
        <input
          id="amount"
          type="number"
          min={500}
          max={20000}
          required
          placeholder="1000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand-deep focus:outline-none focus:ring-1 focus:ring-brand-deep"
        />
      </div>

      {error && <p className="mt-3 text-sm text-clay">{error}</p>}
      {successMessage && <p className="mt-3 text-sm text-leaf">{successMessage}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
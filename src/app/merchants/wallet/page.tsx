"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getOrdersMetric } from "@/lib/api/vendor";
import {
  getTransactions,
  getVendorBalance,
  type Pagination,
  type Transaction,
  type VendorBalance,
} from "@/lib/api/vendor-wallet";
import { errorMessage } from "@/components/vendor/ui";
import { WalletIcon, formatAmount, formatDate } from "@/components/vendor/wallet-ui";

type OrderLike = {
  order_id: number | string;
  order_uid?: string;
  status?: string;
  subtotal?: number;
  created_at?: string;
  date?: string;
};

export default function WalletPage() {
  const [balance, setBalance] = useState<VendorBalance | null>(null);
  const [orders, setOrders] = useState<OrderLike[]>([]);
  const [apiTx, setApiTx] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const [bal, metric, tx] = await Promise.allSettled([
      getVendorBalance(),
      getOrdersMetric(),
      getTransactions(1),
    ]);

    let firstError: unknown = null;
    if (bal.status === "fulfilled") setBalance(bal.value);
    else firstError = bal.reason;

    if (metric.status === "fulfilled") setOrders((metric.value.orders ?? []) as unknown as OrderLike[]);
    else if (!firstError) firstError = metric.reason;

    if (tx.status === "fulfilled") {
      setApiTx(tx.value.transactions);
      setPagination(tx.value.pagination);
    } else if (!firstError) {
      firstError = tx.reason;
    }

    if (firstError) setError(errorMessage(firstError));
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function loadMore() {
    if (!pagination) return;
    setLoadingMore(true);
    try {
      const next = await getTransactions(pagination.page + 1);
      setApiTx((prev) => [...prev, ...next.transactions]);
      setPagination(next.pagination);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }

  // Earnings come from completed orders; withdrawals (debits) come from the API.
  const transactions = useMemo<Transaction[]>(() => {
    const orderTxs: Transaction[] = orders
      .filter((o) => {
        const s = (o.status ?? "").toLowerCase();
        return s === "completed" || s === "delivered";
      })
      .map((o) => ({
        ref_id: `order_${o.order_id}`,
        type: "credit",
        amount: o.subtotal ?? 0,
        description: `Payment for Order #${o.order_uid || o.order_id}`,
        order_id: o.order_id,
        transfer_code: null,
        created_at: o.created_at || o.date || new Date().toISOString(),
      }));

    const withdrawals = apiTx.filter((t) => t.type === "debit");

    return [...orderTxs, ...withdrawals].sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });
  }, [orders, apiTx]);

  const bank = balance?.bankDetails;
  const hasBankAccount = !!(bank?.bank_name && bank?.account_number);
  const available = balance?.balance ?? 0;
  const canWithdraw = hasBankAccount && available > 0;

  const actionBtn =
    "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold";

  return (
    <section className="mx-auto max-w-3xl px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-extrabold text-gray-900">Wallet</h1>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-sm font-semibold text-brand-deep underline underline-offset-4 disabled:opacity-60"
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <Link
            href="/merchants/wallet/bank-account"
            aria-label="Wallet settings"
            className="flex size-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
          >
            <WalletIcon name="settings" />
          </Link>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      )}

      {/* Main balance card */}
      <div className="mt-5 rounded-[20px] bg-brand p-5.5 text-white shadow-lg">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="mb-1.5 text-[13px] font-semibold text-white/75">Available Balance</p>
            <div className="flex items-center gap-2.5">
              <p className="text-3xl font-extrabold">
                {loading ? "…" : balanceVisible ? formatAmount(available) : "₦ ••••••"}
              </p>
              <button
                type="button"
                onClick={() => setBalanceVisible((v) => !v)}
                aria-label={balanceVisible ? "Hide balance" : "Show balance"}
                className="p-1 text-white/80"
              >
                <WalletIcon name={balanceVisible ? "eye" : "eye-off"} className="size-4.5" />
              </button>
            </div>
          </div>
          <span className="flex size-13 shrink-0 items-center justify-center rounded-full bg-white/15 text-white/60">
            <WalletIcon name="credit-card" className="size-7" />
          </span>
        </div>

        {/* Breakdown: Total Earned + Pending */}
        <div className="mb-4 flex items-center rounded-2xl bg-black/15 p-3.5">
          <div className="flex flex-1 items-center gap-2">
            <span className="size-2 rounded-full bg-white" />
            <div>
              <p className="mb-0.5 text-[10px] font-semibold text-white/65">Total Earned</p>
              <p className="text-sm font-extrabold">
                {balanceVisible ? formatAmount(balance?.totalEarned ?? 0) : "••••••"}
              </p>
            </div>
          </div>
          <span className="mx-2 h-8 w-px bg-white/20" />
          <div className="flex flex-1 items-center gap-2">
            <span className="size-2 rounded-full bg-amber-400" />
            <div>
              <p className="mb-0.5 text-[10px] font-semibold text-white/65">Pending</p>
              <p className="text-sm font-extrabold text-amber-400">
                {balanceVisible ? formatAmount(balance?.pendingBalance ?? 0) : "••••••"}
              </p>
            </div>
          </div>
        </div>

        {/* Bank account info */}
        <div className="mb-4.5 flex items-center gap-1.5 text-xs font-medium text-white/75">
          <WalletIcon name="briefcase" className="size-3.25" />
          <span>
            {hasBankAccount
              ? `${bank?.bank_name}  •  ${bank?.account_number}`
              : "No bank account linked"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          {canWithdraw ? (
            <Link
              href="/merchants/wallet/withdraw"
              className={`${actionBtn} border border-white/30 bg-white/25 text-white`}
            >
              <WalletIcon name="upload" className="size-3.75" />
              Withdraw
            </Link>
          ) : (
            <span
              aria-disabled
              className={`${actionBtn} cursor-not-allowed border border-white/30 bg-white/25 text-white opacity-50`}
            >
              <WalletIcon name="upload" className="size-3.75" />
              Withdraw
            </span>
          )}
          <Link
            href="/merchants/wallet/bank-account"
            className={`${actionBtn} bg-white text-brand-deep`}
          >
            <WalletIcon name="plus-circle" className="size-3.75" />
            {hasBankAccount ? "Update Bank" : "Add Bank"}
          </Link>
        </div>
      </div>

      {/* No bank account warning */}
      {!loading && !hasBankAccount && (
        <Link
          href="/merchants/wallet/bank-account"
          className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-100 p-3 text-[13px] font-semibold text-amber-800"
        >
          <WalletIcon name="alert-circle" className="size-4 shrink-0" />
          <span className="flex-1">Add a bank account to enable withdrawals</span>
          <WalletIcon name="chevron-right" className="size-4 shrink-0" />
        </Link>
      )}

      {/* Transactions */}
      <div className="mt-6">
        <h2 className="mb-3 text-[17px] font-extrabold text-gray-900">Transaction History</h2>

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-500">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <WalletIcon name="inbox" className="size-11 text-gray-300" />
            <p className="text-base font-bold text-gray-800">No transactions yet</p>
            <p className="text-[13px] text-gray-400">Your earnings and withdrawals will appear here</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {transactions.map((item) => {
                const isCredit = item.type === "credit";
                return (
                  <div
                    key={item.ref_id}
                    className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3.5"
                  >
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                        isCredit ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      }`}
                    >
                      <WalletIcon name={isCredit ? "arrow-down-left" : "arrow-up-right"} className="size-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="mb-0.5 truncate text-sm font-semibold text-gray-900">{item.description}</p>
                      <p className="text-xs text-gray-400">{formatDate(item.created_at)}</p>
                    </div>
                    <p className={`text-[15px] font-extrabold ${isCredit ? "text-green-600" : "text-red-600"}`}>
                      {isCredit ? "+" : "-"}
                      {formatAmount(item.amount)}
                    </p>
                  </div>
                );
              })}
            </div>

            {pagination && pagination.page < pagination.total_pages && (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="mt-1 w-full py-3.5 text-sm font-bold text-brand-deep disabled:opacity-60"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
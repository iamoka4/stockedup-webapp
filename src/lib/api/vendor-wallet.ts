import { apiGet, apiRequest } from "./client";

// Vendor-side wallet API. The buyer's wallet (/wallet.php, top-ups, transfers) lives in wallet.ts.

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// ─── Balance (GET /get-vendor-balance.php) ───────────────────────────────────

export interface BankDetails {
  bank_name?: string | null;
  account_name?: string | null;
  account_number?: string | null;
}

export interface VendorBalance {
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  bankDetails: BankDetails | null;
}

export async function getVendorBalance(): Promise<VendorBalance> {
  const d = await apiRequest<{
    balance?: number;
    pending_balance?: number;
    total_earned?: number;
    bank_details?: BankDetails | null;
  } | null>("/get-vendor-balance.php");

  return {
    balance: num(d?.balance),
    pendingBalance: num(d?.pending_balance),
    totalEarned: num(d?.total_earned),
    bankDetails: d?.bank_details ?? null,
  };
}

// ─── Transactions (GET /get-transactions.php?page=&limit=) ───────────────────

export interface Transaction {
  ref_id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  order_id: number | string | null;
  transfer_code: string | null;
  created_at: string;
}

export interface Pagination {
  page: number;
  limit?: number;
  total?: number;
  total_pages: number;
}

export async function getTransactions(
  page = 1,
  limit = 20,
): Promise<{ transactions: Transaction[]; pagination: Pagination | null }> {
  const d = await apiGet<{
    transactions?: Transaction[];
    pagination?: Partial<Pagination> | null;
  } | null>("/get-transactions.php", { page, limit });

  const p = d?.pagination;
  return {
    transactions: (d?.transactions ?? []).map((t) => ({ ...t, amount: num(t.amount) })),
    pagination: p ? { page: num(p.page) || page, total_pages: num(p.total_pages) || 1 } : null,
  };
}

// ─── Bank account ────────────────────────────────────────────────────────────

export interface PendingBankRequest {
  id?: number;
  new_bank_name: string;
  new_account_name: string;
  new_account_number: string;
  status?: string;
  requested_at?: string;
}

/** GET /get-bank-change-status.php -> the vendor's pending bank-change request, or null. */
export async function getBankChangeStatus(): Promise<PendingBankRequest | null> {
  const d = await apiRequest<{ pending_request?: PendingBankRequest | null } | null>(
    "/get-bank-change-status.php",
  );
  return d?.pending_request ?? null;
}

export interface Bank {
  label: string;
  value: string;
}

/** GET /get-bank-list.php -> { banks: [{ label, value }] } */
export async function getBankList(): Promise<Bank[]> {
  const data = await apiRequest<{ banks?: Bank[] } | null>("/get-bank-list.php");
  return data?.banks ?? [];
}

/** GET /resolve-bank-details.php?account_number=&bank_code= -> account name ("" if not found) */
export async function resolveBankAccount(accountNumber: string, bankCode: string): Promise<string> {
  const data = await apiGet<{ account_name?: string } | null>("/resolve-bank-details.php", {
    account_number: accountNumber,
    bank_code: bankCode,
  });
  return data?.account_name ?? "";
}

/** POST /save-bank-details.php. The backend holds this as a pending review. */
export function saveBankDetails(input: {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}): Promise<unknown> {
  return apiRequest<unknown>("/save-bank-details.php", {
    method: "POST",
    body: {
      bank_code: input.bankCode,
      bank_name: input.bankName,
      account_number: input.accountNumber,
      account_name: input.accountName,
    },
  });
}

// ─── Withdrawal ──────────────────────────────────────────────────────────────

/**
 * POST /request-withdrawal.php with an Idempotency-Key header, as on mobile:
 * retrying the same attempt with the same key replays the original result
 * instead of double-submitting.
 */
export async function requestWithdrawal(
  amount: number,
  idempotencyKey: string,
): Promise<{ reference?: string }> {
  const data = await apiRequest<{ reference?: string } | null>("/request-withdrawal.php", {
    method: "POST",
    body: { amount },
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return data ?? {};
}

// ─── Settlement reports (GET /get-settlement-reports.php?page=&limit=) ───────

export interface SettlementReport {
  id: number;
  period_start: string;
  period_end: string;
  gross_sales: number;
  platform_fee: number;
  net_payout: number;
  order_count: number;
  status: "pending" | "paid";
  sent_at: string | null;
  created_at: string;
}

export async function getSettlementReports(
  page = 1,
  limit = 10,
): Promise<{ reports: SettlementReport[]; pagination: Pagination | null }> {
  const d = await apiGet<{
    reports?: SettlementReport[];
    pagination?: Partial<Pagination> | null;
  } | null>("/get-settlement-reports.php", { page, limit });

  const p = d?.pagination;
  return {
    reports: (d?.reports ?? []).map((r) => ({
      ...r,
      gross_sales: num(r.gross_sales),
      platform_fee: num(r.platform_fee),
      net_payout: num(r.net_payout),
      order_count: num(r.order_count),
    })),
    pagination: p ? { page: num(p.page) || page, total_pages: num(p.total_pages) || 1 } : null,
  };
}
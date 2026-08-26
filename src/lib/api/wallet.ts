import { apiGet, apiRequest, ApiError } from "./client";
import { API_BASE_URL } from "@/lib/config";
import { tokenStore } from "@/lib/auth/tokenStore";

export interface WalletTransaction {
  id: number;
  type: "credit" | "debit";
  amount: number;
  description: string;
  created_at: string;
  reference: string;
  transfer_type: string;
  related_user_id: number | null;
  related_user_name: string | null;
}

export interface WalletData {
  balance: number;
  wallet_id: string;
  transactions: WalletTransaction[];
}

export function getWallet(): Promise<WalletData> {
  return apiGet("/wallet.php");
}

export interface TransferWalletInput {
  recipient_wallet_id: string;
  amount: number;
}

export interface TransferWalletResult {
  reference: string;
  amount: number;
  recipient_name: string;
  recipient_wallet_id: string;
}

export function transferWallet(input: TransferWalletInput): Promise<TransferWalletResult> {
  return apiRequest<TransferWalletResult>("/wallet-transfer.php", {
    method: "POST",
    body: input,
  });
}

export interface TopupResult {
  authorization_url: string;
  reference: string;
}

/**
 * initialize-topup.php's success response is NOT wrapped in a `data` key
 * (unlike wallet.php/wallet-transfer.php) — it returns `authorization_url`
 * and `reference` at the top level, so this bypasses apiRequest()'s
 * generic `data` extraction with its own fetch.
 *
 * Also: this endpoint returns authorization_url only, not access_code —
 * so top-up opens Paystack's hosted page in a new tab rather than the
 * Inline JS popup checkout uses. Confirm with verify-payment.php once the
 * person returns to this tab (it already has a wallet_topup handler).
 */
export async function initializeTopup(amount: number): Promise<TopupResult> {
  const accessToken = tokenStore.getAccessToken();
  const res = await fetch(`${API_BASE_URL}/initialize-topup.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ amount }),
  });

  const json = await res.json();
  if (json.status !== "success" || !json.authorization_url) {
    throw new ApiError(json.message || "Could not start top-up", res.status);
  }
  return { authorization_url: json.authorization_url, reference: json.reference };
}
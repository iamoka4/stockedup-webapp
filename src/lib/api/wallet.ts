import { apiGet, apiRequest } from "./client";

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
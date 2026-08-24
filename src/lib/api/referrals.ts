// lib/api/referrals.ts
import { apiGet } from "./client";

export interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalEarned: number;
  pendingEarned: number;
}

export function getReferrals(): Promise<ReferralData> {
  return apiGet("/referral.php");
}
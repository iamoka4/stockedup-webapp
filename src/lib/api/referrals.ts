import { apiRequest } from "./client";

export interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalEarned: number;
  pendingEarned: number;
}

/**
 * Confirmed against referral.php's actual response — fields are already
 * camelCase and match ReferralData 1:1, no mapping needed.
 */
export function getReferrals(): Promise<ReferralData> {
  return apiRequest("/referral.php", { method: "GET" });
}
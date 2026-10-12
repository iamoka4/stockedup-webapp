import { apiRequest } from "./client";

/**
 * ⚠ SET THESE three paths to the endpoints behind the mobile hooks
 * useGetVendorHours, useUpdateVendorHours and useToggleVendorStatus
 * (copy the string inside each hook's apiClient call, keeping the leading "/").
 * I haven't seen those hooks, so the paths and the two request bodies below
 * (updateVendorHours, toggleVendorStatus) are guesses.
 */
export const VENDOR_HOURS_PATH = "/get-vendor-hours.php";
export const UPDATE_HOURS_PATH = "/update-vendor-hours.php";
export const TOGGLE_STATUS_PATH = "/toggle-vendor-status.php";

export interface VendorDayHours {
  day_of_week: number;
  day_name: string;
  is_closed: boolean;
  /** "HH:MM:SS" */
  opening_time: string;
  /** "HH:MM:SS" */
  closing_time: string;
}

export type ManualOpenStatus = "open" | "closed";

export interface VendorHoursData {
  business_type: string;
  manual_open_status: ManualOpenStatus | null;
  hours: VendorDayHours[];
}

const toBool = (v: unknown) => v === true || v === 1 || v === "1";

export async function getVendorHours(): Promise<VendorHoursData> {
  const d = await apiRequest<{
    business_type?: string | null;
    manual_open_status?: string | null;
    hours?: Array<Record<string, unknown>>;
  } | null>(VENDOR_HOURS_PATH);

  const status = d?.manual_open_status;
  return {
    business_type: String(d?.business_type ?? "").toLowerCase(),
    manual_open_status: status === "open" || status === "closed" ? status : null,
    hours: (d?.hours ?? []).map((h) => ({
      day_of_week: Number(h.day_of_week),
      day_name: String(h.day_name ?? ""),
      is_closed: toBool(h.is_closed),
      opening_time: String(h.opening_time ?? "09:00:00"),
      closing_time: String(h.closing_time ?? "21:00:00"),
    })),
  };
}

/** Saves the whole weekly schedule. Throws ApiError (with the server's message) on failure. */
export async function updateVendorHours(hours: VendorDayHours[]): Promise<void> {
  await apiRequest<unknown>(UPDATE_HOURS_PATH, { method: "POST", body: { hours } });
}

/** Manual "temporarily closed right now" override that sits on top of the weekly schedule. */
export async function toggleVendorStatus(status: ManualOpenStatus): Promise<void> {
  await apiRequest<unknown>(TOGGLE_STATUS_PATH, {
    method: "POST",
    body: { manual_open_status: status },
  });
}
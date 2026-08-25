import { apiGet } from "./client";

export interface DeliverySlot {
  slot_id: string;
  datetime: string;
  label: string;
  available: boolean;
  unavailable_reason: string | null;
}

export interface DeliveryDay {
  date: string;
  label: string;
  day_short: string;
  date_display: string;
  has_available: boolean;
  slots: DeliverySlot[];
}

/**
 * Shape returned by getVendorStatusDetails() on the backend — only `status`
 * is confirmed to exist; other fields are unknown, so this stays loose.
 */
export interface VendorStatus {
  status?: string;
  [key: string]: unknown;
}

export interface DeliverySlotsData {
  vendor_id: number;
  vendor_status: VendorStatus;
  slot_config: {
    interval_minutes: number;
    prep_buffer_mins: number;
    days_shown: number;
    timezone: string;
  };
  days: DeliveryDay[];
}

export function getDeliverySlots(vendorId: number): Promise<DeliverySlotsData> {
  return apiGet("/get-delivery-slots.php", { vendor_id: vendorId });
}
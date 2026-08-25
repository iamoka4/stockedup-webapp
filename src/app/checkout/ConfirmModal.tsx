"use client";

import { MapPin, Clock, FileText } from "lucide-react";
import type { UserAddress } from "@/lib/api/types";
import type { DeliverySlot } from "@/lib/api/scheduling";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  address: UserAddress | null;
  slot: DeliverySlot | null;
  notes: string;
  deliveryFee: number;
  total: number;
  firstOrderDiscount: number;
  paying: boolean;
  isScheduled: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  address,
  slot,
  notes,
  deliveryFee,
  total,
  firstOrderDiscount,
  paying,
  isScheduled,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-bg-raised p-6 sm:rounded-3xl">
        <h2 className="font-display text-xl font-semibold text-ink">Confirm order</h2>
        <p className="mt-1 text-sm text-ink-soft">Please verify your details before payment.</p>

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-line bg-bg p-4">
          {address && (
            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brand-deep" />
              <div className="text-sm">
                <p className="font-medium text-ink">{address.line1}</p>
                <p className="text-ink-soft">{address.city}, {address.state}</p>
              </div>
            </div>
          )}

          {slot && (
            <Row icon={<Clock size={14} />} label="Delivery slot" value={slot.label} />
          )}

          {notes.trim() && (
            <Row icon={<FileText size={14} />} label="Note" value={notes.trim()} />
          )}

          {firstOrderDiscount > 0 && (
            <Row label="First order discount" value={`-₦${firstOrderDiscount.toLocaleString("en-NG")}`} valueClass="text-leaf" />
          )}

          <Row label="Delivery fee" value={`₦${deliveryFee.toLocaleString("en-NG")}`} />

          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="text-sm font-semibold text-ink">Total</span>
            <span className="font-display text-lg font-semibold text-brand-deep">
              ₦{total.toLocaleString("en-NG")}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onConfirm}
          disabled={paying}
          className="mt-5 w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-60"
        >
          {paying ? "Processing…" : isScheduled ? "Confirm & schedule" : "Confirm & pay"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-full border border-line py-3 text-sm font-medium text-ink-soft hover:border-ink"
        >
          Change details
        </button>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  valueClass,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-1.5 text-ink-soft">
        {icon}
        {label}
      </span>
      <span className={`font-medium ${valueClass ?? "text-ink"}`}>{value}</span>
    </div>
  );
}
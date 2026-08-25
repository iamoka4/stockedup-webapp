"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { getDeliverySlots, type DeliveryDay, type DeliverySlot } from "@/lib/api/scheduling";
import { ApiError } from "@/lib/api/client";

interface Props {
  vendorId: number | null;
  selectedSlot: DeliverySlot | null;
  onSelectSlot: (slot: DeliverySlot | null) => void;
  onVendorClosedChange: (closed: boolean) => void;
}

export function SchedulingPanel({ vendorId, selectedSlot, onSelectSlot, onVendorClosedChange }: Props) {
  const [days, setDays] = useState<DeliveryDay[]>([]);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) return;
    setLoading(true);
    setError(null);
    getDeliverySlots(vendorId)
      .then((data) => {
        setDays(data.days);
        // Backend status shape is loosely typed — treat anything other than
        // an explicit "open" as closed, matching the mobile app's gating logic.
        const closed = data.vendor_status?.status !== "open";
        onVendorClosedChange(closed);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn't load delivery slots."))
      .finally(() => setLoading(false));
  }, [vendorId, onVendorClosedChange]);

  if (!vendorId) return null;
  if (loading) return <p className="text-sm text-ink-soft">Loading delivery slots…</p>;
  if (error) return <p className="text-sm text-clay">{error}</p>;
  if (days.length === 0) return <p className="text-sm text-ink-soft">No delivery slots available right now.</p>;

  const activeDay = days[activeDayIdx];

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((day, i) => (
          <button
            key={day.date}
            type="button"
            onClick={() => setActiveDayIdx(i)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              i === activeDayIdx
                ? "border-brand-deep bg-brand-deep text-white"
                : "border-line text-ink-soft hover:border-brand"
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {activeDay.slots.map((slot) => {
          const isSelected = selectedSlot?.slot_id === slot.slot_id;
          return (
            <button
              key={slot.slot_id}
              type="button"
              disabled={!slot.available}
              onClick={() => onSelectSlot(isSelected ? null : slot)}
              className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                isSelected
                  ? "border-brand-deep bg-brand-deep text-white"
                  : "border-line text-ink hover:border-brand"
              }`}
            >
              <Clock size={13} />
              {slot.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  getVendorHours,
  updateVendorHours,
  type VendorDayHours,
  type VendorHoursData,
} from "@/lib/api/vendor-hours";
import { errorMessage } from "@/components/vendor/ui";
import { Toggle } from "@/components/vendor/Toggle";
import { VendorIcon } from "@/components/vendor/icons";

// "HH:MM:SS" <-> the "HH:MM" value an <input type="time"> uses.
const toInputValue = (t: string) => (t || "").slice(0, 5);
const fromInputValue = (v: string) => `${v}:00`;

export default function OperatingHoursPage() {
  const router = useRouter();
  const [data, setData] = useState<VendorHoursData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hours, setHours] = useState<VendorDayHours[]>([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await getVendorHours();
      setData(d);
      setHours(d.hours);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateDay(day: number, patch: Partial<VendorDayHours>) {
    setHours((prev) => prev.map((h) => (h.day_of_week === day ? { ...h, ...patch } : h)));
  }

  async function handleSave() {
    setSaving(true);
    setNotice(null);
    try {
      await updateVendorHours(hours);
      setNotice({ type: "success", text: "Operating hours updated" });
      setTimeout(() => router.back(), 1200);
    } catch (err) {
      setNotice({ type: "error", text: errorMessage(err) || "Could not save operating hours" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="py-20 text-center text-sm text-gray-500 dark:text-ink-soft">Loading…</p>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 px-8 py-20 text-center">
        <p className="text-sm text-[#FF3B30] dark:text-clay">{error}</p>
        <button
          type="button"
          onClick={load}
          className="mt-2 rounded-xl bg-brand px-6 py-3 font-bold text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Grocery vendors don't use a weekly schedule — they set a single daily opening/closing time.
  if (data?.business_type === "grocery") {
    return (
      <div className="flex flex-col items-center gap-3 px-8 py-20 text-center">
        <VendorIcon name="clock" className="size-12 text-[#ccc] dark:text-ink-soft" />
        <p className="text-base font-bold text-[#333] dark:text-ink">Not applicable for grocery vendors</p>
        <p className="max-w-sm text-[13px] leading-4.75 text-[#888] dark:text-ink-soft">
          Grocery stores use a single daily opening and closing time, set from your Shop Info
          settings, rather than a weekly schedule.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-2 rounded-xl bg-brand px-6 py-3 font-bold text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex size-9 items-center justify-center rounded-[10px] bg-[#F3F3F3] text-lg text-[#222] dark:text-ink"
        >
          ←
        </button>
        <h1 className="text-lg font-extrabold text-[#222] dark:text-ink">Operating Hours</h1>
        <span className="size-9" />
      </div>

      <p className="mb-4 mt-5 text-[13px] leading-4.75 text-[#777] dark:text-ink-soft">
        Set your hours for each day of the week. Customers will see your store as closed outside
        these times.
      </p>

      {notice && (
        <p
          role={notice.type === "error" ? "alert" : "status"}
          className={`mb-3 rounded-xl border px-4 py-3 text-sm font-medium ${
            notice.type === "error"
              ? "border-red-200 dark:border-clay bg-red-50 dark:bg-clay-tint text-red-700 dark:text-clay"
              : "border-green-200 dark:border-leaf bg-green-50 dark:bg-leaf-tint text-green-700 dark:text-leaf"
          }`}
        >
          {notice.text}
        </p>
      )}

      {hours.map((day) => (
        <div
          key={day.day_of_week}
          className="mb-3 rounded-[14px] border border-[#eee] dark:border-line bg-white dark:bg-bg-raised p-3.5"
        >
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-bold text-[#222] dark:text-ink">{day.day_name}</p>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-[#666] dark:text-ink-soft">
                {day.is_closed ? "Closed" : "Open"}
              </span>
              <Toggle
                checked={!day.is_closed}
                onChange={(open) => updateDay(day.day_of_week, { is_closed: !open })}
                label={`${day.day_name} open`}
              />
            </div>
          </div>

          {!day.is_closed && (
            <div className="mt-3 flex items-center gap-2.5 border-t border-[#f2f2f2] pt-3">
              <label className="min-w-0 flex-1 rounded-[10px] bg-[#F7F7F7] px-3 py-2.5">
                <span className="mb-0.5 block text-[11px] text-[#999] dark:text-ink-soft">Opens</span>
                <input
                  type="time"
                  value={toInputValue(day.opening_time)}
                  onChange={(e) =>
                    e.target.value &&
                    updateDay(day.day_of_week, { opening_time: fromInputValue(e.target.value) })
                  }
                  className="w-full bg-transparent text-[15px] font-bold text-[#222] dark:text-ink outline-none"
                />
              </label>

              <span className="text-[#bbb] dark:text-ink-soft" aria-hidden>
                →
              </span>

              <label className="min-w-0 flex-1 rounded-[10px] bg-[#F7F7F7] px-3 py-2.5">
                <span className="mb-0.5 block text-[11px] text-[#999] dark:text-ink-soft">Closes</span>
                <input
                  type="time"
                  value={toInputValue(day.closing_time)}
                  onChange={(e) =>
                    e.target.value &&
                    updateDay(day.day_of_week, { closing_time: fromInputValue(e.target.value) })
                  }
                  className="w-full bg-transparent text-[15px] font-bold text-[#222] dark:text-ink outline-none"
                />
              </label>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-4 w-full rounded-[14px] bg-brand py-4 text-base font-bold text-white disabled:opacity-70"
      >
        {saving ? "Saving…" : "Save Hours"}
      </button>
    </section>
  );
}
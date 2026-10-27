"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getVendorHours, toggleVendorStatus, type VendorHoursData } from "@/lib/api/vendor-hours";
import { Toggle } from "@/components/vendor/Toggle";
import { VendorIcon } from "@/components/vendor/icons";

/**
 * Self-contained: fetches its own data (business_type + manual_open_status), so it can
 * hide itself for grocery vendors without the page needing to know the business type.
 * Grocery status is fully automatic from their opening/closing hours.
 *
 * Two controls: a switch for "temporarily closed right now" (manual override on top of the
 * weekly schedule) and a link to the weekly hours page.
 */
export function StoreStatusCard() {
  const [data, setData] = useState<VendorHoursData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await getVendorHours();
      setData(d);
    } catch {
      setData(null); // fail quiet: no broken-looking card on the dashboard
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Keep in sync when the tab regains focus (the web equivalent of mobile refetching on focus).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  useEffect(() => {
    if (data?.manual_open_status) setIsOpen(data.manual_open_status === "open");
  }, [data?.manual_open_status]);

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(id);
  }, [error]);

  // Nothing to show while loading, on error, or for grocery vendors.
  if (loading || !data || data.business_type === "grocery") return null;

  async function handleToggle(nextOpen: boolean) {
    setIsOpen(nextOpen); // optimistic
    setSaving(true);
    try {
      await toggleVendorStatus(nextOpen ? "open" : "closed");
      setError(null);
    } catch {
      setIsOpen(!nextOpen); // revert on failure
      setError("Could not update store status");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-[15px] mt-[15px] rounded-2xl border border-[#e0e0e0] dark:border-line bg-white dark:bg-bg-raised p-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-[15px] font-bold text-[#222] dark:text-ink">Store Status</p>
          <p className="text-xs text-[#888] dark:text-ink-soft">
            {isOpen
              ? "Open — visible to customers now"
              : "Temporarily closed — hidden until you reopen"}
          </p>
        </div>
        <Toggle checked={isOpen} onChange={handleToggle} disabled={saving} label="Store open" />
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600 dark:text-clay">
          {error}
        </p>
      )}

      <Link
        href="/merchants/operating-hours"
        className="mt-3 flex items-center gap-1.5 border-t border-[#f0f0f0] dark:border-line pt-3 text-[13px] font-semibold text-brand"
      >
        <VendorIcon name="clock" className="size-4" />
        <span className="flex-1">Set Weekly Hours</span>
        <VendorIcon name="chevron" className="size-3.5" />
      </Link>
    </div>
  );
}
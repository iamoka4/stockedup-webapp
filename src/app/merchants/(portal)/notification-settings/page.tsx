"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DEFAULT_PREFERENCES,
  loadNotificationPreferences,
  saveNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/api/notificationPreferences";
import { VendorIcon } from "@/components/vendor/icons";

// ─── Config (same rows, icons and wording as mobile) ─────────────────────────

const PREFERENCE_ROWS: {
  key: keyof NotificationPreferences;
  icon: string;
  label: string;
  description: string;
}[] = [
  {
    key: "order_updates",
    icon: "📦",
    label: "Order Updates",
    description: "New orders, status changes, and cancellations",
  },
  {
    key: "promotions",
    icon: "🎉",
    label: "Promotions & Deals",
    description: "Platform-wide campaigns and featured opportunities",
  },
  {
    key: "new_products",
    icon: "🆕",
    label: "Product Alerts",
    description: "Tips on adding new products to boost sales",
  },
];

const ALL_OFF: NotificationPreferences = {
  order_updates: false,
  promotions: false,
  new_products: false,
};

// ─── Switch (orange track, white thumb — same colours as mobile) ─────────────

function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors disabled:opacity-60 ${
        checked ? "bg-[#FE7C09]" : "bg-[#E0E0E0]"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 size-5.5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MerchantNotificationSettingsPage() {
  const router = useRouter();

  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [masterEnabled, setMasterEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotificationPreferences()
      .then((saved) => {
        setPrefs(saved);
        setMasterEnabled(Object.values(saved).some(Boolean));
      })
      .finally(() => setLoading(false));
  }, []);

  async function persist(next: NotificationPreferences, previous: NotificationPreferences) {
    setSaving(true);
    setError(null);
    try {
      await saveNotificationPreferences(next);
    } catch {
      setPrefs(previous);
      setMasterEnabled(Object.values(previous).some(Boolean));
      setError("Could not update preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleMaster(value: boolean) {
    const previous = prefs;
    const next = value ? DEFAULT_PREFERENCES : ALL_OFF;
    setMasterEnabled(value);
    setPrefs(next);
    await persist(next, previous);
  }

  async function togglePref(key: keyof NotificationPreferences, value: boolean) {
    const previous = prefs;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    await persist(next, previous);
  }

  return (
    // -mb-24 / pb-24 lets the page background run behind the fixed tab bar.
    <div className="-mb-24 min-h-screen bg-[#F5F6FA] px-5 pb-24 pt-8">
      <div className="mx-auto max-w-2xl">
        {/* Title */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-[#1A1A2E] shadow-sm"
          >
            <VendorIcon name="arrowLeft" className="size-5" />
          </button>
          <h1 className="text-[26px] font-bold text-[#1A1A2E]">Notifications</h1>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Master toggle */}
        <div className="rounded-2xl bg-white px-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between py-4">
            <div className="mr-3 flex flex-1 items-center">
              <span className="mr-3.5 text-[22px]">🔔</span>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-[#1A1A2E]">Push Notifications</p>
                <p className="mt-0.5 text-xs text-[#999]">
                  {masterEnabled
                    ? "You'll be notified about orders and platform updates"
                    : "Tap to enable notifications"}
                </p>
              </div>
            </div>

            {loading ? (
              <span className="size-5 animate-spin rounded-full border-2 border-[#FE7C09] border-t-transparent" />
            ) : (
              <Switch
                checked={masterEnabled}
                onChange={toggleMaster}
                disabled={saving}
                label="Push Notifications"
              />
            )}
          </div>
        </div>

        {/* Per-type preferences */}
        {masterEnabled && !loading && (
          <>
            <p className="mb-2 ml-1 mt-5 text-[13px] font-semibold uppercase tracking-[0.8px] text-[#888]">
              Notification Types
            </p>

            <div className="rounded-2xl bg-white px-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              {PREFERENCE_ROWS.map((item, idx) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between py-4">
                    <div className="mr-3 flex flex-1 items-center">
                      <span className="mr-3.5 text-[22px]">{item.icon}</span>
                      <div className="flex-1">
                        <p className="text-[15px] font-semibold text-[#1A1A2E]">{item.label}</p>
                        <p className="mt-0.5 text-xs text-[#999]">{item.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={prefs[item.key]}
                      onChange={(v) => togglePref(item.key, v)}
                      disabled={saving}
                      label={item.label}
                    />
                  </div>
                  {idx < PREFERENCE_ROWS.length - 1 && <div className="ml-13 h-px bg-[#F0F0F0]" />}
                </div>
              ))}
            </div>

            <p className="mt-3 text-center text-xs text-[#BDBDBD]">
              You can change these anytime in your settings.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
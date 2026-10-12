"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getShopProfile, updateVendorLocation } from "@/lib/api/vendor";
import type { ShopLocation } from "@/components/vendor/ShopLocationPicker";

// Leaflet needs the browser, so skip server rendering for the picker.
const ShopLocationPicker = dynamic(() => import("@/components/vendor/ShopLocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-2xl border border-line bg-white text-sm text-gray-400">
      Loading map…
    </div>
  ),
});

export default function ShopLocationPage() {
  const router = useRouter();
  const [current, setCurrent] = useState<ShopLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getShopProfile()
      .then((p) => {
        const lat = Number(p.latitude);
        const lng = Number(p.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0) {
          setCurrent({ latitude: lat, longitude: lng, city: p.city ?? "" });
        }
      })
      .catch(() => {
        /* non-fatal: the map starts at the Awka default */
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleConfirm(loc: ShopLocation) {
    setNotice(null);
    setSaving(true);
    try {
      await updateVendorLocation(loc);
      setNotice({ type: "success", text: "Your shop location has been saved successfully." });
      setTimeout(() => router.push("/merchants/menu"), 1200);
    } catch (e) {
      setNotice({
        type: "error",
        text: e instanceof Error && e.message ? e.message : "Could not update location. Please try again.",
      });
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8">
        <div>
          <Link href="/merchants/menu" className="text-xs font-semibold text-brand hover:underline">
            ← Menu
          </Link>
          <h1 className="font-display mt-1 text-3xl font-extrabold text-gray-900">Shop Location</h1>
          <p className="mt-1 text-sm text-gray-500">Set where our staff collects your prepared orders</p>
        </div>

        <div className="rounded-xl bg-[#EBF5FB] p-3 text-[13px] leading-5 text-[#0070C0]">
          Drag the pin (or click the map) to your exact shop entrance so customers get accurate delivery fees.
        </div>

        {notice && (
          <div
            role="status"
            className={`rounded-xl border p-3 text-[13px] ${
              notice.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {notice.text}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="size-9 animate-spin rounded-full border-4 border-gray-200 border-t-brand" />
          </div>
        ) : (
          <ShopLocationPicker
            initialLocation={current}
            onConfirm={handleConfirm}
            confirmLabel="Update Shop Location"
            busy={saving}
          />
        )}
      </div>
    </div>
  );
}
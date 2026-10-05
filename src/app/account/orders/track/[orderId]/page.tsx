"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, MapPin, Phone, User } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAuthModalStore } from "@/store/authModalStore";
import { ApiError } from "@/lib/api/client";
import { getOrderTrackingLocation, type TrackingLocation } from "@/lib/api/orders";

// Leaflet touches `window`, so the map only loads in the browser.
const TrackingMap = dynamic(() => import("@/components/orders/TrackingMap"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-brand-tint" />,
});

const POLL_MS = 8000;

const STATUS_LABELS: Record<string, string> = {
  pending: "Preparing your order",
  rider_assigned: "Your rider is on the way",
  delivered: "Delivered",
};

export default function TrackOrderPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const openLogin = useAuthModalStore((s) => s.openLogin);
  const params = useParams<{ orderId: string }>();
  const orderId = Number(params.orderId);

  const [tracking, setTracking] = useState<TrackingLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      openLogin(`/account/orders/track/${params.orderId}`);
      router.replace("/");
    }
  }, [authLoading, user, router, openLogin, params.orderId]);

  const load = useCallback(async () => {
    try {
      const data = await getOrderTrackingLocation(orderId);
      setTracking(data);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load tracking info. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const delivered = tracking?.delivery_status === "delivered";

  // Poll every few seconds, pause while the tab is hidden, and stop once
  // the order is delivered.
  useEffect(() => {
    if (!user || !Number.isFinite(orderId) || orderId < 1 || delivered) return;
    load();
    const id = setInterval(() => {
      if (document.visibilityState !== "hidden") load();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [user, orderId, delivered, load]);

  if (authLoading || !user) {
    return <div className="mx-auto max-w-lg px-4 py-16 text-ink-soft">Loading…</div>;
  }

  const rider = tracking?.rider ?? null;
  const dest = tracking?.customer_location ?? null;
  const hasMap = !!(rider && dest);
  const status = tracking?.delivery_status ?? "pending";
  const distance = tracking?.distance_km;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link
        href="/account/orders"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={16} />
        Back to orders
      </Link>

      <h1 className="font-display text-2xl font-semibold text-ink">Track delivery</h1>

      {loading ? (
        <p className="mt-8 text-sm text-ink-soft">Loading tracking info…</p>
      ) : error && !tracking ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-line bg-bg-raised p-8 text-center">
          <AlertCircle size={32} className="text-clay" />
          <p className="mt-3 text-sm text-ink-soft">{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-4 rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-deep"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="mt-5 h-[55vh] min-h-72 overflow-hidden rounded-2xl border border-line bg-bg-raised">
            {hasMap ? (
              <TrackingMap
                rider={{ lat: rider!.latitude, lng: rider!.longitude }}
                dest={{ lat: dest!.latitude, lng: dest!.longitude }}
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-3 p-10 text-center">
                <MapPin size={36} className="text-line" />
                <p className="text-sm text-ink-soft">
                  {status === "pending" || !tracking?.delivery_status
                    ? "Your order is being prepared. A rider hasn't been assigned yet."
                    : "Waiting for your rider's live location…"}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-line bg-bg-raised p-5">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-leaf" />
              <p className="text-sm font-semibold text-ink">
                {STATUS_LABELS[status] ?? "Tracking your order"}
              </p>
            </div>

            {distance !== null && distance !== undefined && (
              <p className="mt-1 pl-4 text-sm text-ink-soft">
                {distance < 1
                  ? `${Math.round(distance * 1000)}m away`
                  : `${distance.toFixed(1)}km away`}
              </p>
            )}

            {rider && (
              <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-tint text-brand-deep">
                  <User size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{rider.name}</p>
                  {rider.vehicle_type && (
                    <p className="text-xs capitalize text-ink-soft">{rider.vehicle_type}</p>
                  )}
                </div>
                {rider.phone && (
                  <a
                    href={`tel:${rider.phone}`}
                    aria-label={`Call ${rider.name}`}
                    className="grid size-10 place-items-center rounded-full bg-brand text-white hover:bg-brand-deep"
                  >
                    <Phone size={18} />
                  </a>
                )}
              </div>
            )}
          </div>

          {error && tracking && (
            <p className="mt-3 text-center text-xs text-ink-soft">
              Couldn&apos;t refresh just now. Showing the last known position.
            </p>
          )}
        </>
      )}
    </div>
  );
}
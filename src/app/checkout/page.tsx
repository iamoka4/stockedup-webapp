"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { MapPin } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { useAuth } from "@/lib/auth/AuthContext";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { useDeliveryFees } from "./useDeliveryFees";
import { AddressPanel } from "./AddressPanel";
import { calculateOrderTotal } from "@/lib/checkout/fees";
import { initializePayment, verifyPayment } from "@/lib/api/payments";
import type { UserAddress } from "@/lib/api/types";

function generateIdempotencyKey(): string {
  return `web_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: cart, isLoading: cartLoading } = useCart();
  const router = useRouter();

  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [notes, setNotes] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const geo = useGeolocation();

  const vendorIds = useMemo(
    () => Array.from(new Set((cart?.items ?? []).map((i) => i.vendor_id))),
    [cart?.items]
  );
  const { total: deliveryFee, loading: feeLoading, error: feeError } = useDeliveryFees(
    vendorIds,
    geo.coords
  );

  const subtotal = cart?.subtotal ?? 0;
  const { processingFee, total } = calculateOrderTotal(subtotal, deliveryFee, 0);

  if (authLoading || cartLoading) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-ink-soft">Loading checkout…</div>;
  }

  if (!user) {
    router.replace("/login?next=/checkout");
    return null;
  }

  if (!cart || cart.items.length === 0) {
    router.replace("/cart");
    return null;
  }

  const readyToPay = !!selectedAddress && !!geo.coords && !feeLoading && !paying;

  async function handlePay() {
    if (!selectedAddress || !geo.coords || !cart) return;
    setPayError(null);
    setPaying(true);

    const shipping_address = [selectedAddress.line1, selectedAddress.line2, selectedAddress.city, selectedAddress.state]
      .filter(Boolean)
      .join(", ");

    const idempotency_key = generateIdempotencyKey();

    try {
      const result = await initializePayment(total, {
        items: cart.items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        shipping_address,
        delivery_fee: deliveryFee,
        customer_notes: notes || null,
        idempotency_key,
      });

      // Fully covered by wallet balance — verify-payment.php's fallback path
      // isn't needed since initialize-payment.php already created the order.
      if (result.order_id) {
        router.push(`/checkout/success?order=${result.order_id}`);
        return;
      }

      if (!result.access_code || !window.PaystackPop) {
        throw new Error("Payment could not be started. Please try again.");
      }

      const popup = new window.PaystackPop();
      popup.resumeTransaction(result.access_code, {
        onSuccess: async () => {
          try {
            // Always confirm server-side rather than trusting the client
            // callback alone — verify-payment.php is the source of truth
            // and is safe to call even if the webhook already processed it
            // (idempotency is handled on the backend).
            const verified = await verifyPayment(result.reference);
            router.push(`/checkout/success?order=${verified.order_id}`);
          } catch {
            router.push(`/checkout/success?reference=${result.reference}`);
          }
        },
        onCancel: () => {
          setPaying(false);
        },
        onError: (err: { message?: string }) => {
          setPayError(err?.message || "Payment failed. Please try again.");
          setPaying(false);
        },
      });
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Payment failed. Please try again.");
      setPaying(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Script src="https://js.paystack.co/v2/inline.js" strategy="lazyOnload" />

      <h1 className="font-display text-3xl font-semibold text-ink">Checkout</h1>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Delivery address</h2>
        <AddressPanel selectedId={selectedAddress?.id ?? null} onSelect={setSelectedAddress} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Delivery location</h2>
        {!geo.coords ? (
          <button
            type="button"
            onClick={geo.request}
            className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:border-brand"
          >
            <MapPin size={16} className="text-brand" />
            {geo.status === "locating" ? "Finding you…" : "Share my location for delivery"}
          </button>
        ) : (
          <p className="text-sm text-leaf">Location set — delivery fee calculated below.</p>
        )}
        {(geo.status === "denied" || geo.status === "unsupported") && (
          <p className="mt-2 text-sm text-clay">
            We couldn&apos;t access your location. Please enable location access in your browser,
            or contact support to set delivery manually for this order.
          </p>
        )}
        {feeError && <p className="mt-2 text-sm text-clay">{feeError}</p>}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Notes (optional)</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 300))}
          placeholder="e.g. Call me when you arrive"
          rows={3}
          className="input w-full"
        />
      </section>

      <section className="mt-8 rounded-2xl border border-line bg-bg-raised p-4">
        <Row label="Subtotal" value={subtotal} />
        <Row label="Processing fee" value={processingFee} />
        <Row label="Delivery fee" value={feeLoading ? null : deliveryFee} />
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <span className="font-semibold text-ink">Total</span>
          <span className="tabular font-display text-xl font-semibold text-ink">
            ₦{total.toLocaleString()}
          </span>
        </div>
      </section>

      {payError && <p className="mt-4 text-sm text-clay">{payError}</p>}

      <button
        type="button"
        disabled={!readyToPay}
        onClick={handlePay}
        className="mt-6 w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft"
      >
        {paying ? "Redirecting to payment…" : `Pay ₦${total.toLocaleString()}`}
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-ink-soft">{label}</span>
      <span className="tabular text-ink">{value === null ? "—" : `₦${value.toLocaleString()}`}</span>
    </div>
  );
}

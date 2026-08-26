"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { MapPin } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAuthModalStore } from "@/store/authModalStore";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { useDeliveryFees } from "./useDeliveryFees";
import { AddressPanel } from "./AddressPanel";
import { PaymentMethodPanel, type PaymentMethod } from "./PaymentMethodPanel";
import { VoucherPanel } from "./VoucherPanel";
import { SchedulingPanel } from "./SchedulingPanel";
import { ConfirmModal } from "./ConfirmModal";
import { calculateOrderTotal } from "@/lib/checkout/fees";
import { initializePayment, verifyPayment } from "@/lib/api/payments";
import { checkFirstOrderDiscount } from "@/lib/api/discounts";
import { getWallet } from "@/lib/api/wallet";
import type { UserAddress } from "@/lib/api/types";
import type { DeliverySlot } from "@/lib/api/scheduling";

function generateIdempotencyKey(): string {
  return `web_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: cart, isLoading: cartLoading } = useCart();
  const router = useRouter();
  const openLogin = useAuthModalStore((s) => s.openLogin);

  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [notes, setNotes] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paystack");
  const [walletBalance, setWalletBalance] = useState(0);

  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);

  const [firstOrderEligible, setFirstOrderEligible] = useState(false);
  const [firstOrderDiscount, setFirstOrderDiscount] = useState(0);
  const [firstOrderMinimum, setFirstOrderMinimum] = useState(0);

  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null);
  const [isVendorClosed, setIsVendorClosed] = useState(false);

  // Manual location fallback — shown when geolocation is denied/unsupported.
  // geo.setManual already existed in useGeolocation but was never wired
  // into this UI, so denied/unsupported customers had no path to checkout
  // at all. This is a plain lat/lng entry as a minimum viable fallback;
  // swap for a map-pin picker component if/when one exists.
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);

  const geo = useGeolocation();

  const vendorIds = useMemo(
    () => Array.from(new Set((cart?.items ?? []).map((i) => i.vendor_id))),
    [cart?.items]
  );
  const primaryVendorId = vendorIds[0] ?? null;

  const { total: deliveryFee, loading: feeLoading, error: feeError } = useDeliveryFees(
    vendorIds,
    geo.coords
  );

  const subtotal = cart?.subtotal ?? 0;

  const firstOrderApplied = firstOrderEligible && subtotal >= firstOrderMinimum ? firstOrderDiscount : 0;
  const combinedDiscount = voucherDiscount + firstOrderApplied;

  const { processingFee, total } = calculateOrderTotal(subtotal, deliveryFee, combinedDiscount);

  useEffect(() => {
    if (!authLoading && !user) {
      openLogin("/checkout");
      router.replace("/cart");
    }
  }, [authLoading, user, router, openLogin]);

  useEffect(() => {
    if (!cartLoading && cart && cart.items.length === 0) {
      router.replace("/cart");
    }
  }, [cartLoading, cart, router]);

  useEffect(() => {
    if (!user) return;
    getWallet()
      .then((w) => setWalletBalance(w.balance))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    checkFirstOrderDiscount()
      .then((d) => {
        setFirstOrderEligible(d.eligible);
        setFirstOrderDiscount(d.discount_amount);
        setFirstOrderMinimum(d.minimum_subtotal);
      })
      .catch(() => {});
  }, [user]);

  const handleVendorClosedChange = useCallback((closed: boolean) => {
    setIsVendorClosed(closed);
  }, []);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setManualError(null);

    const lat = Number(manualLat);
    const lng = Number(manualLng);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      setManualError("Please enter a valid latitude (-90 to 90) and longitude (-180 to 180).");
      return;
    }

    geo.setManual({ latitude: lat, longitude: lng });
  }

  if (authLoading || cartLoading || !user || !cart || cart.items.length === 0) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-ink-soft">Loading checkout…</div>;
  }

  const readyToPay =
    !!selectedAddress &&
    !!geo.coords &&
    !feeLoading &&
    !paying &&
    (!isVendorClosed || !!selectedSlot) &&
    !(paymentMethod === "wallet" && walletBalance <= 0);

  async function handlePay() {
    if (!selectedAddress || !geo.coords || !cart) return;
    setPayError(null);

    // FIX: this used to read geo.coords.lat / geo.coords.lng, but
    // Coordinates (useGeolocation.ts) defines { latitude, longitude } —
    // there is no .lat/.lng. That mismatch meant customerLatitude/
    // customerLongitude were always undefined, the typeof-number guard
    // below always failed, and handlePay() always bailed out with
    // "We couldn't determine your delivery location" before ever calling
    // initializePayment(). Checkout was broken for every web customer at
    // the final step, not intermittently.
    const customerLatitude = geo.coords.latitude;
    const customerLongitude = geo.coords.longitude;

    if (
      typeof customerLatitude !== "number" ||
      typeof customerLongitude !== "number" ||
      Number.isNaN(customerLatitude) ||
      Number.isNaN(customerLongitude)
    ) {
      setPayError("We couldn't determine your delivery location. Please share your location again.");
      return;
    }

    setPaying(true);
    setShowConfirm(false);

    const shipping_address = [selectedAddress.line1, selectedAddress.line2, selectedAddress.city, selectedAddress.state]
      .filter(Boolean)
      .join(", ");

    const idempotency_key = generateIdempotencyKey();

    try {
      const result = await initializePayment(total, {
        items: cart.items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        shipping_address,
        delivery_fee: deliveryFee,
        customer_latitude: customerLatitude,
        customer_longitude: customerLongitude,
        customer_notes: notes || null,
        idempotency_key,
        use_wallet_balance: paymentMethod === "wallet",
        voucher_code: voucherCode,
        discount_amount: combinedDiscount,
        order_type: selectedSlot ? "scheduled" : "instant",
        scheduled_for: selectedSlot?.datetime ?? null,
        scheduled_slot_id: selectedSlot?.slot_id ?? null,
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
          <>
            <button
              type="button"
              onClick={geo.request}
              className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:border-brand"
            >
              <MapPin size={16} className="text-brand" />
              {geo.status === "locating" ? "Finding you…" : "Share my location for delivery"}
            </button>

            {(geo.status === "denied" || geo.status === "unsupported") && (
              <div className="mt-4 rounded-2xl border border-line bg-bg-raised p-4">
                <p className="text-sm text-clay">
                  We couldn&apos;t access your location automatically. You can enter your
                  coordinates manually instead.
                </p>
                <form onSubmit={handleManualSubmit} className="mt-3 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      required
                      inputMode="decimal"
                      placeholder="Latitude"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      className="input"
                    />
                    <input
                      required
                      inputMode="decimal"
                      placeholder="Longitude"
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      className="input"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-full bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-deep"
                  >
                    Use these coordinates
                  </button>
                </form>
                {manualError && <p className="mt-2 text-sm text-clay">{manualError}</p>}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-leaf">Location set — delivery fee calculated below.</p>
        )}
        {feeError && <p className="mt-2 text-sm text-clay">{feeError}</p>}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Delivery time</h2>
        <SchedulingPanel
          vendorId={primaryVendorId}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
          onVendorClosedChange={handleVendorClosedChange}
        />
        {isVendorClosed && !selectedSlot && (
          <p className="mt-2 text-sm text-clay">This vendor is currently closed — please pick a delivery slot.</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Payment method</h2>
        <PaymentMethodPanel selected={paymentMethod} onSelect={setPaymentMethod} walletBalance={walletBalance} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Voucher code</h2>
        <VoucherPanel
          subtotal={subtotal}
          appliedCode={voucherCode}
          discount={voucherDiscount}
          onApply={(code, discount) => {
            setVoucherCode(code);
            setVoucherDiscount(discount);
          }}
          onRemove={() => {
            setVoucherCode(null);
            setVoucherDiscount(0);
          }}
        />
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

      {firstOrderEligible && subtotal >= firstOrderMinimum && (
        <div className="mt-8 rounded-2xl border border-brand-deep/20 bg-brand-warm/40 p-4">
          <p className="text-sm font-medium text-brand-deep">
            🎉 Welcome to StockedUp! ₦{firstOrderDiscount.toLocaleString("en-NG")} has been applied to your first order.
          </p>
        </div>
      )}
      {firstOrderEligible && subtotal < firstOrderMinimum && (
        <p className="mt-4 text-xs text-ink-soft">
          Add ₦{(firstOrderMinimum - subtotal).toLocaleString("en-NG")} more to unlock your first-order discount.
        </p>
      )}

      <section className="mt-8 rounded-2xl border border-line bg-bg-raised p-4">
        <Row label="Subtotal" value={subtotal} />
        <Row label="Processing fee" value={processingFee} />
        <Row label="Delivery fee" value={feeLoading ? null : deliveryFee} />
        {voucherDiscount > 0 && <Row label="Voucher discount" value={-voucherDiscount} />}
        {firstOrderApplied > 0 && <Row label="First order discount" value={-firstOrderApplied} />}
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
        onClick={() => setShowConfirm(true)}
        className="mt-6 w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft"
      >
        {paying ? "Redirecting to payment…" : isVendorClosed ? "Schedule order" : `Pay ₦${total.toLocaleString()}`}
      </button>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handlePay}
        address={selectedAddress}
        slot={selectedSlot}
        notes={notes}
        deliveryFee={deliveryFee}
        total={total}
        firstOrderDiscount={firstOrderApplied}
        paying={paying}
        isScheduled={!!selectedSlot}
      />
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
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { MapPin } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAuthModalStore } from "@/store/authModalStore";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { AREA_GROUPS } from "@/lib/constants/cityCoords";
import { useDeliveryFees } from "./useDeliveryFees";
import { useCheckoutQuote } from "./useCheckoutQuote";
import { AddressPanel } from "./AddressPanel";
import { PaymentMethodPanel, type PaymentMethod } from "./PaymentMethodPanel";
import { VoucherPanel } from "./VoucherPanel";
import { SchedulingPanel } from "./SchedulingPanel";
import { ConfirmModal } from "./ConfirmModal";
import { initializePayment, verifyPayment, type CheckoutItem } from "@/lib/api/payments";
import { getWallet } from "@/lib/api/wallet";
import type { UserAddress, CartItemAddon } from "@/lib/api/types";
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
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paystack");
  const [walletBalance, setWalletBalance] = useState(0);

  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);

  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null);
  const [isVendorClosed, setIsVendorClosed] = useState(false);

  // Manual location fallback — shown when geolocation is denied/unsupported.
  // An "area" dropdown (same named areas and coordinates as the mobile app's
  // CITY_COORDS) is the primary fallback; raw coordinates are still available
  // behind an "advanced" toggle for the rare case an area isn't listed.
  const [selectedAreaLabel, setSelectedAreaLabel] = useState("");
  const [showAdvancedManual, setShowAdvancedManual] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);

  const geo = useGeolocation();

  const vendorIds = useMemo(
    () => Array.from(new Set((cart?.items ?? []).map((i) => i.vendor_id))),
    [cart?.items]
  );
  const primaryVendorId = vendorIds[0] ?? null;

  // ONE locked delivery quote for the whole cart (the same call the mobile app
  // makes). Its id goes to the checkout quote below and to the payment, so the
  // backend charges exactly the fee shown here.
  const {
    quoteId: deliveryQuoteId,
    total: deliveryFee,
    loading: feeLoading,
    error: feeError,
    ensureFresh,
  } = useDeliveryFees(vendorIds, geo.coords);

  // Used only for the voucher panel's minimum-order check. Every amount the
  // customer is charged comes from the backend quote below.
  const subtotal = useMemo(() => {
    const computed = (cart?.items ?? []).reduce((sum, i) => {
      const addonsTotal = (i.addons ?? []).reduce(
        (aSum, a) => aSum + (Number(a.total_price) || 0),
        0
      );
      return sum + (Number(i.price) || 0) * (Number(i.quantity) || 0) + addonsTotal;
    }, 0);
    return computed > 0 ? computed : cart?.subtotal ?? 0;
  }, [cart?.items, cart?.subtotal]);

  // Same item shape the mobile app sends: base unit price (add-ons excluded),
  // add-ons as { addon_option_id, quantity }, and the per-item special request.
  // Add-ons whose option the vendor has since deleted (null id) are dropped,
  // since there is no live option left to attach to the order. Built once and
  // used for both the quote and the payment so they cannot differ.
  const checkoutItems = useMemo<CheckoutItem[]>(
    () =>
      (cart?.items ?? []).map((i) => {
        const addons = (i.addons ?? [])
          .filter(
            (a): a is CartItemAddon & { addon_option_id: number } => a.addon_option_id !== null
          )
          .map((a) => ({
            addon_option_id: a.addon_option_id,
            quantity: a.quantity,
          }));

        return {
          product_id: i.product_id,
          quantity: i.quantity,
          price: i.price,
          ...(addons.length > 0 ? { addons } : {}),
          ...(i.special_request ? { special_request: i.special_request } : {}),
        };
      }),
    [cart?.items]
  );

  const {
    quote,
    loading: quoteLoading,
    error: quoteError,
  } = useCheckoutQuote({
    enabled: !!geo.coords && !!deliveryQuoteId,
    items: checkoutItems,
    latitude: geo.coords?.latitude,
    longitude: geo.coords?.longitude,
    quoteId: deliveryQuoteId,
    voucherCode,
  });

  const total = quote?.total ?? 0;
  const standardDeliveryFee = quote?.delivery.standard_fee ?? 0;
  const deliveryDiscount = quote?.delivery.discount ?? 0;
  const deliveryCharge = quote?.delivery.charge ?? 0;
  const promo = quote?.promotion;

  // The server is the judge of vouchers: if it rejects one, drop it here too.
  useEffect(() => {
    if (quote?.voucher_error && voucherCode) {
      setVoucherCode(null);
      setVoucherDiscount(0);
    }
  }, [quote?.voucher_error, voucherCode]);

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

  const handleVendorClosedChange = useCallback((closed: boolean) => {
    setIsVendorClosed(closed);
  }, []);

  function handleAreaSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const label = e.target.value;
    setSelectedAreaLabel(label);
    if (!label) return;

    const area = AREA_GROUPS.flatMap((g) => g.areas).find((a) => a.label === label);
    if (!area) return;

    geo.setManual({ latitude: area.latitude, longitude: area.longitude });
  }

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
    !!deliveryQuoteId &&
    !feeLoading &&
    !!quote &&
    !quoteLoading &&
    !quoteError &&
    !paying &&
    (!isVendorClosed || !!selectedSlot) &&
    !(paymentMethod === "wallet" && walletBalance <= 0);

  async function handlePay() {
    if (!selectedAddress || !geo.coords || !cart || !quote) return;
    setPayError(null);

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

    // A delivery quote only lives for a limited time. If the one on screen is
    // getting old, get a fresh one before paying. When its fee is unchanged the
    // total shown is still right and the payment goes ahead with the new quote;
    // if the fee moved, the customer reviews the new total first.
    const feeShown = deliveryFee;
    const fresh = await ensureFresh();

    if (!fresh.quote || !fresh.quote.quote_id) {
      setPayError("We couldn't confirm your delivery fee. Please try again.");
      setPaying(false);
      return;
    }

    if (fresh.refreshed && Math.abs(fresh.quote.total - feeShown) > 0.5) {
      setPayError("Your delivery fee was updated. Please review your total and tap Pay again.");
      setPaying(false);
      return;
    }

    const quoteIdToPay = fresh.quote.quote_id;

    const shipping_address = [selectedAddress.line1, selectedAddress.line2, selectedAddress.city, selectedAddress.state]
      .filter(Boolean)
      .join(", ");

    const idempotency_key = generateIdempotencyKey();

    try {
      const result = await initializePayment(
        Math.round(total),
        {
          items: checkoutItems,
          shipping_address,
          quote_id: quoteIdToPay,
          idempotency_key,
          use_wallet_balance: paymentMethod === "wallet",
          voucher_code: voucherCode,
          order_type: selectedSlot ? "scheduled" : "instant",
          scheduled_for: selectedSlot?.datetime ?? null,
          scheduled_slot_id: selectedSlot?.slot_id ?? null,
        },
        customerLatitude,
        customerLongitude
      );

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

      <section className="mt-8 rounded-2xl border border-line bg-bg-raised p-4">
        <h2 className="font-display text-lg font-semibold text-ink">Order items</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {cart.items.length} item{cart.items.length !== 1 ? "s" : ""} in this order
        </p>

        <ul className="mt-3">
          {cart.items.map((item, idx) => {
            const addons = item.addons ?? [];
            const addonsTotal = addons.reduce((sum, a) => sum + (Number(a.total_price) || 0), 0);
            const baseTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
            const isLast = idx === cart.items.length - 1;

            return (
              <li key={item.id} className={isLast ? "py-3" : "border-b border-line py-3"}>
                <div className="flex items-start justify-between gap-3 text-sm">
                  <span className="font-semibold text-ink">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="tabular font-semibold text-ink">₦{baseTotal.toLocaleString()}</span>
                </div>

                {addons.length > 0 && (
                  <div className="mt-1.5 space-y-0.5 pl-2">
                    {addons.map((addon, aIdx) => (
                      <div
                        key={`${item.id}-addon-${addon.addon_option_id ?? "deleted"}-${aIdx}`}
                        className="flex items-center justify-between text-xs text-ink-soft"
                      >
                        <span>
                          + {addon.name}
                          {addon.quantity > 1 ? ` x${addon.quantity}` : ""}
                          {addon.addon_option_id === null ? " (no longer available)" : ""}
                        </span>
                        <span className="tabular">₦{(Number(addon.total_price) || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {item.special_request && (
                  <p className="mt-1.5 text-xs italic text-clay">📝 {item.special_request}</p>
                )}

                {addonsTotal > 0 && (
                  <div className="mt-2 flex items-center justify-between border-t border-line pt-1.5 text-xs">
                    <span className="text-ink-soft">Item total</span>
                    <span className="tabular font-semibold text-brand">
                      ₦{(baseTotal + addonsTotal).toLocaleString()}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

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
                  We couldn&apos;t access your location automatically. Select the area closest to
                  your delivery address instead.
                </p>

                <select
                  value={selectedAreaLabel}
                  onChange={handleAreaSelect}
                  className="input mt-3 w-full"
                >
                  <option value="" disabled>
                    Select your area…
                  </option>
                  {AREA_GROUPS.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.areas.map((area) => (
                        <option key={area.label} value={area.label}>
                          {area.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                {!showAdvancedManual ? (
                  <button
                    type="button"
                    onClick={() => setShowAdvancedManual(true)}
                    className="mt-3 text-xs font-medium text-ink-soft underline hover:text-ink"
                  >
                    Don&apos;t see your area? Enter coordinates manually
                  </button>
                ) : (
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
                )}
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

      {/* The order-level "Notes (optional)" box was removed: the backend no
          longer reads customer_notes. Notes are per item (special_request),
          written on the product details page and sent with each item. */}

      {/* Delivery promotion messages come from the backend. */}
      {promo?.status === "applied" && (
        <div className="mt-8 rounded-2xl border border-brand-deep/20 bg-brand-warm/40 p-4">
          <p className="text-sm font-medium text-brand-deep">🎉 {promo.message || promo.title}</p>
          {promo.description && <p className="mt-1 text-xs text-ink-soft">{promo.description}</p>}
        </div>
      )}
      {promo?.status === "below_minimum" && promo.message && (
        <p className="mt-4 text-xs text-ink-soft">{promo.message}</p>
      )}

      <section className="mt-8 rounded-2xl border border-line bg-bg-raised p-4">
        <Row label="Subtotal" value={quote ? quote.items_subtotal : null} />
        <Row label="Processing fee" value={quote ? quote.processing_fee : null} />
        {deliveryDiscount > 0 ? (
          <div className="flex items-center justify-between py-1 text-sm">
            <span className="text-ink-soft">Delivery fee</span>
            <span className="tabular flex items-center gap-2">
              <s className="text-xs text-ink-soft">₦{standardDeliveryFee.toLocaleString()}</s>
              <span className="font-semibold text-leaf">
                {deliveryCharge <= 0 ? "FREE" : `₦${deliveryCharge.toLocaleString()}`}
              </span>
            </span>
          </div>
        ) : (
          <Row label="Delivery fee" value={quote ? deliveryCharge : feeLoading ? null : null} />
        )}
        {quote && quote.voucher_discount > 0 && <Row label="Voucher discount" value={-quote.voucher_discount} />}
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <span className="font-semibold text-ink">Total</span>
          <span className="tabular font-display text-xl font-semibold text-ink">
            {quote ? `₦${total.toLocaleString()}` : "—"}
          </span>
        </div>
      </section>

      {quoteError && <p className="mt-4 text-sm text-clay">{quoteError}</p>}
      {payError && <p className="mt-4 text-sm text-clay">{payError}</p>}

      <button
        type="button"
        disabled={!readyToPay}
        onClick={() => setShowConfirm(true)}
        className="mt-6 w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft"
      >
        {paying
          ? "Redirecting to payment…"
          : isVendorClosed
            ? "Schedule order"
            : quote
              ? `Pay ₦${total.toLocaleString()}`
              : "Pay"}
      </button>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handlePay}
        address={selectedAddress}
        slot={selectedSlot}
        notes=""
        deliveryFee={deliveryCharge}
        total={total}
        firstOrderDiscount={0}
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
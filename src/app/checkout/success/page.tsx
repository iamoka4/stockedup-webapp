"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { verifyPayment } from "@/lib/api/payments";

type PaymentStatus = "checking" | "success" | "failed";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderParam = searchParams.get("order");
  const reference = searchParams.get("reference");
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<PaymentStatus>(
    orderParam ? "success" : "checking"
  );

  const [orderId, setOrderId] = useState<string | null>(orderParam);

  const [message, setMessage] = useState(
    "Confirming your payment..."
  );

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // If the webhook/redirect already supplied the order ID,
    // the order has already been created successfully.
    if (orderParam) {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      return;
    }

    // Without a Paystack reference, there is nothing we can verify.
    if (!reference) {
      setStatus("failed");
      setMessage(
        "We couldn't find a payment reference for this transaction."
      );

      return;
    }

    /*
     * Paystack can redirect the customer back before our webhook
     * has completely finished creating the order.
     *
     * Therefore we don't verify just once.
     *
     * We retry for up to approximately 60 seconds, giving the
     * webhook enough time to create the order.
     */
    let attempts = 0;
    const MAX_ATTEMPTS = 12;
    const RETRY_DELAY = 5000;

    const checkPayment = async () => {
      if (cancelled) return;

      attempts++;

      try {
        setMessage(
          attempts === 1
            ? "Confirming your payment..."
            : "Finalising your order..."
        );

        const res = await verifyPayment(reference);

        if (cancelled) return;

        /*
         * Successful verification should return the order ID.
         */
        if (res?.order_id) {
          setOrderId(String(res.order_id));
          setStatus("success");

          // The webhook clears the cart server-side.
          queryClient.invalidateQueries({ queryKey: ["cart"] });
          queryClient.invalidateQueries({ queryKey: ["orders"] });

          return;
        }

        /*
         * Payment may already be successful at Paystack while
         * the webhook is still creating the order.
         */
        if (attempts < MAX_ATTEMPTS) {
          timeoutId = setTimeout(checkPayment, RETRY_DELAY);
          return;
        }

        setStatus("failed");
        setMessage(
          "Your payment could not be confirmed yet. If money was deducted, please do not pay again."
        );
      } catch (error) {
        if (cancelled) return;

        /*
         * A temporary verification failure should NOT immediately
         * show "payment failed".
         *
         * The webhook may still be processing.
         */
        if (attempts < MAX_ATTEMPTS) {
          timeoutId = setTimeout(checkPayment, RETRY_DELAY);
          return;
        }

        console.error(
          "[CheckoutSuccess] Payment verification failed:",
          error
        );

        setStatus("failed");
        setMessage(
          "We couldn't confirm your payment yet. If money was deducted, please do not pay again."
        );
      }
    };

    checkPayment();

    return () => {
      cancelled = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [reference, orderParam, queryClient]);

  /*
   * ─────────────────────────────────────────────────────────────
   * CHECKING
   * ─────────────────────────────────────────────────────────────
   */
  if (status === "checking") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <Loader2
          size={48}
          className="mx-auto animate-spin text-brand"
        />

        <h1 className="mt-6 font-display text-2xl font-semibold text-ink">
          Confirming your payment
        </h1>

        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Please wait while we confirm your payment and create your order.
        </p>

        <p className="mt-4 text-xs text-ink-soft">
          Please do not close this page or make another payment.
        </p>
      </div>
    );
  }

  /*
   * ─────────────────────────────────────────────────────────────
   * FAILED / NOT YET CONFIRMED
   * ─────────────────────────────────────────────────────────────
   */
  if (status === "failed") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <XCircle size={48} className="mx-auto text-clay" />

        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          Payment confirmation pending
        </h1>

        <p className="mt-2 text-sm leading-6 text-ink-soft">
          {message}
        </p>

        {reference && (
          <p className="mt-4 break-all text-xs text-ink-soft">
            Payment reference:
            <br />
            <span className="font-medium text-ink">
              {reference}
            </span>
          </p>
        )}

        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/account"
            className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-deep"
          >
            Go to my account
          </Link>

          <Link
            href="/vendors"
            className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink hover:border-ink"
          >
            Keep shopping
          </Link>
        </div>

        <p className="mt-6 text-xs leading-5 text-ink-soft">
          If your account was charged, please do not make another payment.
          Your payment can still be confirmed while the order is being
          processed.
        </p>
      </div>
    );
  }

  /*
   * ─────────────────────────────────────────────────────────────
   * SUCCESS
   * ─────────────────────────────────────────────────────────────
   */
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <CheckCircle2
        size={48}
        className="mx-auto text-leaf"
      />

      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
        Order confirmed!
      </h1>

      {orderId && (
        <p className="tabular mt-2 text-sm text-ink-soft">
          Order{" "}
          <span className="font-medium text-ink">
            #{orderId}
          </span>
        </p>
      )}

      <p className="mt-2 text-sm leading-6 text-ink-soft">
        We&apos;ve emailed you a confirmation. You can track this
        order from your account.
      </p>

      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/account"
          className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-deep"
        >
          View orders
        </Link>

        <Link
          href="/vendors"
          className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink hover:border-ink"
        >
          Keep shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <Loader2
            size={48}
            className="mx-auto animate-spin text-brand"
          />

          <p className="mt-4 text-sm text-ink-soft">
            Loading payment confirmation...
          </p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
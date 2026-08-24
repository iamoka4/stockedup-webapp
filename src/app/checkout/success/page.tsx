"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { verifyPayment } from "@/lib/api/payments";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderParam = searchParams.get("order");
  const reference = searchParams.get("reference");
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<"checking" | "success" | "failed">(
    orderParam ? "success" : "checking"
  );
  const [orderId, setOrderId] = useState<string | null>(orderParam);

  useEffect(() => {
    if (orderParam) {
      // Cart was cleared server-side on order creation.
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      return;
    }
    if (!reference) {
      // This is the terminal branch (no order param, no reference to
      // verify), so there's genuinely nothing to subscribe to instead.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("failed");
      return;
    }
    verifyPayment(reference)
      .then((res) => {
        setOrderId(res.order_id);
        setStatus("success");
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      })
      .catch(() => setStatus("failed"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, orderParam]);

  if (status === "checking") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-ink-soft">
        Confirming your payment…
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <XCircle size={48} className="mx-auto text-clay" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          We couldn&apos;t confirm your payment
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          If money left your account, it will be reflected shortly. Contact support with your
          reference if this doesn&apos;t resolve in a few minutes.
        </p>
        <Link href="/account" className="mt-6 inline-block text-sm font-medium text-brand-deep">
          Go to your account
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <CheckCircle2 size={48} className="mx-auto text-leaf" />
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Order confirmed!</h1>
      {orderId && (
        <p className="tabular mt-2 text-sm text-ink-soft">
          Order <span className="font-medium text-ink">#{orderId}</span>
        </p>
      )}
      <p className="mt-2 text-sm text-ink-soft">
        We&apos;ve emailed you a confirmation. You can track this order from your account.
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
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}

"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getOrders } from "@/lib/api/orders";
import { StampBadge } from "@/components/StampBadge";
import { statusTone } from "@/lib/checkout/orderStatus";

/**
 * Deliberately reuses get-orders.php's list response (which already
 * includes full line items per order) instead of calling
 * get-order-by-id.php directly — that endpoint exists but its response
 * shape (getOrderById() in OrderController.php) hasn't been audited yet.
 * Once that's confirmed, swapping this to a direct single-order fetch is a
 * quick change: replace the useQuery below with a dedicated
 * getOrderById(order_uid) call. For now this works correctly and avoids
 * shipping against a guessed contract.
 */
export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace(`/login?next=/account/orders/${uid}`);
  }, [authLoading, user, router, uid]);

  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    enabled: !!user,
  });

  if (authLoading || !user) return null;

  const order = data?.orders.find((o) => o.order_uid === uid);

  if (isLoading) {
    return <div className="mx-auto max-w-lg px-4 py-16 text-ink-soft">Loading order…</div>;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-ink-soft">We couldn&apos;t find that order.</p>
        <Link href="/account/orders" className="mt-3 inline-block text-sm font-medium text-brand-deep">
          Back to order history
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link
        href="/account/orders"
        className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to order history
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="tabular font-display text-2xl font-semibold text-ink">
            {order.order_uid}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">{order.date}</p>
        </div>
        <StampBadge tone={statusTone(order.status)}>{order.status}</StampBadge>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-line bg-bg-raised p-4">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-brand-tint">
          {order.shop_logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={order.shop_logo} alt={order.store_name} className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-ink">{order.store_name}</p>
          <p className="text-xs text-ink-soft">Delivered to: {order.shipping_address}</p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Items</h2>
        <div className="flex flex-col gap-2">
          {order.items.map((item) => (
            <div
              key={item.product_id}
              className="flex items-center gap-3 rounded-xl border border-line bg-bg-raised p-3"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-brand-tint">
                {item.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-ink">{item.name}</p>
                <p className="tabular text-xs text-ink-soft">
                  {item.quantity} × ₦{item.price.toLocaleString()}
                </p>
              </div>
              <span className="tabular text-sm font-medium text-ink">
                ₦{(item.quantity * item.price).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {order.customer_notes && (
        <div className="mt-6">
          <h2 className="mb-2 font-display text-lg font-semibold text-ink">Your note</h2>
          <p className="rounded-xl border border-line bg-bg-raised p-3 text-sm text-ink-soft">
            {order.customer_notes}
          </p>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-line bg-bg-raised p-4">
        <Row label="Subtotal" value={order.subtotal} />
        <Row label="Processing fee" value={order.processing_fee} />
        <Row label="Delivery fee" value={order.delivery_fee} />
        <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
          <span className="font-semibold text-ink">Total</span>
          <span className="tabular font-display text-lg font-semibold text-ink">
            ₦{order.total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-ink-soft">{label}</span>
      <span className="tabular text-ink">₦{value.toLocaleString()}</span>
    </div>
  );
}

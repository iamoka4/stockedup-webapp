"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getOrders } from "@/lib/api/orders";
import { StampBadge } from "@/components/StampBadge";
import { statusTone } from "@/lib/checkout/orderStatus";

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?next=/account/orders");
  }, [authLoading, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    enabled: !!user,
  });

  if (authLoading || !user) return null;

  const orders = data?.orders ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/account" className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size={16} /> Back to account
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">Order history</h1>

      {isLoading && <p className="mt-6 text-sm text-ink-soft">Loading your orders…</p>}

      {!isLoading && orders.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-ink-soft">You haven&apos;t placed any orders yet.</p>
          <Link href="/vendors" className="mt-3 inline-block text-sm font-medium text-brand-deep">
            Start shopping
          </Link>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {orders.map((order) => (
          <Link
            key={order.order_uid}
            href={`/account/orders/${order.order_uid}`}
            className="flex items-center gap-3 rounded-2xl border border-line bg-bg-raised p-4"
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-brand-tint">
              {order.shop_logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={order.shop_logo} alt={order.store_name} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-medium text-ink">{order.store_name}</p>
              <p className="tabular text-xs text-ink-soft">
                {order.order_uid} · {order.date}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="tabular text-sm font-semibold text-ink">
                ₦{order.total.toLocaleString()}
              </span>
              <StampBadge tone={statusTone(order.status)}>{order.status}</StampBadge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

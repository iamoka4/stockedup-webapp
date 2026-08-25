"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCart } from "@/lib/hooks/useCart";
import { updateCartItem } from "@/lib/api/cart";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAuthModalStore } from "@/store/authModalStore";
import type { CartItem } from "@/lib/api/types";

export default function CartPage() {
  const { data: cart, isLoading } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const openLogin = useAuthModalStore((s) => s.openLogin);

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-ink-soft">Loading your cart…</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Your cart is empty</h1>
        <p className="mt-2 text-ink-soft">Add something fresh from a vendor near you.</p>
        <Link
          href="/vendors"
          className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-deep"
        >
          Browse vendors
        </Link>
      </div>
    );
  }

  function handleCheckout() {
    // Checkout requires an account — matches the product decision that
    // guests can browse and cart, but must register/login to place an
    // order. Cart is preserved: login.php/register.php merge the guest
    // cart into the account automatically once they sign in.
    if (user) {
      router.push("/checkout");
    } else {
      openLogin("/checkout");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Your cart</h1>

      <div className="mt-6 flex flex-col gap-4">
        {cart.items.map((item) => (
          <CartRow key={item.product_id} item={item} />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
        <span className="text-ink-soft">Subtotal</span>
        <span className="tabular font-display text-2xl font-semibold text-ink">
          ₦{cart.subtotal.toLocaleString()}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-soft">
        Delivery fee and any processing fee are calculated at checkout.
      </p>

      <button
        type="button"
        onClick={handleCheckout}
        className="mt-6 w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white hover:bg-brand-deep"
      >
        {user ? "Proceed to checkout" : "Sign in to check out"}
      </button>
    </div>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (quantity: number) => updateCartItem(item.product_id, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-bg-raised p-3">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-tint">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium text-ink">{item.name}</p>
        <p className="tabular text-sm text-ink-soft">₦{item.price.toLocaleString()}</p>
      </div>
      <div className="flex items-center rounded-full border border-line">
        <button
          type="button"
          onClick={() => mutation.mutate(Math.max(0, item.quantity - 1))}
          className="flex h-8 w-8 items-center justify-center text-ink-soft hover:text-ink"
          aria-label="Decrease quantity"
        >
          <Minus size={14} />
        </button>
        <span className="tabular w-6 text-center text-sm">{item.quantity}</span>
        <button
          type="button"
          onClick={() => mutation.mutate(Math.min(25, item.quantity + 1))}
          className="flex h-8 w-8 items-center justify-center text-ink-soft hover:text-ink"
          aria-label="Increase quantity"
        >
          <Plus size={14} />
        </button>
      </div>
      <button
        type="button"
        onClick={() => mutation.mutate(0)}
        aria-label={`Remove ${item.name} from cart`}
        className="text-ink-soft hover:text-clay"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart } from "@/lib/api/cart";
import type { AddonGroup, AddonOption, SelectedAddon } from "@/lib/api/types";

// Change this if your cart route is different.
const CART_HREF = "/cart";
const DEFAULT_MAX_QTY = 25;

// groupId -> optionId -> quantity
type Selections = Record<number, Record<number, number>>;

const formatPrice = (n: number) => "₦" + n.toLocaleString("en-NG");

interface Props {
  productId: number;
  inStock: boolean;
  price: number;
  stock?: number;
  addonGroups?: AddonGroup[];
}

export function AddToCartPanel({
  productId,
  inStock,
  price,
  stock,
  addonGroups = [],
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Selections>({});
  const [specialRequest, setSpecialRequest] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const maxQty = typeof stock === "number" && stock > 0 ? stock : DEFAULT_MAX_QTY;

  // ── Selection helpers ────────────────────────────────────────────────────
  const selectedCount = (groupId: number) =>
    Object.keys(selections[groupId] ?? {}).length;

  const setGroup = (groupId: number, next: Record<number, number>) => {
    setFormError(null);
    setSelections((prev) => {
      const copy = { ...prev };
      if (Object.keys(next).length === 0) delete copy[groupId];
      else copy[groupId] = next;
      return copy;
    });
  };

  const isSingleSelect = (group: AddonGroup) => group.max_selections === 1;

  const toggleSingle = (group: AddonGroup, optionId: number) => {
    if (selections[group.id]?.[optionId]) {
      if (group.is_required) return; // required groups can't be cleared
      setGroup(group.id, {});
      return;
    }
    setGroup(group.id, { [optionId]: 1 });
  };

  const toggleMulti = (group: AddonGroup, optionId: number) => {
    const current = { ...(selections[group.id] ?? {}) };
    if (current[optionId]) {
      delete current[optionId];
    } else {
      if (Object.keys(current).length >= group.max_selections) {
        setFormError(
          `You can select up to ${group.max_selections} option(s) for "${group.name}".`
        );
        return;
      }
      current[optionId] = 1;
    }
    setGroup(group.id, current);
  };

  const changeOptionQty = (group: AddonGroup, option: AddonOption, delta: number) => {
    const current = { ...(selections[group.id] ?? {}) };
    const nextQty = Math.min(
      Math.max((current[option.id] ?? 0) + delta, 0),
      option.max_quantity
    );
    if (nextQty <= 0) delete current[option.id];
    else current[option.id] = nextQty;
    setGroup(group.id, current);
  };

  // ── Live totals ──────────────────────────────────────────────────────────
  const addonsTotal = useMemo(() => {
    let total = 0;
    for (const group of addonGroups) {
      const groupSel = selections[group.id];
      if (!groupSel) continue;
      for (const opt of group.options) {
        total += Number(opt.price) * (groupSel[opt.id] ?? 0);
      }
    }
    return total;
  }, [selections, addonGroups]);

  const subtotal = Number(price) * quantity;
  const grandTotal = subtotal + addonsTotal;

  // ── Validation (same rules as the mobile app) ────────────────────────────
  const validationError = useMemo(() => {
    for (const group of addonGroups) {
      const count = Object.keys(selections[group.id] ?? {}).length;
      if (group.is_required && count < 1) {
        return `Please make a selection for "${group.name}".`;
      }
      if (count < group.min_selections) {
        return `Please select at least ${group.min_selections} option(s) for "${group.name}".`;
      }
      if (count > group.max_selections) {
        return `You can select at most ${group.max_selections} option(s) for "${group.name}".`;
      }
    }
    return null;
  }, [addonGroups, selections]);

  const buildAddonsPayload = (): SelectedAddon[] => {
    const payload: SelectedAddon[] = [];
    for (const groupId of Object.keys(selections)) {
      const groupSel = selections[Number(groupId)];
      for (const optionId of Object.keys(groupSel)) {
        payload.push({
          addon_option_id: Number(optionId),
          quantity: groupSel[Number(optionId)],
        });
      }
    }
    return payload;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (_vars: { buyNow: boolean }) =>
      addToCart(productId, quantity, {
        addons: buildAddonsPayload(),
        special_request: specialRequest.trim() || undefined,
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      if (vars.buyNow) {
        // Only navigate once the item is really in the cart.
        router.push(CART_HREF);
        return;
      }
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2500);
    },
  });

  const submit = (buyNow: boolean) => {
    if (!inStock) return;
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);
    mutation.mutate({ buyNow });
  };

  const serverError = mutation.isError
    ? mutation.error instanceof Error
      ? mutation.error.message
      : "Something went wrong. Please try again."
    : null;
  const errorMessage = formError ?? serverError;

  const disabled = !inStock || mutation.isPending;

  return (
    <div className="mt-6 space-y-6">
      {/* Extras / Add-ons */}
      {addonGroups.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-base font-semibold text-ink">
            Extras / Add-ons
          </h2>
          <div className="space-y-4">
            {addonGroups.map((group) => {
              const single = isSingleSelect(group);
              const count = selectedCount(group.id);

              return (
                <div
                  key={group.id}
                  role="group"
                  aria-label={group.name}
                  className="rounded-2xl border border-line bg-bg-raised p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">{group.name}</p>
                    <p className="text-xs text-ink-soft">
                      {group.is_required
                        ? single
                          ? "Required"
                          : `Choose ${group.min_selections}–${group.max_selections}`
                        : single
                          ? "Optional"
                          : `Choose up to ${group.max_selections}`}
                    </p>
                  </div>

                  <div className="divide-y divide-line">
                    {group.options.map((opt) => {
                      const qty = selections[group.id]?.[opt.id] ?? 0;
                      const selected = qty > 0;
                      const showStepper = group.allow_multiple_quantity && selected;

                      return (
                        <div
                          key={opt.id}
                          className="flex items-center justify-between gap-3 py-2.5"
                        >
                          <button
                            type="button"
                            role={single ? "radio" : "checkbox"}
                            aria-checked={selected}
                            onClick={() =>
                              single
                                ? toggleSingle(group, opt.id)
                                : toggleMulti(group, opt.id)
                            }
                            className="flex flex-1 items-center gap-3 text-left"
                          >
                            <span
                              className={[
                                "flex h-5 w-5 shrink-0 items-center justify-center border-[1.5px]",
                                single ? "rounded-full" : "rounded-md",
                                selected ? "border-brand" : "border-line",
                                selected && !single ? "bg-brand" : "",
                              ].join(" ")}
                            >
                              {selected && single && (
                                <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                              )}
                              {selected && !single && (
                                <Check size={12} className="text-white" strokeWidth={3} />
                              )}
                            </span>
                            <span className="text-sm text-ink">{opt.name}</span>
                          </button>

                          <div className="flex items-center gap-3">
                            {showStepper && (
                              <div className="flex items-center gap-1 rounded-lg bg-brand-tint px-1 py-0.5">
                                <button
                                  type="button"
                                  onClick={() => changeOptionQty(group, opt, -1)}
                                  className="p-1 text-brand-deep"
                                  aria-label={`Decrease ${opt.name}`}
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="tabular min-w-4 text-center text-xs font-semibold text-ink">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  disabled={qty >= opt.max_quantity}
                                  onClick={() => changeOptionQty(group, opt, 1)}
                                  className="p-1 text-brand-deep disabled:opacity-40"
                                  aria-label={`Increase ${opt.name}`}
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            )}
                            <span className="tabular text-sm font-semibold text-brand-deep">
                              +{formatPrice(Number(opt.price))}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {group.max_selections > 1 && !group.allow_multiple_quantity && (
                    <p className="mt-2 text-right text-xs text-ink-soft">
                      {count}/{group.max_selections} selected
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Special request */}
      <section>
        <label
          htmlFor="special-request"
          className="mb-2 block font-display text-base font-semibold text-ink"
        >
          Special request (optional)
        </label>
        <textarea
          id="special-request"
          value={specialRequest}
          onChange={(e) => setSpecialRequest(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder='e.g. "Please make it very spicy" or "No onions"'
          className="w-full resize-none rounded-2xl border border-line bg-bg-raised p-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none"
        />
        <p className="mt-1 text-xs text-ink-soft">
          This is a free-text note — it doesn&apos;t change the price.
        </p>
      </section>

      {/* Quantity + totals */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center rounded-full border border-line">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="flex h-10 w-10 items-center justify-center text-ink-soft hover:text-ink disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="tabular w-8 text-center text-sm font-medium">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              disabled={quantity >= maxQty}
              className="flex h-10 w-10 items-center justify-center text-ink-soft hover:text-ink disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
          <p className="text-xs text-ink-soft">
            Max: {maxQty} unit{maxQty !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="space-y-1 text-sm">
          {addonGroups.length > 0 && (
            <>
              <div className="flex justify-between text-ink-soft">
                <span>Subtotal</span>
                <span className="tabular">{formatPrice(subtotal)}</span>
              </div>
              {addonsTotal > 0 && (
                <div className="flex justify-between text-ink-soft">
                  <span>Extras</span>
                  <span className="tabular">{formatPrice(addonsTotal)}</span>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between font-semibold text-ink">
            <span>Total</span>
            <span className="tabular font-display text-lg">{formatPrice(grandTotal)}</span>
          </div>
        </div>
      </section>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-xl border border-line bg-brand-tint px-3 py-2 text-sm text-ink"
        >
          {errorMessage}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => submit(false)}
          className="flex-1 rounded-full border border-brand px-6 py-3 text-sm font-semibold text-brand-deep transition-colors hover:bg-brand-tint disabled:cursor-not-allowed disabled:border-line disabled:text-ink-soft"
        >
          {mutation.isPending && !mutation.variables?.buyNow
            ? "Adding…"
            : justAdded
              ? "Added to cart ✓"
              : "Add to cart"}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => submit(true)}
          className="flex-[1.4] rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft"
        >
          {!inStock
            ? "Out of stock"
            : mutation.isPending && mutation.variables?.buyNow
              ? "Please wait…"
              : `Buy now — ${formatPrice(grandTotal)}`}
        </button>
      </div>
    </div>
  );
}
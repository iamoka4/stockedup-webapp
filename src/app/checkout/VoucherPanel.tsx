"use client";

import { useState } from "react";
import { Tag, X, Check } from "lucide-react";
import { applyVoucher } from "@/lib/api/vouchers";
import { ApiError } from "@/lib/api/client";

interface Props {
  subtotal: number;
  appliedCode: string | null;
  discount: number;
  onApply: (code: string, discount: number) => void;
  onRemove: () => void;
}

export function VoucherPanel({ subtotal, appliedCode, discount, onApply, onRemove }: Props) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    if (!code.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await applyVoucher(code.trim().toUpperCase(), subtotal);
      onApply(code.trim().toUpperCase(), result.discount_amount);
      setCode("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't apply that code.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Tag size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter voucher code"
            className="input w-full pl-10 uppercase placeholder:normal-case"
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          disabled={!code.trim() || submitting}
          className="shrink-0 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Applying…" : "Apply"}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-clay">{error}</p>}

      {appliedCode && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-leaf/10 px-3.5 py-2.5">
          <span className="flex items-center gap-1.5 text-sm text-leaf">
            <Check size={15} />
            Code <strong>{appliedCode}</strong> applied (-₦{discount.toLocaleString("en-NG")})
          </span>
          <button type="button" onClick={onRemove} className="text-clay hover:opacity-70">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
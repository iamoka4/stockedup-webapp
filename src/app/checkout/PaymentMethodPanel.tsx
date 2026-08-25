"use client";

import { Wallet, CreditCard, Check } from "lucide-react";

export type PaymentMethod = "paystack" | "wallet";

interface Props {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  walletBalance: number;
}

export function PaymentMethodPanel({ selected, onSelect, walletBalance }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <MethodOption
        id="paystack"
        icon={<CreditCard size={20} />}
        label="Paystack"
        subtitle="Debit/credit cards, bank transfer, USSD"
        selected={selected === "paystack"}
        onSelect={() => onSelect("paystack")}
      />
      <MethodOption
        id="wallet"
        icon={<Wallet size={20} />}
        label="StockedUp Wallet"
        subtitle={`Available: ₦${walletBalance.toLocaleString("en-NG")}`}
        selected={selected === "wallet"}
        onSelect={() => onSelect("wallet")}
      />
    </div>
  );
}

function MethodOption({
  icon,
  label,
  subtitle,
  selected,
  onSelect,
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
        selected ? "border-brand-deep bg-brand-warm/40" : "border-line bg-bg-raised hover:border-brand"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          selected ? "bg-brand-deep text-white" : "bg-ink/5 text-ink-soft"
        }`}
      >
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="block text-xs text-ink-soft">{subtitle}</span>
      </span>
      {selected && <Check size={18} className="text-brand-deep" />}
    </button>
  );
}
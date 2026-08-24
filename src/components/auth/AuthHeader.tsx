import { ShoppingCart } from "lucide-react";

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full border-[3px] border-brand-tint bg-brand-tint">
        <ShoppingCart size={44} className="text-brand" strokeWidth={1.75} />
      </div>
      <h1 className="mt-5 font-display text-3xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">{subtitle}</p>
    </div>
  );
}

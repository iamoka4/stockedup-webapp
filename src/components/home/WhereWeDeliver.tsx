import Link from "next/link";
import { DEFAULT_CITY } from "@/lib/config";

export function WhereWeDeliver() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col items-center gap-5 rounded-4xl border border-line bg-bg-raised px-6 py-10 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Where we deliver
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="stamp text-leaf">Live · {DEFAULT_CITY}</span>
          <span className="stamp text-ink-soft">More areas coming soon</span>
        </div>
        <p className="max-w-md text-ink-soft">
          We&apos;re growing city by city. Want StockedUp in your area?
        </p>
        <Link href="/contact" className="font-bold text-brand-deep hover:underline">
          Tell us where
        </Link>
      </div>
    </section>
  );
}
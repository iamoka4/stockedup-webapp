"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles, ShoppingBag } from "lucide-react";

const SLIDES = [
  {
    icon: Sparkles,
    title: "₦500 off your first order",
    body: "Automatically applied at checkout on orders over ₦3,000. No code needed.",
    href: "/vendors",
    cta: "Start shopping",
    bg: "bg-brand",
  },
  {
    icon: ShoppingBag,
    title: "Shop now, sign in later",
    body: "Browse and add to cart without an account — you'll only need to sign in to check out.",
    href: "/categories",
    cta: "Browse categories",
    bg: "bg-brand-deep",
  },
];

export function PromoBanner() {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  if (dismissed) return null;
  const slide = SLIDES[index];
  const Icon = slide.icon;

  return (
    <div className={`relative overflow-hidden rounded-3xl ${slide.bg} text-white`}>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full border-2 border-dashed border-white/15"
      />
      <div className="relative flex flex-col items-start gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <Icon size={22} />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold sm:text-2xl">{slide.title}</h2>
            <p className="mt-1 max-w-md text-sm text-white/80">{slide.body}</p>
          </div>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Link
            href={slide.href}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:bg-white/90"
          >
            {slide.cta}
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
      >
        <X size={14} />
      </button>

      <div className="relative flex justify-center gap-1.5 pb-4">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-white" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
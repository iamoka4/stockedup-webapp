"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Category } from "@/lib/api/types";
import { slugify } from "@/lib/utils/slug";

const PALETTE = [
  { bg: "var(--brand-tint)", border: "var(--brand)" },
  { bg: "var(--leaf-tint)", border: "var(--leaf)" },
  { bg: "var(--indigo-tint)", border: "var(--indigo)" },
  { bg: "var(--clay-tint)", border: "var(--clay)" },
];

export function CategoryScroller({ categories }: { categories: Category[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(amount: number) {
    scrollerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((cat, i) => {
          const color = PALETTE[i % PALETTE.length];
          return (
            <Link
              key={cat.id}
              href={`/categories/${slugify(cat.name)}`}
              className="flex w-40 shrink-0 flex-col gap-3 rounded-2xl border p-4 transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: color.bg, borderColor: color.border }}
            >
              <div className="h-16 w-16 overflow-hidden rounded-xl border border-white/60 bg-white/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-ink">{cat.name}</p>
                {cat.sub_categories && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-ink-soft">{cat.sub_categories}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(-320)}
        aria-label="Scroll categories left"
        className="absolute -left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg-raised shadow-sm hover:border-ink md:flex"
      >
        <ChevronLeft size={17} />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(320)}
        aria-label="Scroll categories right"
        className="absolute -right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg-raised shadow-sm hover:border-ink md:flex"
      >
        <ChevronRight size={17} />
      </button>
    </div>
  );
}
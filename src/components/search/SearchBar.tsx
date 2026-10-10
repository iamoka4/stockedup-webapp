"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { MAX_SEARCH_LENGTH, MIN_SEARCH_LENGTH } from "@/lib/api/products";

interface Props {
  /** Pre-fills the box (used on the results page so people can refine). */
  defaultValue?: string;
  /** Pass the selected city if the site has one; otherwise the server default is used. */
  city?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({ defaultValue = "", city, className = "", autoFocus }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim().slice(0, MAX_SEARCH_LENGTH);
    if (q.length < MIN_SEARCH_LENGTH) return;
    const params = new URLSearchParams({ q });
    if (city) params.set("city", city);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form role="search" onSubmit={onSubmit} className={className}>
      <label htmlFor="site-search" className="sr-only">
        Search meals, groceries and vendors
      </label>
      <div className="flex items-center gap-2 rounded-full border border-line bg-bg-raised px-4 py-2 focus-within:border-brand">
        <Search size={16} className="shrink-0 text-ink-soft" aria-hidden />
        <input
          id="site-search"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX_SEARCH_LENGTH))}
          placeholder="Search meals, groceries, vendors…"
          autoFocus={autoFocus}
          enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none"
        />
      </div>
    </form>
  );
}
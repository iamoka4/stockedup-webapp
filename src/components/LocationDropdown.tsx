"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";
import { useUiStore } from "@/store/uiStore";
import { SUPPORTED_CITIES, cityLabel } from "@/lib/cities";

export function LocationDropdown({ compact = false }: { compact?: boolean }) {
  const city = useUiStore((s) => s.city);
  const setCity = useUiStore((s) => s.setCity);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          compact
            ? "flex items-center gap-1.5 text-xs text-ink-soft"
            : "flex items-center gap-1.5 rounded-full border border-line bg-bg-raised px-3 py-2 text-sm text-ink-soft hover:border-ink"
        }
        aria-label="Change delivery city"
        aria-expanded={open}
      >
        <MapPin size={compact ? 14 : 15} className="text-brand" />
        {compact && <span>Delivering to</span>}
        <span className="font-medium text-ink">{cityLabel(city)}</span>
        <ChevronDown size={compact ? 12 : 14} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 max-h-80 w-56 overflow-y-auto rounded-2xl border border-line bg-bg-raised p-1.5 shadow-lg">
          {SUPPORTED_CITIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => {
                setCity(c.value);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-brand-tint"
            >
              <span className={c.value === city ? "font-semibold text-ink" : "text-ink"}>
                {c.label}
              </span>
              {c.value === city && <Check size={15} className="text-brand" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
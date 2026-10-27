"use client";

import { useTheme } from "@/components/ThemeProvider";
import type { ThemePreference } from "@/lib/theme";

const OPTIONS: { value: ThemePreference; label: string; hint: string }[] = [
  { value: "light", label: "Light", hint: "Always use the light theme" },
  { value: "dark", label: "Dark", hint: "Always use the dark theme" },
  { value: "system", label: "System", hint: "Match your device setting" },
];

export function ThemeSelector() {
  const { preference, ready, setPreference } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Appearance"
      className="inline-flex rounded-xl border border-line bg-bg-raised p-1"
    >
      {OPTIONS.map((opt) => {
        const selected = ready && preference === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            title={opt.hint}
            onClick={() => setPreference(opt.value)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              selected
                ? "bg-brand text-white"
                : "text-ink-soft hover:bg-bg hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
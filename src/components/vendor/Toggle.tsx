"use client";

export function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors disabled:opacity-60 ${
        checked ? "bg-brand/50" : "bg-[#ddd]"
      }`}
    >
      <span
        className={`absolute top-0.5 size-[22px] rounded-full shadow transition-all ${
          checked ? "left-[22px] bg-brand" : "left-0.5 bg-[#f4f3f4]"
        }`}
      />
    </button>
  );
}
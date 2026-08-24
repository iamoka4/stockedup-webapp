import { clsx } from "clsx";

type Tone = "brand" | "leaf" | "indigo" | "clay" | "ink";

const toneClasses: Record<Tone, string> = {
  brand: "text-brand-deep bg-brand-tint",
  leaf: "text-leaf bg-leaf-tint",
  indigo: "text-indigo bg-indigo-tint",
  clay: "text-clay bg-clay-tint",
  ink: "text-ink bg-white",
};

export function StampBadge({
  children,
  tone = "ink",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return <span className={clsx("stamp", toneClasses[tone], className)}>{children}</span>;
}

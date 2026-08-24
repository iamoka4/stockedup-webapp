// components/legal/LegalDocument.tsx
import type { ReactNode } from "react";

export function LegalDocument({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-brand-deep">
        Effective Date: {effectiveDate}
      </p>
      <div className="mt-8 space-y-8">{children}</div>
    </div>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="border-b border-ink/10 pb-2 font-display text-xl font-semibold text-ink">
        {heading}
      </h2>
      <div className="mt-4 space-y-4 text-ink-soft">{children}</div>
    </section>
  );
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5">{children}</ul>;
}
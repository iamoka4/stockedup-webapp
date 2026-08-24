import Link from "next/link";
import { Star, ShieldCheck, Truck } from "lucide-react";

interface Props {
  eyebrow: string;
  heading: string;
  subheading: string;
  children: React.ReactNode;
  /** Register has more fields than login/forgot-password — give it a bit more room on desktop. */
  formWidth?: "sm" | "md";
}

/**
 * Two-column on desktop (branded panel + form), single centered column on
 * mobile (panel hidden, just a compact logo lockup instead). This is the
 * standard shape for a web auth screen — distinct from the mobile app's
 * full-height centered-icon layout, which doesn't translate well to a
 * wide viewport.
 */
export function AuthLayout({ eyebrow, heading, subheading, children, formWidth = "sm" }: Props) {
  return (
    <div className="grid min-h-[calc(100vh-4.5rem)] md:grid-cols-2">
      {/* Branded panel — desktop only */}
      <div className="relative hidden overflow-hidden bg-brand-deep p-12 text-white md:flex md:flex-col md:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border-[3px] border-dashed border-white/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full border-[3px] border-dashed border-white/10"
        />

        <Link href="/" className="relative flex items-center gap-2">
          <span className="stamp border-white/40 text-white">SU</span>
          <span className="font-display text-xl font-semibold">StockedUp</span>
        </Link>

        <div className="relative max-w-md">
          <span className="stamp border-white/40 text-white">{eyebrow}</span>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1]">
            {heading}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/75">{subheading}</p>

          <div className="mt-10 flex flex-col gap-4 text-sm text-white/85">
            <Feature icon={<Truck size={18} />} text="Fast delivery from vendors near you in Awka" />
            <Feature icon={<ShieldCheck size={18} />} text="Secure checkout with Paystack" />
            <Feature icon={<Star size={18} />} text="Rated by real customers you can trust" />
          </div>
        </div>

        <p className="relative text-xs text-white/50">
          © {new Date().getFullYear()} StockedUp Africa
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className={`mx-auto w-full ${formWidth === "md" ? "max-w-md" : "max-w-sm"}`}>
          <Link href="/" className="mb-8 flex items-center gap-2 md:hidden">
            <span className="stamp border-brand text-brand-deep">SU</span>
            <span className="font-display text-lg font-semibold text-ink">StockedUp</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
        {icon}
      </span>
      {text}
    </div>
  );
}

/** Compact page heading used inside the form panel — no giant icon circle. */
export function AuthFormHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>}
    </div>
  );
}
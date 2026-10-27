"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FAQ_CATEGORIES, REFUND_SECTIONS } from "@/lib/vendorSupportContent";

const PHONE = "+2348104436235";
const EMAIL = "vendor-support@stockedup.africa";
const WHATSAPP =
  "https://wa.me/2348104436235?text=Hello%20StockedUp%20Vendor%20Support%2C%20I%20need%20help%20with%20my%20store.";

const FLOW = [
  "Buyer places order on the app",
  "You prepare the order in your shop",
  "Our staff visits your shop to collect it",
  "We repackage it at our office",
  "Delivery agent brings it to the buyer",
];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`size-5 shrink-0 text-gray-400 dark:text-ink-soft transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ContactCard({
  href,
  color,
  title,
  sub,
  external,
}: {
  href: string;
  color: string;
  title: string;
  sub: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="mb-2.5 flex items-center gap-3 rounded-2xl border p-3.5 transition hover:shadow-sm"
      style={{ borderColor: color, backgroundColor: `${color}10` }}
    >
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-lg text-white"
        style={{ backgroundColor: color }}
      >
        {title.startsWith("Call") ? "📞" : title.startsWith("WhatsApp") ? "💬" : "✉️"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-bold text-gray-900 dark:text-ink">{title}</span>
        <span className="block truncate text-xs text-gray-500 dark:text-ink-soft">{sub}</span>
      </span>
    </a>
  );
}

function PolicyItem({ title, content, defaultOpen }: { title: string; content: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="mb-2.5 overflow-hidden rounded-xl border border-line bg-white dark:bg-bg-raised">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <span className="text-sm font-bold text-gray-900 dark:text-ink">{title}</span>
        <Chevron open={open} />
      </button>
      {open && (
        <div className="whitespace-pre-line bg-gray-50 dark:bg-bg px-4 pb-4 pt-2 text-sm leading-6 text-gray-600 dark:text-ink-soft">
          {content}
        </div>
      )}
    </div>
  );
}

function FaqCard({
  label,
  color,
  faqs,
}: {
  label: string;
  color: string;
  faqs: { q: string; a: string }[];
}) {
  const [openQ, setOpenQ] = useState<string | null>(null);
  return (
    <div
      className="mb-3.5 overflow-hidden rounded-2xl border border-line bg-white dark:bg-bg-raised"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <h3 className="border-b border-gray-100 dark:border-line p-4 text-sm font-extrabold" style={{ color }}>
        {label}
      </h3>
      {faqs.map((f, i) => {
        const open = openQ === f.q;
        return (
          <div key={f.q} className={i < faqs.length - 1 ? "border-b border-gray-100 dark:border-line" : ""}>
            <button
              type="button"
              onClick={() => setOpenQ(open ? null : f.q)}
              aria-expanded={open}
              className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left"
            >
              <span className="text-sm font-semibold leading-5 text-gray-900 dark:text-ink">{f.q}</span>
              <Chevron open={open} />
            </button>
            {open && (
              <div className="mx-4 mb-4 whitespace-pre-line rounded-xl bg-gray-50 dark:bg-bg p-3.5 text-sm leading-6 text-gray-600 dark:text-ink-soft">
                {f.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SupportPage() {
  const [tab, setTab] = useState<"policy" | "faq">("policy");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<number | "all">("all");

  const totalFaqs = FAQ_CATEGORIES.reduce((s, c) => s + c.faqs.length, 0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ_CATEGORIES.map((c, idx) => ({
      c,
      idx,
      faqs: c.faqs.filter((f) => !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)),
    })).filter((x) => x.faqs.length > 0 && (cat === "all" || cat === x.idx));
  }, [query, cat]);

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <div className="bg-brand px-5 py-6 text-white">
        <div className="mx-auto max-w-6xl">
          <Link href="/merchants/menu" className="text-xs font-semibold text-white/80 hover:text-white">
            ← Menu
          </Link>
          <h1 className="font-display mt-1 text-3xl font-extrabold">Vendor Support</h1>
          <p className="mt-1 text-sm text-white/80">Policies, FAQs & Help Centre</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[360px_1fr] lg:items-start">
        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="rounded-xl border-l-4 border-brand bg-brand/10 p-3.5 text-[13px] leading-5 text-gray-700 dark:text-ink-soft">
            Vendor support is available Monday – Saturday, 8 am – 8 pm WAT. We respond within 30 minutes.
          </div>

          <div className="rounded-2xl border border-line bg-white dark:bg-bg-raised p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-ink-soft">
              Contact vendor support
            </p>
            <ContactCard href={`tel:${PHONE}`} color="#34C759" title="Call Vendor Support" sub="+234 810 443 6235 — For urgent issues" />
            <ContactCard href={WHATSAPP} external color="#25D366" title="WhatsApp Support" sub="Fastest response — chat with our team" />
            <ContactCard href={`mailto:${EMAIL}`} color="#007AFF" title="Email Vendor Support" sub={EMAIL} />
          </div>

          <div className="rounded-2xl border border-line bg-white dark:bg-bg-raised p-4">
            <p className="mb-3.5 text-sm font-extrabold text-gray-900 dark:text-ink">📦 How Every Order Works</p>
            <ol className="space-y-2.5">
              {FLOW.map((t, i) => (
                <li key={t} className="flex items-center gap-2.5 text-[13px] text-gray-700 dark:text-ink-soft">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-extrabold text-white">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
            <p className="mt-3 rounded-lg bg-red-50 dark:bg-clay-tint p-2.5 text-xs font-semibold leading-4 text-red-500 dark:text-clay">
              You do not contact buyers directly. All buyer communication is handled by our team.
            </p>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0">
          <div className="mb-4 flex flex-wrap gap-2">
            {(
              [
                ["policy", "Refund & Returns Policy"],
                ["faq", `FAQs (${totalFaqs})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                  tab === id
                    ? "border-brand bg-brand text-white"
                    : "border-gray-200 dark:border-line bg-white dark:bg-bg-raised text-gray-600 dark:text-ink-soft hover:border-brand"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "policy" ? (
            <div>
              <span className="mb-3 inline-block rounded-full bg-brand/10 px-3.5 py-1.5 text-xs font-semibold text-brand">
                Effective: 1 January 2026 · Last updated: February 2026
              </span>
              <div className="mb-3 rounded-xl border-l-4 border-brand bg-white dark:bg-bg-raised p-4 text-sm leading-6 text-gray-600 dark:text-ink-soft">
                This policy outlines your rights and responsibilities as a vendor on StockedUp Africa. Our
                team handles all buyer interactions, packaging, and delivery — your core responsibility is
                preparing accurate, quality orders and having them ready for our staff pickup.
              </div>
              {REFUND_SECTIONS.map((s, i) => (
                <PolicyItem key={s.title} title={s.title} content={s.content} defaultOpen={i === 0} />
              ))}
              <div className="mt-2 rounded-2xl border border-line bg-white dark:bg-bg-raised p-6 text-center">
                <p className="text-sm text-gray-600 dark:text-ink-soft">
                  Questions about a specific refund deduction or dispute? Contact our vendor team directly.
                </p>
                <a
                  href={`mailto:${EMAIL}`}
                  className="mt-3 inline-block rounded-xl bg-brand px-7 py-3 text-[15px] font-bold text-white"
                >
                  Email Vendor Support
                </a>
              </div>
            </div>
          ) : (
            <div>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions…"
                className="mb-3 w-full rounded-xl border border-gray-200 dark:border-line bg-white dark:bg-bg-raised px-4 py-3 text-sm outline-none focus:border-brand"
              />
              <div className="mb-4 flex flex-wrap gap-2">
                {(["all", ...FAQ_CATEGORIES.map((_, i) => i)] as (number | "all")[]).map((c) => (
                  <button
                    key={String(c)}
                    type="button"
                    onClick={() => setCat(c)}
                    className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                      cat === c
                        ? "border-brand bg-brand text-white"
                        : "border-gray-200 dark:border-line bg-white dark:bg-bg-raised text-gray-600 dark:text-ink-soft hover:border-brand"
                    }`}
                  >
                    {c === "all" ? "All" : FAQ_CATEGORIES[c].label}
                  </button>
                ))}
              </div>

              {visible.length === 0 ? (
                <div className="py-14 text-center">
                  <p className="text-[17px] font-semibold text-gray-800 dark:text-ink">No matching questions</p>
                  <p className="mt-1.5 text-sm text-gray-400 dark:text-ink-soft">Try different keywords or contact our support team.</p>
                </div>
              ) : (
                visible.map(({ c, faqs }) => <FaqCard key={c.label} label={c.label} color={c.color} faqs={faqs} />)
              )}

              <div className="mt-2 rounded-2xl border border-line bg-white dark:bg-bg-raised p-6 text-center">
                <p className="text-sm text-gray-600 dark:text-ink-soft">
                  Still have a question not covered here? Our vendor support team is ready to help.
                </p>
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block rounded-xl bg-brand px-7 py-3 text-[15px] font-bold text-white"
                >
                  WhatsApp Vendor Support
                </a>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-xl border-l-4 border-brand bg-brand/10 p-3.5 text-[13px] leading-5 text-gray-700 dark:text-ink-soft">
            For disputes about refund deductions, payout issues, or account suspensions, always email {EMAIL}{" "}
            with your Vendor ID for the fastest resolution.
          </div>
        </main>
      </div>
    </div>
  );
}
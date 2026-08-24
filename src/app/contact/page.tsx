// app/contact/page.tsx
import type { Metadata } from "next";
import { MapPin, Headset } from "lucide-react";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
};

const SOCIAL_LINKS = [
  {
    href: "https://x.com/stockedupafrica",
    label: "X (Twitter)",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    href: "https://www.instagram.com/stockedupafrica?igsh=b2txYTJ4NjRud3Zo",
    label: "Instagram",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z",
  },
  {
    href: "https://www.facebook.com/share/17fNxJhgNF/",
    label: "Facebook",
    path: "M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.931-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z",
  },
  {
    href: "https://www.tiktok.com/@stockedupafrica?_r=1&_t=ZS-95wj8J3JmNA",
    label: "TikTok",
    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
          Here to help
        </h1>
        <p className="mt-2 text-ink-soft">
          Our team is always ready to assist you on anything
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-10 text-center sm:grid-cols-3">
        <div>
          <span className="mx-auto mb-3 flex h-9 w-9 items-center justify-center text-ink">
            <MapPin size={28} strokeWidth={1.5} />
          </span>
          <p className="font-semibold text-ink">Find Us At:</p>
          <p className="mt-1 text-sm text-ink-soft">Awka, Anambra, Nigeria</p>
        </div>

        <div>
          <span className="mx-auto mb-3 flex h-9 w-9 items-center justify-center text-ink">
            <Headset size={28} strokeWidth={1.5} />
          </span>
          <p className="font-semibold text-ink">Get In Touch</p>
          <p className="mt-1 text-sm text-ink-soft">Email: hello@stockedup.africa</p>
          <p className="text-sm text-ink-soft">Hot-line: 081-0443-6235</p>
        </div>

        <div>
          <span className="mx-auto mb-3 flex h-9 w-9 items-center justify-center text-ink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="M8.6 10.6l6.8-4.2M8.6 13.4l6.8 4.2" />
            </svg>
          </span>
          <p className="font-semibold text-ink">Stay Connected</p>
          <div className="mt-3 flex items-center justify-center gap-3">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-ink-soft transition-colors hover:bg-brand-deep hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Feedback Or Suggestions?
        </h2>
        <p className="mt-1 text-ink-soft">Let&apos;s hear from you</p>
      </div>

      <div className="mx-auto mt-8 max-w-2xl">
        <ContactForm />
      </div>
    </div>
  );
}
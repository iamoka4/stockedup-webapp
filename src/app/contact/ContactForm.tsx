// components/contact/ContactForm.tsx
"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    // TODO: wire this up to your actual API route / email service
    await new Promise((resolve) => setTimeout(resolve, 800));

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-line bg-bg-raised p-8 text-center">
        <p className="font-medium text-ink">Thanks for reaching out!</p>
        <p className="mt-1 text-sm text-ink-soft">We&apos;ll get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-ink">
          First name <span className="text-red-500">*</span>
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          required
          placeholder="First name here"
          className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand-deep focus:outline-none focus:ring-1 focus:ring-brand-deep"
        />
      </div>

      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-ink">
          Last name <span className="text-red-500">*</span>
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          required
          placeholder="Last name here"
          className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand-deep focus:outline-none focus:ring-1 focus:ring-brand-deep"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand-deep focus:outline-none focus:ring-1 focus:ring-brand-deep"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="message" className="block text-sm font-medium text-ink">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Tell us what's on your mind..."
          className="mt-1.5 w-full resize-none rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand-deep focus:outline-none focus:ring-1 focus:ring-brand-deep"
        />
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto"
        >
          {status === "submitting" ? "Sending..." : "Send message"}
        </button>
      </div>
    </form>
  );
}
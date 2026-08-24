// app/cookies/page.tsx
import type { Metadata } from "next";
import { LegalDocument, LegalSection, LegalList } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Cookie Policy",
};

export default function CookiesPage() {
  return (
    <LegalDocument title="StockedUp Cookie Policy" effectiveDate="24th August, 2026">
      <p className="text-ink-soft">
        This policy explains how StockedUp uses cookies and similar
        technologies on our website.
      </p>

      <LegalSection heading="1. What Are Cookies">
        <p>
          Cookies are small text files stored on your device when you visit a
          website. They help the site function properly and remember
          information about your visit.
        </p>
      </LegalSection>

      <LegalSection heading="2. Types of Cookies We Use">
        <LegalList>
          <li>
            <span className="font-medium text-ink">Essential cookies</span> —
            required for core site functions, such as keeping you signed in
            and processing orders
          </li>
          <li>
            <span className="font-medium text-ink">Functional cookies</span> —
            remember preferences such as your selected delivery location
          </li>
          <li>
            <span className="font-medium text-ink">Analytics cookies</span> —
            help us understand how the site is used so we can improve it
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="3. Managing Cookies">
        <p>
          Most browsers let you control or disable cookies through their
          settings. Blocking essential cookies may affect the site&apos;s
          functionality, including your ability to sign in or place orders.
        </p>
      </LegalSection>

      <LegalSection heading="4. Third-Party Cookies">
        <p>
          Some cookies may be set by third-party services we use, such as
          payment processors or analytics providers. These providers have
          their own cookie and privacy policies.
        </p>
      </LegalSection>

      <LegalSection heading="5. Changes to This Policy">
        <p>We may update this policy from time to time. Changes will be posted on this page.</p>
      </LegalSection>

      <LegalSection heading="6. Contact Us">
        <p>
          Email:{" "}
          <a
            href="mailto:support@stockedup.africa"
            className="font-medium text-brand-deep hover:underline"
          >
            support@stockedup.africa
          </a>
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
// app/return-policy/page.tsx
import type { Metadata } from "next";
import { LegalDocument, LegalSection, LegalList } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Return Policy",
};

export default function ReturnPolicyPage() {
  return (
    <LegalDocument title="StockedUp Return Policy" effectiveDate="4th May, 2026">
      <p className="text-ink-soft">
        At StockedUp, we aim to ensure a smooth and satisfying shopping
        experience.
      </p>

      <LegalSection heading="1. Perishable Goods">
        <p>Due to the nature of food items:</p>
        <LegalList>
          <li>Most items are non-returnable once delivered</li>
          <li>
            Returns are only accepted if items are:
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Damaged</li>
              <li>Spoiled</li>
              <li>Incorrect</li>
            </ul>
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="2. Reporting Issues">
        <p>Customers must report issues:</p>
        <LegalList>
          <li>Within 24 hours of delivery</li>
          <li>With clear photo/video evidence</li>
        </LegalList>
        <p>
          Send complaints to:
          <br />
          <a
            href="mailto:support@stockedup.africa"
            className="font-medium text-brand-deep hover:underline"
          >
            support@stockedup.africa
          </a>
        </p>
      </LegalSection>

      <LegalSection heading="3. Resolution Options">
        <p>If approved, we may:</p>
        <LegalList>
          <li>Replace the item</li>
          <li>Issue a refund (full or partial)</li>
          <li>Provide store credit</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="4. Non-Eligible Cases">
        <p>Returns will not be accepted for:</p>
        <LegalList>
          <li>Change of mind</li>
          <li>Improper storage after delivery</li>
          <li>Minor natural variations (e.g., size, color of produce).</li>
        </LegalList>
      </LegalSection>
    </LegalDocument>
  );
}
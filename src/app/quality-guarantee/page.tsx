// app/quality-guarantee/page.tsx
import type { Metadata } from "next";
import { LegalDocument, LegalSection, LegalList } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Quality Guarantee",
};

export default function QualityGuaranteePage() {
  return (
    <LegalDocument
      title="StockedUp Quality Guarantee"
      effectiveDate="4th May, 2026"
    >
      <p className="text-ink-soft">At StockedUp, quality is non-negotiable.</p>

      <LegalSection heading="1. Vendor Standards">
        <p>All vendors are expected to:</p>
        <LegalList>
          <li>Provide fresh and high-quality foodstuff</li>
          <li>Maintain proper hygiene and storage</li>
          <li>Ensure accurate product descriptions</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="2. Our Commitment">
        <p>We strive to:</p>
        <LegalList>
          <li>Partner only with trusted vendors</li>
          <li>Monitor feedback and performance</li>
          <li>Remove vendors who fail quality standards</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="3. Customer Protection">
        <p>If you receive:</p>
        <LegalList>
          <li>Spoiled items</li>
          <li>Low-quality goods</li>
        </LegalList>
        <p>👉 You are eligible for:</p>
        <LegalList>
          <li>Replacement</li>
          <li>Refund</li>
          <li>Store credit</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="4. Continuous Improvement">
        <p>We actively use customer feedback to improve:</p>
        <LegalList>
          <li>Vendor quality</li>
          <li>Delivery experience</li>
          <li>Product consistency</li>
        </LegalList>
      </LegalSection>
    </LegalDocument>
  );
}
// app/shipping-policy/page.tsx
import type { Metadata } from "next";
import { LegalDocument, LegalSection, LegalList } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Shipping Policy",
};

export default function ShippingPolicyPage() {
  return (
    <LegalDocument
      title="StockedUp Shipping Policy"
      effectiveDate="4th May, 2026"
    >
      <LegalSection heading="1. Delivery Coverage">
        <LegalList>
          <li>Currently available in Awka (initial launch location)</li>
          <li>Expansion to other locations will follow</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="2. Delivery Time">
        <p>Standard delivery: Same day or next day</p>
        <p>Delivery time depends on:</p>
        <LegalList>
          <li>Vendor availability</li>
          <li>Order volume</li>
          <li>Traffic conditions</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="3. Delivery Fees">
        <LegalList>
          <li>Delivery fees are calculated at checkout</li>
          <li>Promotions (e.g., free delivery) may apply</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="4. Failed Deliveries">
        <p>If a delivery fails due to:</p>
        <LegalList>
          <li>Incorrect address</li>
          <li>Customer unavailable</li>
        </LegalList>
        <p>👉 Additional charges may apply for re-delivery</p>
      </LegalSection>

      <LegalSection heading="5. Order Tracking">
        <p>Users will receive updates via:</p>
        <LegalList>
          <li>In-app notifications</li>
          <li>Phone or SMS (if applicable)</li>
        </LegalList>
      </LegalSection>
    </LegalDocument>
  );
}
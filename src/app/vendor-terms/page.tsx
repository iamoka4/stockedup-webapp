// app/vendor-terms/page.tsx
import type { Metadata } from "next";
import { LegalDocument, LegalSection, LegalList } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Vendor Terms & Conditions",
};

export default function VendorTermsPage() {
  return (
    <LegalDocument
      title="StockedUp Vendor Terms & Conditions"
      effectiveDate="23rd June, 2026"
    >
      <p className="text-ink-soft">These terms apply to all vendors on StockedUp.</p>

      <LegalSection heading="1. Vendor Eligibility">
        <p>Vendors must:</p>
        <LegalList>
          <li>Provide valid business/contact details</li>
          <li>Operate within supported locations</li>
          <li>Comply with local regulations</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="2. Product Listing">
        <p>Vendors agree to:</p>
        <LegalList>
          <li>Provide accurate descriptions and pricing</li>
          <li>Upload clear product images</li>
          <li>Keep inventory updated</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="3. Order Fulfillment">
        <p>Vendors must:</p>
        <LegalList>
          <li>Process orders promptly</li>
          <li>Ensure correct packaging</li>
          <li>Maintain product quality</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="4. Pricing & Commission">
        <LegalList>
          <li>Vendors set their own prices</li>
          <li>
            StockedUp does not currently charge vendors a commission on orders.
            Should this change in the future, vendors will be notified and
            these terms will be updated accordingly
          </li>
          <li>
            A processing fee may be charged to buyers at checkout. This fee is
            paid by the buyer and is separate from, and does not reduce, the
            vendor&apos;s earnings on an order
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="5. Vendor Wallet & Earnings">
        <p>
          StockedUp provides each vendor with an in-app wallet to manage their
          earnings. The following terms apply:
        </p>
        <LegalList>
          <li>
            Your earnings from a completed order are credited to your vendor
            wallet once the order is marked as completed on the platform
          </li>
          <li>
            You can request a withdrawal of your available wallet balance to
            your linked bank account at any time, subject to having a valid
            bank account on file
          </li>
          <li>
            Withdrawals are processed via our payment partner. Processing
            times may vary, and StockedUp is working to reduce the time it
            takes for withdrawals to reach your bank account
          </li>
          <li>
            StockedUp is not responsible for delays caused by your bank, your
            payment partner, or incorrect bank account details provided by you
          </li>
          <li>
            StockedUp reserves the right to set minimum withdrawal amounts,
            hold or review withdrawal requests where fraud or error is
            suspected, and to correct your wallet balance in the event of a
            processing error
          </li>
          <li>
            It is your responsibility to keep your bank account details
            accurate and up to date in the app
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="6. Prohibited Activities">
        <p>Vendors must not:</p>
        <LegalList>
          <li>Sell illegal or unsafe products</li>
          <li>Mislead customers</li>
          <li>Cancel orders without valid reason</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="7. Performance Monitoring">
        <p>StockedUp may:</p>
        <LegalList>
          <li>Track vendor ratings</li>
          <li>Suspend or remove underperforming vendors</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="8. Termination">
        <p>StockedUp reserves the right to:</p>
        <LegalList>
          <li>Suspend or terminate vendor accounts at any time for violations</li>
        </LegalList>
        <p>
          If your account is terminated, any available wallet balance will
          remain payable to you, subject to verification, and may be withdrawn
          to your bank account through the normal withdrawal process unless
          termination is due to fraud or violation of these terms.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
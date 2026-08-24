// app/privacy/page.tsx
import type { Metadata } from "next";
import { LegalDocument, LegalSection, LegalList } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="StockedUp Privacy Policy"
      effectiveDate="23rd June, 2026"
    >
      <p className="text-ink-soft">
        StockedUp (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates a
        mobile application that connects users with foodstuff vendors.
      </p>

      <LegalSection heading="1. Information We Collect">
        <p>We may collect:</p>
        <LegalList>
          <li>Personal information (name, phone number, email address)</li>
          <li>Delivery address</li>
          <li>Order details and transaction history</li>
          <li>
            Wallet activity, including funding, spending, and transfers to
            other users
          </li>
          <li>Referral activity, including who referred you and who you have referred</li>
          <li>Device information (IP address, device type)</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="2. How We Use Information">
        <p>We use collected data to:</p>
        <LegalList>
          <li>Process and deliver orders</li>
          <li>Connect users with vendors</li>
          <li>
            Maintain accurate wallet balances and process wallet-based
            payments and transfers
          </li>
          <li>
            Administer the referral program, including verifying eligibility
            and issuing rewards
          </li>
          <li>Detect and prevent fraud or abuse of the wallet and referral features</li>
          <li>Improve app performance and user experience</li>
          <li>Communicate updates, promotions, and support</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="3. Sharing of Information">
        <p>We may share information with:</p>
        <LegalList>
          <li>Vendors to fulfill orders</li>
          <li>Payment processors, to facilitate wallet funding and order payments</li>
          <li>Service providers (e.g., hosting, analytics)</li>
          <li>Legal authorities when required</li>
        </LegalList>
        <p>We do not sell user data.</p>
      </LegalSection>

      <LegalSection heading="4. Data Security">
        <p>
          We implement reasonable security measures to protect your data,
          including wallet balances and transaction records, but no system is
          100% secure.
        </p>
      </LegalSection>

      <LegalSection heading="5. User Rights">
        <p>Users can:</p>
        <LegalList>
          <li>Request access to their data</li>
          <li>Request deletion of their account/data</li>
        </LegalList>
        <p>
          Please note that deleting your account does not entitle you to a
          cash refund of any remaining wallet balance, in line with our Terms
          of Service.
        </p>
      </LegalSection>

      <LegalSection heading="6. Third-Party Services">
        <p>
          We may use third-party tools (e.g., payment processors, analytics
          services) which have their own privacy policies.
        </p>
      </LegalSection>

      <LegalSection heading="7. Children's Privacy">
        <p>Our app is not intended for children under 15.</p>
      </LegalSection>

      <LegalSection heading="8. Changes to This Policy">
        <p>We may update this policy. Changes will be posted in the app.</p>
      </LegalSection>

      <LegalSection heading="9. Contact Us">
        <p>
          Email:{" "}
          <a
            href="mailto:privacy@stockedup.africa"
            className="font-medium text-brand-deep hover:underline"
          >
            privacy@stockedup.africa
          </a>
        </p>
        <p>
          Customer care:{" "}
          <a
            href="tel:08104436235"
            className="font-medium text-brand-deep hover:underline"
          >
            081-0443-6235
          </a>
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
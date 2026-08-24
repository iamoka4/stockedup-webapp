// app/terms/page.tsx
import type { Metadata } from "next";
import { LegalDocument, LegalSection, LegalList } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="StockedUp Terms of Service"
      effectiveDate="23rd June, 2026"
    >
      <p className="text-ink-soft">
        By using StockedUp, you agree to the following terms:
      </p>

      <LegalSection heading="1. Use of Service">
        <p>
          StockedUp connects users with vendors for foodstuff purchases. We do
          not directly sell products.
        </p>
      </LegalSection>

      <LegalSection heading="2. User Responsibilities">
        <p>Users agree to:</p>
        <LegalList>
          <li>Provide accurate information</li>
          <li>Not misuse the platform</li>
          <li>Respect vendors and delivery processes</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="3. Orders & Payments">
        <LegalList>
          <li>Orders placed are subject to vendor availability</li>
          <li>Prices and availability may change</li>
          <li>Payments (if applicable) are processed securely via third parties</li>
          <li>
            A processing fee may apply to orders at checkout. This fee varies
            depending on the size of your order and is always shown to you
            before you confirm payment
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="4. StockedUp Wallet">
        <p>
          StockedUp offers an in-app wallet that users can fund and use to pay
          for orders. The following terms apply to the wallet:
        </p>
        <LegalList>
          <li>
            Funding your wallet is free. There is no fee for adding money to
            your wallet — you will always be credited the exact amount you
            fund
          </li>
          <li>
            Wallet balances can be used to pay for orders on the platform, or
            sent to other StockedUp users via the in-app transfer feature
          </li>
          <li>
            Wallet funds are non-refundable and cannot be withdrawn or
            transferred to a bank account. Funds added to your wallet stay
            within the StockedUp platform and may only be used for payments or
            transfers to other users on StockedUp
          </li>
          <li>
            You are responsible for safeguarding access to your account.
            StockedUp is not liable for wallet transfers made in error or as a
            result of unauthorized account access
          </li>
          <li>
            We may, at our discretion, set minimum or maximum limits on wallet
            funding and transfer amounts
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="5. Referral Program">
        <p>
          StockedUp may offer a referral program that rewards users for
          inviting others to join the platform. The following terms apply:
        </p>
        <LegalList>
          <li>
            Referral rewards, where applicable, are credited to your StockedUp
            wallet and are subject to the wallet terms above
          </li>
          <li>
            Rewards are typically issued once a referred user has completed a
            qualifying action (such as completing their first order), as
            determined by StockedUp
          </li>
          <li>
            StockedUp reserves the right to change, suspend, or end the
            referral program, or to adjust reward amounts and eligibility
            criteria, at any time
          </li>
          <li>
            We reserve the right to withhold or reverse referral rewards in
            cases of suspected fraud, abuse, or violation of these terms,
            including the use of fake accounts or self-referrals
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="6. Vendor Responsibility">
        <p>Vendors are responsible for:</p>
        <LegalList>
          <li>Product quality</li>
          <li>Accurate listings</li>
          <li>Timely fulfillment</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="7. Limitation of Liability">
        <p>StockedUp is not liable for:</p>
        <LegalList>
          <li>Vendor product quality issues</li>
          <li>Delivery delays outside our control</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="8. Account Suspension">
        <p>We may suspend accounts for:</p>
        <LegalList>
          <li>Fraudulent activity</li>
          <li>Abuse of the platform</li>
          <li>Misuse of the wallet or referral program</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="9. Changes to Terms">
        <p>We may update these terms at any time.</p>
      </LegalSection>

      <LegalSection heading="10. Contact">
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
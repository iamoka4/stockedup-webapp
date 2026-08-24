import Link from "next/link";
import { Store, ArrowLeft, Smartphone } from "lucide-react";

export const metadata = { title: "Register as a vendor" };

export default function VendorRegisterPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-20 text-center">
      <Link
        href="/register"
        className="mb-6 flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-tint">
        <Store size={34} className="text-indigo" />
      </div>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
        Vendor registration is on the app for now
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        Web vendor tools — including signing up your store — are coming soon. In the
        meantime, download the StockedUp app to register your store and start selling.
      </p>

      <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-line bg-bg-raised p-4 text-sm text-ink-soft">
        <Smartphone size={18} className="text-brand" />
        Get the StockedUp app from the Play Store to register as a vendor.
      </div>

      <Link href="/vendor/login" className="mt-6 inline-block text-sm font-medium text-brand-deep">
        Already have a vendor account? Sign in
      </Link>
    </div>
  );
}

import Link from "next/link";
import { BackHeader, WalletIcon, type WalletIconName } from "@/components/vendor/wallet-ui";

const SECTIONS: {
  title: string;
  items: { id: string; icon: WalletIconName; bg: string; title: string; subtitle: string; href: string }[];
}[] = [
  {
    title: "Financial",
    items: [
      {
        id: "settlement-reports",
        icon: "file-text",
        bg: "#7c3aed",
        title: "Settlement Reports",
        subtitle: "View your payout settlement history",
        href: "/merchants/wallet/statement",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        id: "bank-account",
        icon: "briefcase",
        bg: "var(--color-brand, #FF7A00)",
        title: "Bank Account",
        subtitle: "Manage your linked bank account",
        href: "/merchants/wallet/bank-account",
      },
    ],
  },
];

export default function WalletSettingsPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-6">
      <BackHeader title="Wallet Settings" backHref="/merchants/wallet" />

      {SECTIONS.map((section) => (
        <div key={section.title} className="mt-6">
          <h2 className="mb-2.5 ml-1 text-xs font-bold uppercase tracking-wide text-gray-400">
            {section.title}
          </h2>
          <div className="space-y-2.5">
            {section.items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm transition hover:border-brand"
              >
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: item.bg }}
                >
                  <WalletIcon name={item.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-0.5 block text-[15px] font-bold text-gray-900">{item.title}</span>
                  <span className="block text-xs text-gray-400">{item.subtitle}</span>
                </span>
                <WalletIcon name="chevron-right" className="size-[18px] text-gray-300" />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
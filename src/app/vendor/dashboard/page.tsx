"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/lib/api/auth";
import { getShopProfile } from "@/lib/api/vendor";

export default function VendorDashboardPage() {
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    getShopProfile()
      .then((p) => setName(p.business_name ?? p.shop_name ?? ""))
      .catch(() => {});
  }, []);

  function handleLogout() {
    logout();
    router.replace("/merchants/login");
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        {name ? `Welcome, ${name}` : "Welcome"}
      </h1>
      <p className="mt-3 text-ink-soft">
        Your shop is set up. Products, orders and wallet are coming next. New shops are reviewed by
        our team within 24–48 hours.
      </p>
      <button
        type="button"
        onClick={handleLogout}
        className="mt-8 rounded-full border border-line px-6 py-3 font-bold transition hover:border-brand"
      >
        Log out
      </button>
    </section>
  );
}
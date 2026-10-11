import type { Metadata } from "next";
import { LoginForm } from "@/components/vendor/LoginForm";

export const metadata: Metadata = {
  title: "Merchant login",
  robots: { index: false, follow: false },
};

export default function MerchantLoginPage() {
  return <LoginForm />;
}
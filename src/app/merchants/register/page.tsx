import type { Metadata } from "next";
import { RegisterForm } from "@/components/vendor/RegisterForm";

export const metadata: Metadata = {
  title: "Become a Merchant",
  description: "Create your StockedUp merchant account and start selling online.",
};

export default function MerchantRegisterPage() {
  return <RegisterForm />;
}
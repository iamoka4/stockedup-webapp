"use client";

import { useEffect } from "react";
import { saveVendorRef } from "@/lib/vendorRef";

/** Renders nothing. Saves ?ref=CODE from the URL so sign-up can credit the vendor. */
export default function VendorRefCapture() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    saveVendorRef(ref);
  }, []);

  return null;
}
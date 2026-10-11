"use client";

import { useEffect, useState } from "react";
import { tokenStore } from "@/lib/auth/tokenStore";

/** "loading" until we've read localStorage on the client. */
export type VendorSessionState = "loading" | "vendor" | "none";

export function useVendorSession(): VendorSessionState {
  const [state, setState] = useState<VendorSessionState>("loading");

  useEffect(() => {
    const sync = () => {
      setState(
        tokenStore.isLoggedIn() && tokenStore.getRole() === "vendor" ? "vendor" : "none"
      );
    };
    sync();
    window.addEventListener("storage", sync); // logout/login in another tab
    return () => window.removeEventListener("storage", sync);
  }, []);

  return state;
}
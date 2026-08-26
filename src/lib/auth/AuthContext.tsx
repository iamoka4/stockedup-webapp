"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { tokenStore } from "./tokenStore";
import { refreshSession, logout as apiLogout } from "@/lib/api/auth";
import type { AuthUser } from "@/lib/api/types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (u: AuthUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_CACHE_KEY = "stockedup_user_cache";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
    if (typeof window !== "undefined") {
      if (u) window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u));
      else window.localStorage.removeItem(USER_CACHE_KEY);
    }
  }, []);

  useEffect(() => {
    // Restore the cached user shell immediately (avoids a logged-out flash),
    // then validate the session in the background via refresh-token.php.
    const cached = typeof window !== "undefined" ? window.localStorage.getItem(USER_CACHE_KEY) : null;
    if (cached) {
      try {
        // Syncing React state from localStorage on mount is exactly what
        // this effect is for; there's no external subscription to attach
        // this to instead.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserState(JSON.parse(cached));
      } catch {
        /* ignore corrupt cache */
      }
    }

    if (tokenStore.getRefreshToken()) {
      refreshSession()
        .then((ok) => {
          if (!ok) setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      // No refresh token means there's no real session to validate — any
      // cached user shell restored above is stale and must not be trusted.
      // Previously this branch just set isLoading false and left the
      // optimistic cache in place untouched, which let a user appear
      // permanently "logged in" in the header with zero real tokens behind
      // it once tokenStore.clear() ran elsewhere but this cache didn't.
      setUser(null);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
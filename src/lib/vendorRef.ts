const KEY = "su_vendor_ref";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // keep the vendor link code for 30 days

type Stored = { code: string; savedAt: number };

/** Saves the code from a vendor's referral link/QR. Never shown to the customer. */
export function saveVendorRef(raw: string | null | undefined): void {
  if (typeof window === "undefined" || !raw) return;
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z0-9]{6,12}$/.test(code)) return;
  try {
    const value: Stored = { code, savedAt: Date.now() };
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // storage blocked (private mode etc.), ignore
  }
}

export function getVendorRef(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed?.code || Date.now() - parsed.savedAt > TTL_MS) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return parsed.code;
  } catch {
    return null;
  }
}

export function clearVendorRef(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
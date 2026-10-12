export interface RefundSection {
  title: string;
  content: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface FaqCategory {
  label: string;
  color: string; // hex, e.g. "#FF7A00"
  faqs: Faq[];
}

// Paste the real entries from the mobile app's vendor support screen.
// Shape: { title: "…", content: "…" }
export const REFUND_SECTIONS: RefundSection[] = [];

// Paste the real entries from the mobile app's vendor support screen.
// Shape: { label: "…", color: "#…", faqs: [{ q: "…", a: "…" }] }
export const FAQ_CATEGORIES: FaqCategory[] = [];
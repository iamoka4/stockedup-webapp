export const BUSINESS_TYPES = ["grocery", "restaurant", "supermarket"] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string }[] = [
  { value: "grocery", label: "Grocery" },
  { value: "restaurant", label: "Restaurant" },
  { value: "supermarket", label: "Supermarket" },
];

export const NIGERIAN_STATES = [
  "Anambra",
  "Enugu",
  "Rivers",
  "Delta",
  "Imo",
  "Abia",
  "Edo",
] as const;

export interface VendorSignUpValues {
  businessType: BusinessType | "";
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  businessAddress: string;
  city: string;
  state: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export type VendorSignUpErrors = Partial<Record<keyof VendorSignUpValues, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** First failing password rule, or undefined when the password is valid. */
export function passwordIssue(pw: string): string | undefined {
  if (!pw) return "Password is required";
  if (pw.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(pw)) return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(pw)) return "Password must contain at least one number";
  if (!/[^a-zA-Z0-9]/.test(pw))
    return "Password must contain at least one special character (e.g., @$!%*?&)";
  return undefined;
}

export function validateVendorSignUp(v: VendorSignUpValues): VendorSignUpErrors {
  const e: VendorSignUpErrors = {};

  if (!v.businessType) e.businessType = "Please select a business type";
  else if (!BUSINESS_TYPES.includes(v.businessType))
    e.businessType = "Please select a valid business type";

  if (!v.fullName.trim()) e.fullName = "Full name is required";

  if (!v.email.trim()) e.email = "Email is required";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Invalid email format";

  if (!v.phone) e.phone = "Phone number is required";
  else if (!/^0\d{10}$/.test(v.phone))
    e.phone = "Invalid phone number (e.g., 08012345678)";

  if (!v.businessName.trim()) e.businessName = "Business name is required";
  if (!v.businessAddress.trim()) e.businessAddress = "Business address is required";
  if (!v.city.trim()) e.city = "City is required";
  if (!v.state) e.state = "Please select a state";

  const pw = passwordIssue(v.password);
  if (pw) e.password = pw;

  if (!v.confirmPassword) e.confirmPassword = "Please confirm your password";
  else if (v.confirmPassword !== v.password)
    e.confirmPassword = "Passwords do not match";

  if (!v.agreeToTerms) e.agreeToTerms = "Please agree to the terms and conditions";

  return e;
}
// One place to point the homepage, nav and footer at your routes.
// Routes marked NEW don't exist in your app yet: create them, or repoint them.
export const HOME_ROUTES = {
  food: "/food", // NEW
  groceries: "/groceries", // NEW (/products stays as the search page)
  supermarkets: "/supermarkets", // NEW
  shops: "/vendors", // existing (swap for a dedicated local-shops page later)
  shop: "/shop", // logged-in marketplace home
  howItWorks: "/how-it-works",
  merchants: "/merchants", // merchant page (linked from the footer only)
  merchantGrowth: "/merchants#growth",
  riders: "/riders", // dedicated Become a Rider page
  koulriago: "/riders#about-koulriago", // "Meet KoulriaGo" section on that page
  help: "/faq",
  // Point these at real signup pages when they exist (contact form for now).
  merchantSignup: "/contact",
  riderSignup: "/riders", // riders start on the info page, then contact support
  careers: "/contact", // NEW: point at a careers page when you have one
} as const;
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-bg-raised">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-6">
        <div className="sm:col-span-2 lg:col-span-2">
          <span className="font-display text-lg font-semibold text-ink">StockedUp Africa</span>
          <p className="mt-2 max-w-xs text-sm text-ink-soft">
            Foodstuff and groceries from vendors you know, delivered across Awka.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm text-ink-soft">
          <span className="font-medium text-ink">Shop</span>
          <Link href="/vendors" className="hover:text-brand-deep">Vendors in Awka</Link>
          <Link href="/categories" className="hover:text-brand-deep">All categories</Link>
        </div>

        <div className="flex flex-col gap-2 text-sm text-ink-soft">
          <span className="font-medium text-ink">Categories</span>
          <Link href="/categories" className="hover:text-brand-deep">Groceries & Foodstuffs</Link>
          <Link href="/categories" className="hover:text-brand-deep">Canned Foods</Link>
          <Link href="/categories" className="hover:text-brand-deep">Fresh Vegetables</Link>
          <Link href="/categories" className="hover:text-brand-deep">Flour & Grains</Link>
        </div>

        <div className="flex flex-col gap-2 text-sm text-ink-soft">
          <span className="font-medium text-ink">Policy</span>
          <a href="/return-policy" className="hover:text-brand-deep">Return Policy</a>
          <a href="/shipping-policy" className="hover:text-brand-deep">Shipping Policy</a>
          <a href="/quality-guarantee" className="hover:text-brand-deep">Quality Guarantee</a>
          <a href="/vendor-terms" className="hover:text-brand-deep">Vendor Terms</a>
        </div>

       <div className="flex flex-col gap-2 text-sm text-ink-soft">
  <span className="font-medium text-ink">Company</span>
  <Link href="/about" className="hover:text-brand-deep">About Us</Link>
  <Link href="/testimonials" className="hover:text-brand-deep">Testimonials</Link>
  <Link href="/contact" className="hover:text-brand-deep">Contact Us</Link>
  <Link href="/faq" className="hover:text-brand-deep">FAQ</Link>
</div>
      </div>

      <div className="border-t border-line px-4 py-4 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} StockedUp Africa. All rights reserved.
      </div>
    </footer>
  );
}
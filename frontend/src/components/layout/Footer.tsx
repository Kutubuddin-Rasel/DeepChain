import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-foreground/5 bg-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="font-serif text-3xl font-bold tracking-tight text-primary">
                Foodio
                <span className="text-foreground">.</span>
              </span>
            </Link>
            <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
              Premium dining experiences delivered straight to your door. Experience culinary excellence without leaving your home.
            </p>
            <div className="flex gap-4 text-foreground/40">
              <Link href="#" className="hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold mb-6 text-foreground">Quick Links</h4>
            <ul className="space-y-4 text-sm text-foreground/70">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/menu" className="hover:text-primary transition-colors">Order Now</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-serif font-bold mb-6 text-foreground">Legal</h4>
            <ul className="space-y-4 text-sm text-foreground/70">
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund" className="hover:text-primary transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-serif font-bold mb-6 text-foreground">Newsletter</h4>
            <p className="text-sm text-foreground/60 mb-4">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full rounded-l-xl border border-r-0 border-foreground/10 bg-background px-4 py-2 text-sm focus:outline-none focus:border-primary"
              />
              <button className="rounded-r-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-foreground/5 text-center text-sm text-foreground/50">
          <p>© {new Date().getFullYear()} Foodio Restaurant Ordering System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

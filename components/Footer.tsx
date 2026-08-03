"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getSiteSettings, SiteSettings } from "@/lib/firestore";

function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => { });
  }, []);

  const phone = settings?.contactPhone ?? "+234 800 ESHMART";
  const email = settings?.contactEmail ?? "export@eshmartagrox.com";
  const address = settings?.address ?? "20b Kingsley Emu Street, Lekki Phase 1 Lagos";
  const siteName = settings?.siteName ?? "Eshmart Agrox";
  const tagline = settings?.tagline ?? "Premium Nigerian produce for international markets.";
  const copyright = `© ${new Date().getFullYear()} ${siteName}. All Rights Reserved.`;

  return (
    <footer className="py-10 md:py-16 mt-auto border-t border-gray-100">
      <div className="w-[90%] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-3 w-24 h-24 relative shrink-0">
              {settings?.logoUrl ? (
                <Image src={settings.logoUrl} alt={siteName} fill className="object-contain" />
              ) : (
                <Image src="/assets/eshmartlogo.png" alt="Eshmart Agrox Logo" fill className="object-contain" />
              )}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed max-w-[240px]">{tagline}</p>
          </div>

          {/* Navigation links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "Shop", href: "/shop" },
                { label: "Portfolio", href: "/portfolio" },
                { label: "Blog", href: "/blog" },
                { label: "Book Online", href: "/book-online" },
                { label: "Contact", href: "/contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-600 hover:text-green-900 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Office */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Lagos Office</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{address}</p>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-3">Inquiries</h3>
            <p className="text-sm text-gray-600">T: {phone}</p>
            <p className="text-sm text-gray-600 mt-1">
              E:{" "}
              <a href={`mailto:${email}`} className="hover:text-green-900 hover:underline transition-colors">
                {email}
              </a>
            </p>
          </div>

          {/* Track order */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Your Orders</h3>
            <p className="text-sm text-gray-600 mb-3">Track your order status anytime using your email or payment reference.</p>
            <Link
              href="/track-my-order"
              className="inline-block border border-green-900 text-green-900 text-sm px-4 py-2 hover:bg-green-900 hover:text-white transition-colors"
            >
              Track Order →
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 text-center sm:text-left">{copyright}</p>
          <div className="flex gap-4">
            <Link href="/contact" className="text-xs text-gray-400 hover:text-green-900 transition-colors">Contact</Link>
            <Link href="/track-my-order" className="text-xs text-gray-400 hover:text-green-900 transition-colors">Track Order</Link>
            <Link href="/profile" className="text-xs text-gray-400 hover:text-green-900 transition-colors">Account</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

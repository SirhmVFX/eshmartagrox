"use client";

import { Search, ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import Image from "next/image";
import { getNavLinks, getSiteSettings, NavLink, SiteSettings } from "@/lib/firestore";

const FALLBACK_NAV: NavLink[] = [
  { label: "Home", href: "/", order: 1, isVisible: true, active: true },
  { label: "Portfolio", href: "/portfolio", order: 2, isVisible: true, active: true },
  { label: "Book Online", href: "/book-online", order: 3, isVisible: true, active: true },
  { label: "Shop", href: "/shop", order: 4, isVisible: true, active: true },
  { label: "Blog", href: "/blog", order: 5, isVisible: true, active: true },
  { label: "Track My Order", href: "/track-my-order", order: 6, isVisible: true, active: true },
];

const FALLBACK_SETTINGS: SiteSettings = {
  siteName: "Eshmart Agrox",
  tagline: "Nigerian Produce. Exported with Integrity.",
  title: "Eshmart Agrox",
  description: "",
  logoUrl: "",
  faviconUrl: "/favicon.ico",
  currency: "NGN",
  currencySymbol: "₦",
  contactEmail: "exports@eshmartagrox.com",
  contactPhone: "+234 800 000 0000",
  address: "Lagos, Nigeria",
  showSearch: true,
  showCart: true,
  showUser: true,
};

function Header() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [navlinks, setNavlinks] = useState<NavLink[]>(FALLBACK_NAV);
  const [settings, setSettings] = useState<SiteSettings>(FALLBACK_SETTINGS);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();
  const cart = useCart();
  const { rates, selected, setSelected } = useCurrency();

  // Close currency dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    getNavLinks()
      .then((data) => { if (data.length > 0) setNavlinks(data); })
      .catch(() => { });
    getSiteSettings()
      .then((s) => { if (s) setSettings(s); })
      .catch(() => { });
  }, []);

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!q.trim()) return router.push("/shop");
    router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header>
      <div className="w-[90%] mx-auto flex justify-between items-center py-3">
        <div className="flex items-center gap-2">
          <div className="w-24 h-24 md:w-32 md:h-32">
            {settings.logoUrl ? (
              <div className="relative w-full h-full">
                <Image src={settings.logoUrl} alt={settings.siteName} fill className="object-contain" />
              </div>
            ) : (
              <Image src="/assets/eshmartlogo.png" alt="Logo" width={10000} height={10000} className="w-full h-full object-contain" />
            )}
          </div>
        </div>

        <nav className="hidden md:flex gap-2">
          {navlinks.map((link) => (
            <Link key={link.id ?? link.href} href={link.href} className="p-2 hover:border-b hover:border-green-900 text-green-900">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          {settings.showSearch && (
            <form onSubmit={submitSearch} className="hidden sm:flex items-center border border-gray-200 rounded-full overflow-hidden">
              <input placeholder="Search products" className="px-3 py-2 md:px-3 md:py-3 outline-none" value={q} onChange={(e) => setQ(e.target.value)} />
              <button type="submit" className="px-2 md:px-3">
                <Search className="text-gray-600" />
              </button>
            </form>
          )}

          {/* Currency selector */}
          {rates.length > 1 && (
            <div ref={currencyRef} className="relative">
              <button
                onClick={() => setCurrencyOpen(o => !o)}
                className="flex items-center gap-1 text-sm font-semibold text-green-900 border border-gray-200 px-2.5 py-1.5 hover:border-green-900 transition-colors"
              >
                <span>{selected.symbol}</span>
                <span className="hidden sm:inline">{selected.code}</span>
                <ChevronDown size={13} className={`transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
              </button>
              {currencyOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-lg z-50 min-w-[160px]">
                  {rates.map(rate => (
                    <button
                      key={rate.code}
                      onClick={() => { setSelected(rate); setCurrencyOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-green-50 transition-colors ${selected.code === rate.code ? "bg-green-50 text-green-900 font-semibold" : "text-gray-700"}`}
                    >
                      <span className="w-5 text-center font-semibold text-green-700">{rate.symbol}</span>
                      <span className="flex-1">{rate.name}</span>
                      <span className="text-xs text-gray-400 font-mono">{rate.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {settings.showCart && (
            <Link href="/cart" className="relative">
              <ShoppingCart className="text-green-900" />
              {cart.count > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{cart.count}</span>
              )}
            </Link>
          )}

          {settings.showUser && (
            user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/profile" className="text-sm md:text-base">{user.displayName ?? user.email}</Link>
                <button className="text-sm md:text-base text-red-600" onClick={async () => { await logout(); window.location.href = "/"; }}>Sign out</button>
              </div>
            ) : (
              <Link href="/login" className="hidden md:block p-2 text-green-900 text-sm md:text-base">Sign in</Link>
            )
          )}

          <button className="md:hidden p-2 text-green-900" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {navlinks.map((link) => (
            <Link key={link.id ?? link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block py-2 text-green-900 border-b border-gray-100 last:border-0">
              {link.label}
            </Link>
          ))}
          {settings.showSearch && (
            <form onSubmit={(e) => { submitSearch(e); setMenuOpen(false); }} className="flex items-center border border-gray-200 rounded-full overflow-hidden mt-2">
              <input placeholder="Search products" className="flex-1 px-3 py-2 outline-none text-sm" value={q} onChange={(e) => setQ(e.target.value)} />
              <button type="submit" className="px-3"><Search className="text-gray-600 w-4 h-4" /></button>
            </form>
          )}
          {settings.showUser && (
            user ? (
              <div className="flex items-center justify-between pt-2">
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="text-sm text-green-900">{user.displayName ?? user.email}</Link>
                <button className="text-sm text-red-600" onClick={async () => { await logout(); window.location.href = "/"; }}>Sign out</button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-green-900 text-sm">Sign in</Link>
            )
          )}
        </div>
      )}
    </header>
  );
}

export default Header;

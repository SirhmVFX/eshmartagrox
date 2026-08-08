"use client";

import { Search, ShoppingCart, Menu, X, ChevronDown, Globe } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import Image from "next/image";
import { getSiteSettings, SiteSettings } from "@/lib/firestore";

const LOCAL_NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Calculator", href: "/calculator" },
  { label: "Blog", href: "/blog" },
  { label: "Book Online", href: "/book-online" },
  { label: "Track Order", href: "/track-my-order" },
];

const EXPORT_NAV = [
  { label: "Overview", href: "/export" },
  { label: "Commodities", href: "/export#commodities" },
  { label: "Compliance", href: "/export-compliance" },
  { label: "FAQ", href: "/export-compliance#faq" },
  { label: "Get a Quote", href: "/export#quote" },
];

const FALLBACK_SETTINGS: SiteSettings = {
  siteName: "Eshmart Agrox",
  tagline: "Healthy Nigerian foods & organic exports.",
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
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(FALLBACK_SETTINGS);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();
  const cart = useCart();
  const { rates, selected, setSelected } = useCurrency();

  // Detect export mode: any /export* route
  const isExport = pathname.startsWith("/export");

  useEffect(() => {
    getSiteSettings().then(s => { if (s) setSettings(s); }).catch(() => { });
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node))
        setCurrencyOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setMenuOpen(false);
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
  };

  const navLinks = isExport ? EXPORT_NAV : LOCAL_NAV;

  return (
    <header className={`sticky top-0 z-50 border-b ${isExport ? "bg-[#052e1b] border-white/10" : "bg-[#FFFDF7] border-gray-200"}`}>
      <div className="container-90 flex items-center justify-between py-2 gap-4">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <div className="w-20 h-20 md:w-36 md:h-36 relative">
            {isExport ? (
              <Image src="/assets/eshmartlogowhite.png" alt="Eshmart Agrox" width={2000} height={2000} className="w-full h-full object-contain" />
            ) : settings.logoUrl ? (
              <Image src={settings.logoUrl} alt={settings.siteName} fill className="object-contain" />
            ) : (
              <Image src="/assets/eshmartlogo.png" alt="Eshmart Agrox" width={2000} height={2000} className="w-full h-full object-contain" />
            )}
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${isExport
                ? "text-white/80 hover:text-white"
                : "text-gray-700 hover:text-green-900"
                } ${pathname === l.href ? (isExport ? "text-white" : "text-green-900 border-b-2 border-green-900") : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 md:gap-3">

          {/* Mode switcher — the distinctive button */}
          {isExport ? (
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 bg-white text-[#052e1b] text-xs font-bold px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              Local Store
            </Link>
          ) : (
            <Link
              href="/export"
              className="hidden sm:flex items-center gap-1.5 bg-[#052e1b] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#073d25] transition-colors"
            >
              <Globe size={12} />
              International
            </Link>
          )}

          {/* Search — local only */}
          {!isExport && settings.showSearch && (
            <form onSubmit={submitSearch} className="hidden lg:flex items-center border border-gray-200 rounded-full overflow-hidden">
              <input
                placeholder="Search…"
                className="px-3 py-1.5 outline-none text-sm bg-transparent w-36"
                value={q}
                onChange={e => setQ(e.target.value)}
              />
              <button type="submit" className="px-2">
                <Search size={15} className="text-gray-500" />
              </button>
            </form>
          )}

          {/* Currency */}
          {rates.length > 1 && (
            <div ref={currencyRef} className="relative">
              <button
                onClick={() => setCurrencyOpen(o => !o)}
                className={`flex items-center gap-1 text-xs font-semibold border px-2 py-1.5 transition-colors ${isExport ? "border-white/20 text-white hover:border-white" : "border-gray-200 text-green-900 hover:border-green-900"}`}
              >
                {selected.symbol}
                <span className="hidden sm:inline">{selected.code}</span>
                <ChevronDown size={11} className={`transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
              </button>
              {currencyOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200  z-50 min-w-[160px]">
                  {rates.map(r => (
                    <button
                      key={r.code}
                      onClick={() => { setSelected(r); setCurrencyOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-green-50 ${selected.code === r.code ? "bg-green-50 text-green-900 font-semibold" : "text-gray-700"}`}
                    >
                      <span className="w-5 text-center font-semibold text-green-700">{r.symbol}</span>
                      <span className="flex-1">{r.name}</span>
                      <span className="text-xs text-gray-400 font-mono">{r.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cart — local only */}
          {!isExport && settings.showCart && (
            <Link href="/cart" className="relative">
              <ShoppingCart size={20} className="text-green-900" />
              {cart.count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cart.count}
                </span>
              )}
            </Link>
          )}

          {/* User */}
          {settings.showUser && !isExport && (
            user ? (
              <Link href="/profile" className="hidden md:block text-xs font-medium text-green-900 hover:underline truncate max-w-[100px]">
                {user.displayName ?? "Account"}
              </Link>
            ) : (
              <Link href="/login" className="hidden md:block text-xs font-medium text-green-900 hover:underline">
                Sign in
              </Link>
            )
          )}

          {/* Hamburger */}
          <button
            className={`md:hidden p-1.5 ${isExport ? "text-white" : "text-green-900"}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className={`md:hidden border-t px-5 py-4 space-y-1 ${isExport ? "bg-[#052e1b] border-white/10" : "bg-white border-gray-100"}`}>
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-2.5 text-sm font-medium border-b last:border-0 ${isExport ? "text-white/90 border-white/10" : "text-gray-800 border-gray-100"}`}
            >
              {l.label}
            </Link>
          ))}

          {/* Mode switch */}
          {isExport ? (
            <Link href="/" onClick={() => setMenuOpen(false)} className="block mt-3 text-center bg-white text-[#052e1b] text-xs font-bold px-4 py-2 rounded-full">
              ← Local Store
            </Link>
          ) : (
            <Link href="/export" onClick={() => setMenuOpen(false)} className="block mt-3 text-center bg-[#052e1b] text-white text-xs font-bold px-4 py-2 rounded-full">
              <span className="flex items-center justify-center gap-1.5"><Globe size={12} /> International Export</span>
            </Link>
          )}

          {!isExport && (
            <>
              {settings.showSearch && (
                <form onSubmit={e => { submitSearch(e); setMenuOpen(false); }} className="flex items-center border border-gray-200 rounded-full mt-3 overflow-hidden">
                  <input placeholder="Search products…" className="flex-1 px-3 py-2 text-sm outline-none" value={q} onChange={e => setQ(e.target.value)} />
                  <button type="submit" className="px-3"><Search size={15} className="text-gray-500" /></button>
                </form>
              )}
              {user ? (
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="text-sm text-green-900">{user.displayName ?? user.email}</Link>
                  <button className="text-sm text-red-600" onClick={async () => { setMenuOpen(false); await logout(); window.location.href = "/"; }}>Sign out</button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-green-900 font-medium">Sign in / Register</Link>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;

"use client";

import { Search, ShoppingCart, Menu, X } from "lucide-react";
import Link from "next/link";
import { useSiteContent } from "@/components/ContentProvider";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import Image from "next/image";

function Header() {
  const content = useSiteContent();
  const { settings, navigation } = content;
  const router = useRouter();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const navlinks = [...navigation]
    .filter((l) => l.isVisible)
    .sort((a, b) => a.order - b.order);

  const { user, logout } = useAuth();
  const cart = useCart();

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!q.trim()) return router.push('/shop');
    router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header>
      <div className="w-[90%] mx-auto flex justify-between items-center py-3">
        <div className="flex items-center gap-2">
          <div className="w-24 h-24 md:w-32 md:h-32">
            <Image src="/assets/eshmartlogo.png" alt="Logo" width={10000} height={10000} className="w-full h-full object-contain" />
          </div>
        </div>
        <nav className="hidden md:flex gap-2">
          {navlinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="p-2 hover:border-b hover:border-green-900 text-green-900 "
            >
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

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-green-900"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {navlinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-green-900 border-b border-gray-100 last:border-0"
            >
              {link.label}
            </Link>
          ))}
          {settings.showSearch && (
            <form onSubmit={(e) => { submitSearch(e); setMenuOpen(false); }} className="flex items-center border border-gray-200 rounded-full overflow-hidden mt-2">
              <input placeholder="Search products" className="flex-1 px-3 py-2 outline-none text-sm" value={q} onChange={(e) => setQ(e.target.value)} />
              <button type="submit" className="px-3">
                <Search className="text-gray-600 w-4 h-4" />
              </button>
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

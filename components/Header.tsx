"use client";

import { Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useSiteContent } from "@/components/ContentProvider";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";

function Header() {
  const content = useSiteContent();
  const { settings, navigation } = content;
  const router = useRouter();
  const [q, setQ] = useState("");

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
      <div className="w-[90%] mx-auto flex justify-between items-center py-6">
        <Link href="/" className="font-bold text-green-900">
          {settings.siteName}
        </Link>
        <nav className="hidden md:flex gap-2">
          {navlinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="p-2 hover:bg-green-900 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {settings.showSearch && (
            <form onSubmit={submitSearch} className="flex items-center border rounded overflow-hidden">
              <input placeholder="Search products" className="px-3 py-1 outline-none" value={q} onChange={(e) => setQ(e.target.value)} />
              <button type="submit" className="px-3">
                <Search />
              </button>
            </form>
          )}

          {settings.showCart && (
            <Link href="/cart" className="relative">
              <ShoppingCart />
              {cart.count > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{cart.count}</span>
              )}
            </Link>
          )}

          {settings.showUser && (
            user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile" className="text-sm">{user.displayName ?? user.email}</Link>
                <button className="text-sm text-red-600" onClick={async () => { await logout(); window.location.href = "/"; }}>Sign out</button>
              </div>
            ) : (
              <Link href="/login" className="p-2">Sign in</Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

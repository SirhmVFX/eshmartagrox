"use client";

import { Search, ShoppingCart, User } from "lucide-react";
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
      <div className="w-[1400] mx-auto flex justify-between items-center py-3">
        <div className="flex items-center gap-2">
          <div className="w-40 h-40">
            <Image src="/assets/eshmartlogo.png" alt="Logo" width={10000} height={10000} className="w-full h-full object-contain" />
          </div>
          {/* <Link href="/" className="font-bold text-green-900">
            {settings.siteName}
          </Link> */}
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
        <div className="flex items-center gap-4">
          {settings.showSearch && (
            <form onSubmit={submitSearch} className="flex items-center border border-gray-200 rounded-full overflow-hidden">
              <input placeholder="Search products" className="px-3 py-3 outline-none" value={q} onChange={(e) => setQ(e.target.value)} />
              <button type="submit" className="px-3">
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
              <div className="flex items-center gap-2">
                <Link href="/profile" className="text-sm">{user.displayName ?? user.email}</Link>
                <button className="text-sm text-red-600" onClick={async () => { await logout(); window.location.href = "/"; }}>Sign out</button>
              </div>
            ) : (
              <Link href="/login" className="p-2 text-green-900">Sign in</Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

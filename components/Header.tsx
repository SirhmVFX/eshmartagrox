"use client";

import { Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useSiteContent } from "@/components/ContentProvider";

function Header() {
  const content = useSiteContent();
  const { settings, navigation } = content;

  const navlinks = [...navigation]
    .filter((l) => l.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <header>
      <div className="w-[90%] mx-auto flex justify-between items-center py-6">
        <Link href="/" className="font-bold text-green-900">
          {settings.siteName}
        </Link>
        <nav>
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
          {settings.showSearch && <Search />}
          {settings.showCart && <ShoppingCart />}
          {settings.showUser && <User />}
        </div>
      </div>
    </header>
  );
}

export default Header;

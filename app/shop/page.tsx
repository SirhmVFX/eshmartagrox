"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Minus, Plus, Check } from "lucide-react";
import { getProducts, getSiteSettings, FirestoreProduct } from "@/lib/firestore";
import { useCurrency } from "@/lib/currency";
import { useCart } from "@/lib/cart";

// ── Subscription packages ─────────────────────────────────────────────────

const PACKAGES = [
  {
    tag: "Most loved",
    name: "Senior Wellness",
    price: 28500,
    period: "/ week",
    items: ["Fresh ugu, spinach & garden eggs", "Ofada / brown rice", "Beans & soybeans", "Fish & lean protein", "Seasonal fruits"],
    highlight: true,
  },
  {
    tag: "Best value",
    name: "Family of Four",
    price: 92000,
    period: "/ month",
    items: ["Rice, yam & plantain", "Beans & legumes", "Fish & chicken", "Vegetables & fruits weekly", "Free delivery & swap"],
  },
  {
    tag: "Campus-ready",
    name: "Student Smart Pack",
    price: 14900,
    period: "/ week",
    items: ["Rice, noodles & spaghetti", "Eggs & beans", "Tomatoes & vegetables", "Quick-prep proteins"],
  },
  {
    tag: "Meal-prep ready",
    name: "Working Professional",
    price: 22400,
    period: "/ week",
    items: ["Lean proteins", "Smart carbs", "Salad & greens", "Healthy snacks"],
  },
];

// ── Build-your-own box items ──────────────────────────────────────────────

const BOX_ITEMS = [
  { name: "Ofada rice (5kg)", price: 9500 },
  { name: "Brown rice (5kg)", price: 11000 },
  { name: "Honey beans (2kg)", price: 4500 },
  { name: "Yam tubers (3 pcs)", price: 7800 },
  { name: "Plantain bunch", price: 3500 },
  { name: "Instant noodles (carton · 40 packs)", price: 7200 },
  { name: "Spaghetti (pack of 10)", price: 6500 },
  { name: "Macaroni (pack of 10)", price: 6200 },
  { name: "Ugu & spinach bundle", price: 2200 },
  { name: "Fresh tomato & pepper", price: 3800 },
  { name: "Titus fish (1kg)", price: 6500 },
  { name: "Croaker fish (1kg)", price: 8200 },
  { name: "Chicken (whole)", price: 9800 },
  { name: "Goat meat (1kg)", price: 8500 },
  { name: "Crate of eggs (30)", price: 5200 },
  { name: "Oats (1kg)", price: 3200 },
  { name: "Seasonal fruit basket", price: 6800 },
  { name: "Palm oil (2L)", price: 5500 },
  { name: "Egusi & crayfish pack", price: 4200 },
  { name: "Seasoning cubes (pack · 100 pcs)", price: 2800 },
  { name: "Curry & thyme combo", price: 1800 },
  { name: "Ginger & garlic paste (500g)", price: 1500 },
  { name: "Dry pepper (ground · 500g)", price: 2200 },
  { name: "Stockfish (medium bundle)", price: 8500 },
  { name: "Dry fish (smoked · 1kg)", price: 9500 },
];

// ── Filter section ─────────────────────────────────────────────────────────

function FilterSection({ title, options, selected, onChange }: {
  title: string; options: string[]; selected: string | null; onChange: (v: string | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="mb-6">
      <button type="button" onClick={() => setIsOpen(o => !o)} className="flex w-full justify-between items-center gap-2 text-left">
        <h3 className="font-semibold text-base text-gray-800">{title}</h3>
        {isOpen ? <Minus className="h-4 w-4 text-gray-500" /> : <Plus className="h-4 w-4 text-gray-500" />}
      </button>
      {isOpen && (
        <div className="mt-3 space-y-2">
          {options.map(option => (
            <label key={option} className="flex items-center gap-2 cursor-pointer hover:text-green-700 text-sm">
              <input type="checkbox" checked={selected === option} onChange={() => onChange(selected === option ? null : option)} className="w-4 h-4 accent-green-700" />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Build-Your-Own Box component ───────────────────────────────────────────

function BuildBox() {
  const { format } = useCurrency();
  const { add } = useCart();
  const [qty, setQty] = useState<Record<number, number>>({});
  const [added, setAdded] = useState(false);

  const total = BOX_ITEMS.reduce((sum, it, i) => sum + (qty[i] ?? 0) * it.price, 0);
  const itemCount = Object.values(qty).reduce((s, q) => s + q, 0);

  const handleAddBox = () => {
    BOX_ITEMS.forEach((item, i) => {
      const q = qty[i] ?? 0;
      if (q > 0) add({ id: `box-${i}`, name: item.name, price: item.price, quantity: q });
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 bg-[#F5F0E8] flex items-center justify-between">
        <span className="text-sm font-bold text-gray-800">Build Your Own Box</span>
        <span className="text-[10px] font-bold bg-[#f97316] text-white px-2.5 py-0.5 rounded-full">Fully customisable</span>
      </div>
      <p className="text-xs text-gray-500 px-4 py-2 border-b border-gray-100">
        Pick exactly the groceries and proteins you want. Adjust quantities, see your live total, and we&apos;ll hand-pack and deliver it.
      </p>
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
        {BOX_ITEMS.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-gray-400">{format(item.price)}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setQty(q => ({ ...q, [i]: Math.max(0, (q[i] ?? 0) - 1) }))}
                className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-sm"
              >−</button>
              <span className="w-5 text-center text-sm font-medium">{qty[i] ?? 0}</span>
              <button
                onClick={() => setQty(q => ({ ...q, [i]: (q[i] ?? 0) + 1 }))}
                className="w-6 h-6 rounded-full bg-[#14532d] text-white flex items-center justify-center text-sm hover:bg-green-800"
              >+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">{itemCount} items in box</p>
          <p className="text-xl font-bold text-gray-900">{format(total)}</p>
        </div>
        <button
          onClick={handleAddBox}
          disabled={!itemCount}
          className="bg-gray-800 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {added ? <><Check size={13} /> Added!</> : "Order custom box"}
        </button>
      </div>
    </div>
  );
}

// ── Main shop page ─────────────────────────────────────────────────────────

export default function Shop() {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState("/assets/1.jpg");
  const [bannerTitle, setBannerTitle] = useState("Our Shop");
  const [activeTab, setActiveTab] = useState<"packages" | "box" | "all">("packages");
  const { format } = useCurrency();
  const { add } = useCart();

  useEffect(() => {
    Promise.all([getProducts(), getSiteSettings()])
      .then(([data, settings]) => {
        setProducts(data);
        if (settings?.shopBannerImage) setBannerImage(settings.shopBannerImage);
        if (settings?.shopBannerTitle) setBannerTitle(settings.shopBannerTitle);
      })
      .catch(() => { })
      .finally(() => setLoading(false));

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q")?.trim() ?? "";
      if (q) { setQuery(q); setActiveTab("all"); }
    }
  }, []);

  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category).filter(Boolean))].sort();
  }, [products]);

  const filtered = useMemo(() => products.filter(p => {
    if (query && !p.name?.toLowerCase().includes(query.toLowerCase()) && !p.category?.toLowerCase().includes(query.toLowerCase())) return false;
    if (selectedCategory && p.category !== selectedCategory) return false;
    return true;
  }), [products, query, selectedCategory]);

  const TABS = [
    { id: "packages", label: "Subscription Packages" },
    { id: "box", label: "Build Your Own Box" },
    { id: "all", label: "All Products" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#FFFDF7]">

      {/* Banner */}
      <div className="w-full h-56 sm:h-72 relative overflow-hidden bg-gray-100">
        <Image src={bannerImage} alt="Shop" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center gap-2">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white text-center px-4">{bannerTitle}</h1>
          <p className="text-white/80 text-sm hidden sm:block">Hand-packed and delivered chilled across Lagos &amp; Abuja</p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200 bg-white sticky top-[68px] z-30">
        <div className="container-max flex overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === t.id
                ? "border-green-900 text-green-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container-max py-8 md:py-12">

        {/* ── PACKAGES TAB ───────────────────────────────────────────── */}
        {activeTab === "packages" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl text-gray-900 mb-1">Subscription Packages</h2>
              <p className="text-gray-500 text-sm">
                Subscribe weekly, bi-weekly or monthly. Cancel anytime. Hand-packed and delivered chilled.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PACKAGES.map(pkg => {
                const tagColor = pkg.tag === "Best value" ? "bg-[#f97316] text-white" : "bg-[#14532d] text-white";
                return (
                  <div key={pkg.name} className="bg-white rounded-2xl p-5 flex flex-col gap-3 border border-gray-100">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 text-base">{pkg.name}</h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${tagColor}`}>{pkg.tag}</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{format(pkg.price)}</span>
                      <span className="text-xs text-gray-400 ml-1">{pkg.period}</span>
                    </div>
                    <ul className="space-y-1 flex-1">
                      {pkg.items.map(it => (
                        <li key={it} className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Check size={11} className="text-[#14532d] shrink-0" /> {it}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => add({ id: `pkg-${pkg.name}`, name: pkg.name, price: pkg.price, quantity: 1 })}
                      className="w-full bg-[#0d1b12] text-white py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Subscribe
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── BUILD YOUR OWN BOX TAB ─────────────────────────────────── */}
        {activeTab === "box" && (
          <div id="build-box" className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-2xl sm:text-3xl text-gray-900 mb-2">Build Your Own Box</h2>
              <p className="text-gray-600">
                Pick exactly the groceries and proteins you want. Adjust quantities, see your live total,
                and we&apos;ll hand-pack and deliver it.
              </p>
            </div>
            <BuildBox />
          </div>
        )}

        {/* ── ALL PRODUCTS TAB ───────────────────────────────────────── */}
        {activeTab === "all" && (
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Sidebar */}
            <aside className="md:w-56 shrink-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-800">Filters</h2>
                <button onClick={() => { setSelectedCategory(null); setQuery(""); }} className="text-xs text-green-700 font-medium hover:underline">Clear</button>
              </div>
              {categories.length > 0 && (
                <FilterSection title="Category" options={categories} selected={selectedCategory} onChange={setSelectedCategory} />
              )}
            </aside>

            <div className="flex-1">
              <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-gray-500">Showing {filtered.length} of {products.length} products</p>
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search products…"
                  className="w-full sm:w-64 border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-green-700"
                />
              </div>

              {loading ? (
                <p className="text-gray-400 text-sm text-center py-20">Loading products…</p>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500 mb-4">No products found.</p>
                  <button onClick={() => { setSelectedCategory(null); setQuery(""); }} className="bg-green-900 text-white px-5 py-2.5 text-sm hover:bg-green-800 transition-colors">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filtered.map(product => (
                    <Link key={product.id} href={`/shop/${product.id}`} className="group border border-gray-200 bg-white block hover:border-green-700 transition-colors">
                      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                        <Image
                          src={product.images?.[0] || "/assets/6.jpg"}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.isNew && <span className="absolute top-2 left-2 bg-green-900 text-white text-xs px-2 py-0.5">NEW</span>}
                        {product.isBestSeller && <span className="absolute top-2 right-2 bg-orange-600 text-white text-xs px-2 py-0.5">BEST SELLER</span>}
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-green-600 font-medium mb-1">{product.category}</p>
                        <p className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</p>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-base font-bold text-green-700">{format(product.price)}</span>
                          {product.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">{format(product.originalPrice)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

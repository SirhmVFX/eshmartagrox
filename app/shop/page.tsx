"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Minus, Plus } from "lucide-react";
import { getProducts, getSiteSettings, FirestoreProduct } from "@/lib/firestore";
import { useCurrency } from "@/lib/currency";

function FilterSection({ title, options, selected, onChange }: {
  title: string; options: string[]; selected: string | null; onChange: (v: string | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full justify-between items-center gap-2 text-left"
        aria-expanded={isOpen}
      >
        <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
        {isOpen
          ? <Minus className="h-5 w-5 shrink-0 text-gray-600" />
          : <Plus className="h-5 w-5 shrink-0 text-gray-600" />}
      </button>
      {isOpen && (
        <div className="mt-3 space-y-2">
          {options.map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer hover:text-green-600 transition-colors">
              <input
                type="checkbox"
                checked={selected === option}
                onChange={() => onChange(selected === option ? null : option)}
                className="w-4 h-4 text-green-600 rounded border-gray-300"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Shop() {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState("/assets/1.jpg");
  const [bannerTitle, setBannerTitle] = useState("Our Shop");
  const { format } = useCurrency();

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
      if (q) setQuery(q);
    }
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category).filter(Boolean))];
    return cats.sort();
  }, [products]);

  const filtered = useMemo(() => products.filter((p) => {
    if (
      query &&
      !p.name?.toLowerCase().includes(query.toLowerCase()) &&
      !p.category?.toLowerCase().includes(query.toLowerCase())
    ) return false;
    if (selectedCategory && p.category !== selectedCategory) return false;
    return true;
  }), [products, query, selectedCategory]);

  return (
    <div className="min-h-screen w-full">
      {/* Banner */}
      <div className="w-full h-[300px] relative overflow-hidden bg-gray-100">
        <Image src={bannerImage} alt="Shop Banner" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white px-4 text-center">
            {bannerTitle}
          </h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row w-[90%] mx-auto px-4 py-8 gap-6 md:gap-8">
        {/* Sidebar filters */}
        <div className="md:w-[280px] shrink-0 w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Filters</h2>
            <button
              onClick={() => { setSelectedCategory(null); setQuery(""); }}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Clear All
            </button>
          </div>
          {categories.length > 0 && (
            <FilterSection
              title="Category"
              options={categories}
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
          )}
        </div>

        {/* Products grid */}
        <div className="flex-1">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-gray-600">Showing {filtered.length} of {products.length} products</p>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full sm:w-[320px] border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {loading ? (
            <p className="text-gray-400 text-sm text-center py-20">Loading products…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 md:py-20">
              <p className="text-gray-500 text-lg">No products found.</p>
              <button
                onClick={() => { setSelectedCategory(null); setQuery(""); }}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.id}`}
                  className="group overflow-hidden transition-shadow duration-300 border border-gray-100 block"
                >
                  <div className="relative w-full h-64 md:h-48 lg:h-64 bg-gray-100 overflow-hidden">
                    <Image
                      src={product.images?.[0] || "/assets/6.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.isNew && (
                      <span className="absolute top-2 left-2 bg-green-900 text-white text-xs px-2 py-1">NEW</span>
                    )}
                    {product.isBestSeller && (
                      <span className="absolute top-2 right-2 bg-orange-600 text-white text-xs px-2 py-1">BEST SELLER</span>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <div className="text-xs text-green-600 font-medium mb-1">{product.category}</div>
                    <p className="font-semibold text-gray-800 line-clamp-2 text-sm md:text-base">{product.name}</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                    <div className="mt-2">
                      <span className="text-xl font-bold text-green-600">
                        {format(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through ml-2">
                          {format(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

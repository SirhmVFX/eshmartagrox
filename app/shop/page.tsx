"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSiteContent } from "@/components/ContentProvider";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

function FilterSection({
  title,
  options,
  selected,
  onChange,
}: {
  title: string;
  options: string[];
  selected: string | null;
  onChange: (value: string | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full justify-between items-center gap-2 text-left"
        aria-expanded={isOpen}
      >
        <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
        {isOpen ? (
          <Minus className="h-5 w-5 shrink-0 text-gray-600" aria-hidden />
        ) : (
          <Plus className="h-5 w-5 shrink-0 text-gray-600" aria-hidden />
        )}
      </button>
      {isOpen && (
        <div className="mt-3 space-y-2">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer hover:text-green-600 transition-colors"
            >
              <input
                type="checkbox"
                checked={selected === option}
                onChange={() => onChange(selected === option ? null : option)}
                className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
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
  const content = useSiteContent();
  const { shop, settings } = content;
  const allProducts = shop.products.filter((p) => p.isPublished);
  const filterOptions = shop.filters;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedLength, setSelectedLength] = useState<string | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);
  const [browseBy, setBrowseBy] = useState<string>("All Products");
  const [query, setQuery] = useState("");
  const cart = useCart();

  const products = [
    {
      id: '1',
      name: 'Okro',
      price: 29.99,
      image: '/assets/p1.jpg',
      category: 'Vegetables',
      quantity: '10 piece',
      weight: '200g',
      size: 'M',
      isPublished: true
    },
    {
      id: '2',
      name: 'Cabbage',
      price: 15.99,
      image: '/assets/p2.jpg',
      category: 'Vegetables',
      quantity: '5 piece',
      weight: '500g',
      size: 'L',
      isPublished: true
    },
    {
      id: '3',
      name: 'Carrot',
      price: 12.99,
      image: '/assets/p3.jpg',
      category: 'Vegetables',
      quantity: '20 piece',
      weight: '300g',
      size: 'S',
      isPublished: true
    },

    {
      id: '4',
      name: 'Onions',
      price: 18.99,
      image: '/assets/p4.jpg',
      category: 'Vegetables',
      quantity: '15 piece',
      weight: '400g',
      size: 'M',
      isPublished: true
    },
    {
      id: '5',
      name: 'Potatoes',
      price: 25.99,
      image: '/assets/p5.jpg',
      category: 'Vegetables',
      quantity: '8 piece',
      weight: '600g',
      size: 'L',
      isPublished: true
    },

    {
      id: '6',
      name: 'Tomato',
      price: 22.99,
      image: '/assets/p6.jpg',
      category: 'Vegetables',
      quantity: '12 piece',
      weight: '350g',
      size: 'M',
      isPublished: true
    },

    {
      id: '7',
      name: 'Spinach',
      price: 14.99,
      image: '/assets/p7.jpg',
      category: 'Vegetables',
      quantity: '10 piece',
      weight: '250g',
      size: 'M',
      isPublished: true
    },

    {
      id: '8',
      name: 'Broccoli',
      price: 20.99,
      image: '/assets/p8.jpg',
      category: 'Vegetables',
      quantity: '6 piece',
      weight: '450g',
      size: 'L',
      isPublished: true
    },

    {
      id: '9',
      name: 'Cucumber',
      price: 16.99,
      image: '/assets/p9.jpg',
      category: 'Vegetables',
      quantity: '10 piece',
      weight: '300g',
      size: 'M',
      isPublished: true
    },

    {
      id: '10',
      name: 'Bell Pepper',
      price: 19.99,
      image: '/assets/p10.jpg',
      category: 'Vegetables',
      quantity: '8 piece',
      weight: '300g',
      size: 'M',
      isPublished: true
    },
    {
      id: '11',
      name: 'Garlic',
      price: 11.99,
      image: '/assets/p11.jpg',
      category: 'Vegetables',
      quantity: '25 piece',
      weight: '200g',
      size: 'S',
      isPublished: true
    }
  ]

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q")?.trim() ?? "");
  }, []);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        if (query && !product.name.toLowerCase().includes(query.toLowerCase()) && !product.category.toLowerCase().includes(query.toLowerCase())) return false;
        if (selectedCategory && product.category !== selectedCategory) return false;
        if (selectedPrice) {
          const priceNum = parseInt(selectedPrice.replace("NGN ", ""));
          if (product.price !== priceNum) return false;
        }
        // if (selectedLength && product.length !== selectedLength) return false;
        if (selectedQuantity && product.quantity !== selectedQuantity) return false;
        if (selectedSize && product.size !== selectedSize) return false;
        if (selectedWeight && product.weight !== selectedWeight) return false;
        if (browseBy !== "All Products" && product.category !== browseBy) return false;
        return true;
      }),
    [allProducts, query, selectedCategory, selectedPrice, selectedLength, selectedQuantity, selectedSize, selectedWeight, browseBy]
  );

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedPrice(null);
    setSelectedLength(null);
    setSelectedQuantity(null);
    setSelectedSize(null);
    setSelectedWeight(null);
    setBrowseBy("All Products");
  };

  return (
    <div className="min-h-screen ">
      <div className="w-full h-[300px] relative overflow-hidden bg-gray-100">
        <div className="relative w-full h-full">
          <Image
            src="/assets/1.jpg"
            alt="Shop Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white">{shop.bannerTitle}</h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row w-350 mx-auto px-4 py-8 gap-8">
        <div className="md:w-[280px] flex-shrink-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Filters</h2>
            <button
              onClick={clearAllFilters}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">Browse by</h3>
            <div className="space-y-2">
              {filterOptions.browseOptions.map((item) => (
                <button
                  key={item}
                  onClick={() => setBrowseBy(item)}
                  className={`block w-full text-left transition-colors ${browseBy === item
                    ? "underline text-green-900"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <FilterSection
            title="Product type"
            options={filterOptions.productTypes}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
          <FilterSection
            title="Price"
            options={filterOptions.priceOptions}
            selected={selectedPrice}
            onChange={setSelectedPrice}
          />
          <FilterSection
            title="Length"
            options={filterOptions.lengthOptions}
            selected={selectedLength}
            onChange={setSelectedLength}
          />
          <FilterSection
            title="Quantity"
            options={filterOptions.quantityOptions}
            selected={selectedQuantity}
            onChange={setSelectedQuantity}
          />
          <FilterSection
            title="Size"
            options={filterOptions.sizeOptions}
            selected={selectedSize}
            onChange={setSelectedSize}
          />
          <FilterSection
            title="Weight"
            options={filterOptions.weightOptions}
            selected={selectedWeight}
            onChange={setSelectedWeight}
          />
        </div>

        <div className="flex-1">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-gray-600">Showing {filteredProducts.length} of {allProducts.length} products</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products or category"
                className="w-full sm:w-[320px] border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                {shop.sortOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 ">
              <p className="text-gray-500 text-lg">No products found matching your filters.</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group  overflow-hidden  transition-shadow duration-300 border border-gray-100"
                >
                  <div className="relative w-full h-64 bg-gray-100">
                    <Image
                      src={product.image || "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=600&q=80"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-green-600 font-medium mb-1">
                      {product.category}
                    </div>
                    <p className="font-semibold text-gray-800 line-clamp-2 ">
                      {product.name}
                    </p>
                    <div className="space-y-1 mb-3 flex gap-2">
                      {product.quantity && (
                        <p className="text-xs text-gray-500">{product.quantity}</p>
                      )}
                      {product.weight && (
                        <p className="text-xs text-gray-500">{product.weight}</p>
                      )}
                      {product.size && (
                        <p className="text-xs text-gray-500">Size: {product.size}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-green-600">
                        {settings.currencySymbol}
                        {product.price.toFixed(2)}
                      </span>
                      {/* <button onClick={() => cart.add({ id: product.id, name: product.name, price: product.price, quantity: 1 })} className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
                        Add to Cart
                      </button> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

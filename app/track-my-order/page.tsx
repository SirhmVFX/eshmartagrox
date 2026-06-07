"use client";

import { useState } from "react";
import { useSiteContent } from "@/components/ContentProvider";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function TrackOrderPage() {
  const { trackOrder, settings } = useSiteContent();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<(typeof trackOrder.orders)[0] | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = trackOrder.orders.find(
      (o) => o.orderNumber.toLowerCase() === query.trim().toLowerCase()
    );
    setResult(found ?? null);
    setSearched(true);
  };

  return (
    <div className="w-[90%] max-w-xl mx-auto py-12 md:py-20">
      <h1 className="text-2xl md:text-4xl font-bold text-green-900">{trackOrder.pageTitle}</h1>
      <p className="text-gray-600 mt-2 mb-6 md:mb-8 text-sm md:text-base">{trackOrder.pageDescription}</p>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter order number e.g. EA-2026-001"
          className="flex-1 border border-black/30 p-3 md:p-4 text-sm md:text-base"
          required
        />
        <button
          type="submit"
          className="bg-green-900 text-white px-6 py-3 md:py-2 hover:bg-green-800 text-sm md:text-base"
        >
          Track
        </button>
      </form>
      {searched && (
        <div className="mt-6 md:mt-8 rounded-lg border border-green-100 p-4 md:p-6">
          {result ? (
            <>
              <p className="text-sm text-gray-500">Order number</p>
              <p className="font-bold text-lg">{result.orderNumber}</p>
              <p className="mt-4 text-sm md:text-base">
                Status:{" "}
                <span className="font-semibold text-green-900">
                  {statusLabels[result.status]}
                </span>
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Customer: {result.customerName}
              </p>
              <ul className="mt-4 space-y-1 text-sm">
                {result.items.map((item, i) => (
                  <li key={i}>
                    {item.productName} × {item.quantity} — {settings.currencySymbol}
                    {item.price}
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-bold text-sm md:text-base">
                Total: {settings.currencySymbol}
                {result.total.toFixed(2)}
              </p>
            </>
          ) : (
            <p className="text-gray-500 text-sm md:text-base">No order found with that number.</p>
          )}
        </div>
      )}
    </div>
  );
}

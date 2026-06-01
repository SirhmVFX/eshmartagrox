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
    <div className="w-[90%] max-w-xl mx-auto py-20">
      <h1 className="text-4xl font-bold text-green-900">{trackOrder.pageTitle}</h1>
      <p className="text-gray-600 mt-2 mb-8">{trackOrder.pageDescription}</p>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter order number e.g. EA-2026-001"
          className="flex-1"
          required
        />
        <button
          type="submit"
          className="bg-green-900 text-white px-6 py-2 rounded-lg hover:bg-green-800"
        >
          Track
        </button>
      </form>
      {searched && (
        <div className="mt-8 rounded-lg border border-green-100 p-6">
          {result ? (
            <>
              <p className="text-sm text-gray-500">Order number</p>
              <p className="font-bold text-lg">{result.orderNumber}</p>
              <p className="mt-4">
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
              <p className="mt-4 font-bold">
                Total: {settings.currencySymbol}
                {result.total.toFixed(2)}
              </p>
            </>
          ) : (
            <p className="text-gray-500">No order found with that number.</p>
          )}
        </div>
      )}
    </div>
  );
}

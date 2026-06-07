"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import Link from "next/link";

export default function CartPage() {
  const { items, remove, clear, total } = useCart();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!email || items.length === 0) {
      setError("Please provide a valid email before checking out.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount: Math.round(total * 100),
          metadata: { items },
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Unable to start Paystack checkout.");
      }

      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start payment.");
      setLoading(false);
    }
  };

  if (items.length === 0)
    return (
      <div className="w-[90%] max-w-2xl mx-auto py-16 md:py-24">
        <h1 className="text-xl md:text-2xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-600">Your cart is empty.</p>
        <Link href="/shop" className="text-green-700 mt-4 inline-block">Continue shopping</Link>
      </div>
    );

  return (
    <div className="w-[90%] max-w-2xl mx-auto py-16 md:py-24">
      <h1 className="text-xl md:text-2xl font-bold mb-4">Your Cart</h1>
      <ul className="space-y-4">
        {items.map((it) => (
          <li key={it.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2 border-b border-gray-100">
            <div>
              <div className="font-medium">{it.name}</div>
              <div className="text-sm text-gray-500">Quantity: {it.quantity}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-medium">₦{(it.price * it.quantity).toFixed(2)}</div>
              <button className="text-red-600 text-sm" onClick={() => remove(it.id)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Email for payment</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="customer@example.com"
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="font-bold">Total: ₦{total.toFixed(2)}</div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 text-sm md:text-base" onClick={() => clear()}>Clear</button>
            <button
              className="px-4 py-2 bg-green-900 text-white disabled:cursor-not-allowed disabled:bg-gray-300 text-sm md:text-base"
              onClick={handleCheckout}
              disabled={!email || loading}
            >
              {loading ? "Processing..." : "Pay with Paystack"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

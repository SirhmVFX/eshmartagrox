"use client";

import { useCart } from "@/lib/cart";
import Link from "next/link";

export default function CartPage() {
  const { items, remove, clear, total } = useCart();

  if (items.length === 0)
    return (
      <div className="w-[90%] max-w-2xl mx-auto py-24">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-600">Your cart is empty.</p>
        <Link href="/shop" className="text-green-700 mt-4 inline-block">Continue shopping</Link>
      </div>
    );

  return (
    <div className="w-[90%] max-w-2xl mx-auto py-24">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      <ul className="space-y-4">
        {items.map((it) => (
          <li key={it.id} className="flex justify-between items-center">
            <div>
              <div className="font-medium">{it.name}</div>
              <div className="text-sm text-gray-500">Quantity: {it.quantity}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-medium">₦{(it.price * it.quantity).toFixed(2)}</div>
              <button className="text-red-600" onClick={() => remove(it.id)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex justify-between items-center">
        <div className="font-bold">Total: ₦{total.toFixed(2)}</div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-100" onClick={() => clear()}>Clear</button>
          <button className="px-4 py-2 bg-green-900 text-white">Checkout (demo)</button>
        </div>
      </div>
    </div>
  );
}

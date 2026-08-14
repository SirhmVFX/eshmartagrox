"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { getSubscriptionPackages, validateCoupon, CouponValidationResult, SubscriptionPackage } from "@/lib/firestore";
import { useCurrency } from "@/lib/currency";
import { Tag, X } from "lucide-react";

const FALLBACK_PACKAGE_ITEMS: Record<string, string[]> = {
  "Senior Wellness": ["Fresh ugu, spinach & garden eggs", "Ofada / brown rice", "Beans & soybeans", "Fish & lean protein", "Seasonal fruits"],
  "Family of Four": ["Rice, yam & plantain", "Beans & legumes", "Fish & chicken", "Vegetables & fruits weekly", "Free delivery & swap"],
  "Student Smart Pack": ["Rice, noodles & spaghetti", "Eggs & beans", "Tomatoes & vegetables", "Quick-prep proteins"],
  "Working Professional": ["Lean proteins", "Smart carbs", "Salad & greens", "Healthy snacks"],
};

export default function CartPage() {
  const { items, remove, clear, total } = useCart();
  const { user } = useAuth();
  const { format, selected } = useCurrency();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState<CouponValidationResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);

  useEffect(() => {
    getSubscriptionPackages().then(setPackages).catch(() => {});
  }, []);

  function itemContents(it: { id: string; name: string; contents?: string[] }) {
    if (it.contents?.length) return it.contents.filter(Boolean);
    const pkg = packages.find(p => p.id === it.id || p.name === it.name);
    return (pkg?.items ?? FALLBACK_PACKAGE_ITEMS[it.name] ?? []).filter(Boolean);
  }

  const discountAmount = couponResult?.valid ? (couponResult.discountAmount ?? 0) : 0;
  const finalTotal = couponResult?.valid ? (couponResult.finalTotal ?? total) : total;

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    setCouponResult(null);
    const result = await validateCoupon(couponCode, total);
    if (result.valid) {
      setCouponResult(result);
    } else {
      setCouponError(result.error ?? "Invalid coupon.");
    }
    setCouponLoading(false);
  }

  function removeCoupon() {
    setCouponResult(null);
    setCouponError(null);
    setCouponCode("");
  }

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
          amount: Math.round(finalTotal * 100),
          metadata: {
            items,
            couponCode: couponResult?.code ?? null,
            discountAmount,
            userId: user?.uid ?? null,
          },
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

      {/* Cart items */}
      <ul className="space-y-4">
        {items.map((it) => {
          const contents = itemContents(it);
          return (
          <li key={it.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 py-3 border-b border-gray-100">
            <div className="min-w-0">
              <div className="font-medium">{it.name}</div>
              <div className="text-sm text-gray-500">
                Quantity: {it.quantity}
                {it.period ? <span className="text-gray-400"> · {it.period.replace(/^\s*\//, "").trim()}</span> : null}
              </div>
              {contents.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {contents.map((line) => (
                    <li key={line} className="text-xs text-gray-500 flex items-start gap-1.5">
                      <span className="text-green-700 mt-px">✓</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="font-medium">{format(it.price * it.quantity)}</div>
              <button className="text-red-600 text-sm" onClick={() => remove(it.id)}>Remove</button>
            </div>
          </li>
          );
        })}
      </ul>

      {/* Order summary */}
      <div className="mt-6 space-y-4">

        {/* Subtotal */}
        <div className="flex justify-between text-sm text-gray-600 border-t border-gray-100 pt-4">
          <span>Subtotal</span>
          <span>{format(total)}</span>
        </div>

        {/* Coupon */}
        {!couponResult?.valid ? (
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1">
              <Tag size={15} className="text-green-700" /> Coupon Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                placeholder="Enter coupon code"
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-mono uppercase tracking-wider"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold disabled:opacity-50 hover:bg-green-900 transition-colors"
              >
                {couponLoading ? "…" : "Apply"}
              </button>
            </div>
            {couponError && (
              <p className="text-xs text-red-600 mt-1.5">{couponError}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm">
              <Tag size={15} className="text-green-700" />
              <span className="font-mono font-bold text-green-800">{couponResult.code}</span>
              <span className="text-green-700">
                — {couponResult.discountType === "percentage"
                  ? `${couponResult.discountValue}% off`
                  : `${format(couponResult.discountValue ?? 0)} off`}
              </span>
            </div>
            <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500 transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Discount line */}
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-700 font-medium">
            <span>Discount</span>
            <span>− {format(discountAmount)}</span>
          </div>
        )}

        {/* Final total */}
        <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-3">
          <span>Total</span>
          <span>
            {format(finalTotal)}
            {discountAmount > 0 && (
              <span className="text-xs text-green-600 font-normal ml-2">
                (saved {format(discountAmount)})
              </span>
            )}
          </span>
        </div>

        {/* Email */}
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
          <button className="px-4 py-2 bg-gray-100 text-sm md:text-base" onClick={() => clear()}>Clear Cart</button>
          <button
            className="px-4 py-2 bg-green-900 text-white disabled:cursor-not-allowed disabled:bg-gray-300 text-sm md:text-base"
            onClick={handleCheckout}
            disabled={!email || loading}
          >
            {loading ? "Processing..." : `Pay ${format(finalTotal)} with Paystack`}
          </button>
        </div>
      </div>
    </div>
  );
}

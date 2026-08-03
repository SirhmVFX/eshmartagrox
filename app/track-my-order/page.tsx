"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCurrency } from "@/lib/currency";
import {
  CheckCircle, Circle, Clock, Truck, Home, XCircle, AlertCircle,
  PackageCheck, MapPin, Package,
} from "lucide-react";

// ── Status definitions ─────────────────────────────────────────────────────

interface StatusStep {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: StatusStep[] = [
  { key: "received", label: "Order Received", description: "We've received your order and confirmed your payment.", icon: PackageCheck },
  { key: "pending", label: "Pending", description: "Your order is queued and awaiting fulfilment.", icon: Clock },
  { key: "processing", label: "Processing", description: "Your items are being picked, packed, and quality-checked.", icon: AlertCircle },
  { key: "shipped", label: "Shipped", description: "Your order has left our facility and is on its way.", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", description: "Your order is with the delivery team and arriving today.", icon: MapPin },
  { key: "delivered", label: "Delivered", description: "Your order has been delivered successfully. Enjoy!", icon: Home },
];

const ACTIVE_KEYS = STEPS.map(s => s.key);

function stepIndex(status: string): number {
  return ACTIVE_KEYS.indexOf(status);
}

// ── Types ──────────────────────────────────────────────────────────────────

interface OrderItem {
  productName: string;
  quantity: number;
  productPrice: number;
  subtotal?: number;
  size?: string;
  color?: string;
}

interface Order {
  id: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  paymentReference?: string;
  totalAmount?: number;
  status?: string;
  paymentStatus?: string;
  items?: OrderItem[];
  createdAt?: any;
  updatedAt?: any;
}

function fmtDate(val: any): string {
  if (!val) return "—";
  try {
    const d = val?.toDate ? val.toDate() : typeof val === "string" ? new Date(val) : new Date(val);
    return d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch { return "—"; }
}

// ── Timeline component ─────────────────────────────────────────────────────

function OrderTimeline({ status }: { status?: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700">
        <XCircle size={20} />
        <div>
          <p className="font-semibold text-sm">Order Cancelled</p>
          <p className="text-xs mt-0.5">This order has been cancelled. Contact us if you have questions.</p>
        </div>
      </div>
    );
  }

  const current = stepIndex(status ?? "");
  const isDelivered = status === "delivered";

  return (
    <div className="space-y-0">
      {STEPS.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        const Icon = step.icon;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={step.key} className="flex gap-4">
            {/* Spine */}
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${active && isDelivered ? "bg-green-700 border-green-700 text-white" :
                active ? "bg-green-900 border-green-900 text-white" :
                  done ? "bg-green-50 border-green-500 text-green-600" :
                    "bg-white border-gray-200 text-gray-300"
                }`}>
                <Icon size={15} />
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[28px] my-1 ${i < current ? "bg-green-500" : "bg-gray-200"}`} />
              )}
            </div>

            {/* Content */}
            <div className={`pb-6 flex-1 min-w-0 ${isLast ? "pb-0" : ""}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`text-sm font-semibold ${done ? "text-gray-900" : "text-gray-400"}`}>
                  {step.label}
                </p>
                {active && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800 px-2 py-0.5">
                    Current Status
                  </span>
                )}
                {done && !active && (
                  <CheckCircle size={13} className="text-green-500" />
                )}
              </div>
              {done && (
                <p className={`text-xs mt-0.5 ${active ? "text-gray-700" : "text-gray-400"}`}>
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

function TrackOrderInner() {
  const searchParams = useSearchParams();
  const { format } = useCurrency();
  const [input, setInput] = useState(searchParams?.get("ref") ?? searchParams?.get("email") ?? "");
  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Auto-search if ref/email is in URL
  useEffect(() => {
    const ref = searchParams?.get("ref") ?? searchParams?.get("email");
    if (ref) {
      setInput(ref);
      runSearch(ref);
    }
  }, []);

  async function runSearch(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const byEmail = await getDocs(query(collection(db, "orders"), where("customerEmail", "==", q)));
      const byRef = await getDocs(query(collection(db, "orders"), where("paymentReference", "==", q)));
      const byId = q.length >= 6
        ? await getDocs(query(collection(db, "orders"), where("id", "==", q)))
        : { docs: [] };

      const seen = new Set<string>();
      const results: Order[] = [];
      [...byEmail.docs, ...byRef.docs, ...(byId as any).docs].forEach(d => {
        if (!seen.has(d.id)) { seen.add(d.id); results.push({ id: d.id, ...d.data() } as Order); }
      });
      results.sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() ?? new Date(a.createdAt ?? 0).getTime();
        const tb = b.createdAt?.toMillis?.() ?? new Date(b.createdAt ?? 0).getTime();
        return tb - ta;
      });
      setOrders(results);
      if (results.length === 1) setExpandedId(results[0].id);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); runSearch(input); };

  return (
    <div className="w-[90%] max-w-2xl mx-auto py-12 md:py-20">
      <h1 className="text-2xl md:text-4xl font-bold text-green-900 mb-2">Track My Order</h1>
      <p className="text-gray-500 text-sm md:text-base mb-8">
        Enter the email address you used at checkout, or your Paystack payment reference.
      </p>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-8">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Email address or payment reference"
          className="flex-1 border border-gray-300 p-3 md:p-4 text-sm outline-none focus:border-green-900"
          required
        />
        <button type="submit" disabled={loading} className="bg-green-900 text-white px-6 py-3 hover:bg-green-800 disabled:bg-gray-300 text-sm transition-colors font-semibold">
          {loading ? "Searching…" : "Track Order"}
        </button>
      </form>

      {/* No results */}
      {searched && orders.length === 0 && (
        <div className="border border-gray-200 p-8 text-center space-y-2">
          <Package size={36} className="text-gray-300 mx-auto" />
          <p className="text-gray-600 text-sm font-medium">No orders found</p>
          <p className="text-gray-400 text-xs">Try your email address or the reference from your payment confirmation.</p>
        </div>
      )}

      {/* Results */}
      {orders.length > 0 && (
        <div className="space-y-4">
          {orders.length > 1 && (
            <p className="text-xs text-gray-500">{orders.length} orders found</p>
          )}
          {orders.map(order => {
            const isExpanded = expandedId === order.id;
            const status = order.status ?? "pending";
            const stepIdx = stepIndex(status);
            const meta = STEPS[stepIdx] ?? STEPS[0];
            const StatusIcon = status === "cancelled" ? XCircle : (meta?.icon ?? Circle);
            const isCancelled = status === "cancelled";

            return (
              <div key={order.id} className="border border-gray-200 overflow-hidden">
                {/* Order summary row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 transition"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-bold text-sm text-gray-900">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">{fmtDate(order.createdAt)}</span>
                    </div>
                    {order.totalAmount != null && (
                      <span className="text-sm font-bold text-green-700">{format(order.totalAmount)}</span>
                    )}
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-bold shrink-0 ${isCancelled ? "text-red-500" : "text-green-800"}`}>
                    <StatusIcon size={14} />
                    {isCancelled ? "Cancelled" : meta?.label ?? status}
                  </div>
                </button>

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50">

                    {/* Status timeline */}
                    <div className="p-5 border-b border-gray-100">
                      <p className="text-xs font-semibold uppercase text-gray-500 mb-4">Order Status</p>
                      <OrderTimeline status={status} />
                    </div>

                    {/* Customer info */}
                    <div className="p-5 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {order.customerName && (
                        <div>
                          <p className="text-[10px] uppercase text-gray-400 font-semibold">Customer</p>
                          <p className="text-sm text-gray-800">{order.customerName}</p>
                        </div>
                      )}
                      {order.customerEmail && (
                        <div>
                          <p className="text-[10px] uppercase text-gray-400 font-semibold">Email</p>
                          <p className="text-sm text-gray-800">{order.customerEmail}</p>
                        </div>
                      )}
                      {order.customerPhone && (
                        <div>
                          <p className="text-[10px] uppercase text-gray-400 font-semibold">Phone</p>
                          <p className="text-sm text-gray-800">{order.customerPhone}</p>
                        </div>
                      )}
                      {order.customerAddress && (
                        <div className="sm:col-span-2">
                          <p className="text-[10px] uppercase text-gray-400 font-semibold">Delivery Address</p>
                          <p className="text-sm text-gray-800">{order.customerAddress}</p>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    {order.items && order.items.length > 0 && (
                      <div className="p-5 border-b border-gray-100">
                        <p className="text-xs font-semibold uppercase text-gray-500 mb-3">
                          Items ({order.items.length})
                        </p>
                        <div className="space-y-2">
                          {order.items.map((it, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                              <div>
                                <span className="text-gray-800">{it.productName}</span>
                                <span className="text-gray-400"> × {it.quantity}</span>
                                {(it.size || it.color) && (
                                  <span className="text-xs text-gray-400 ml-2">
                                    {[it.size, it.color].filter(Boolean).join(" / ")}
                                  </span>
                                )}
                              </div>
                              <span className="font-medium text-gray-800">
                                {format((it.subtotal ?? it.productPrice * it.quantity))}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between font-bold text-sm pt-3 border-t border-gray-200 mt-3">
                          <span>Order Total</span>
                          <span className="text-green-700">{format(order.totalAmount ?? 0)}</span>
                        </div>
                      </div>
                    )}

                    {/* Payment info */}
                    <div className="p-5 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-400 uppercase font-semibold mb-0.5">Payment Status</p>
                        <p className={`font-bold ${order.paymentStatus === "paid" ? "text-green-700" : "text-orange-600"}`}>
                          {order.paymentStatus?.toUpperCase() ?? "—"}
                        </p>
                      </div>
                      {order.paymentReference && (
                        <div>
                          <p className="text-gray-400 uppercase font-semibold mb-0.5">Reference</p>
                          <p className="font-mono text-gray-700 break-all">{order.paymentReference}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-10 text-xs text-gray-400 text-center">
        Need help?{" "}
        <Link href="/contact" className="text-green-900 hover:underline">Contact our support team</Link>
      </p>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="w-[90%] max-w-2xl mx-auto py-12 md:py-20 text-center text-gray-400 text-sm">
        Loading…
      </div>
    }>
      <TrackOrderInner />
    </Suspense>
  );
}

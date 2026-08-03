import React from "react";
import Link from "next/link";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, limit } from "firebase/firestore";

export const dynamic = "force-dynamic";

// ── Firebase client for server component ─────────────────────────────────
function getServerDb() {
  const cfg = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const existing = getApps().find(a => a.name === "payment-success");
  const app = existing ?? initializeApp(cfg, "payment-success");
  return getFirestore(app);
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function verifyTransaction(reference: string, secretKey: string) {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey}` }, cache: "no-store" }
  );
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status) return null;
  return json.data as Record<string, any>;
}

async function recordOrderDirect(transaction: Record<string, any>) {
  try {
    const db = getServerDb();
    const reference: string = transaction.reference ?? "";
    const customerEmail: string = transaction.customer?.email ?? "";
    const amountKobo: number = transaction.amount ?? 0;
    const items = Array.isArray(transaction.metadata?.items) ? transaction.metadata.items : [];
    const userId: string | null = typeof transaction.metadata?.userId === "string"
      ? transaction.metadata.userId : null;
    const couponCode: string | null = typeof transaction.metadata?.couponCode === "string"
      ? transaction.metadata.couponCode : null;
    const discountAmount: number = typeof transaction.metadata?.discountAmount === "number"
      ? transaction.metadata.discountAmount : 0;

    if (!reference || !customerEmail) return null;

    // Idempotency: don't create duplicate order
    const existing = await getDocs(
      query(collection(db, "orders"), where("paymentReference", "==", reference), limit(1))
    );
    if (!existing.empty) return existing.docs[0].id;

    const orderItems = items.map((it: any) => ({
      productId: it.id ?? "",
      productName: it.name ?? "Unknown",
      productImage: "",
      productPrice: it.price ?? 0,
      size: "",
      color: "",
      quantity: it.quantity ?? 1,
      subtotal: (it.price ?? 0) * (it.quantity ?? 1),
    }));

    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, "orders"), {
      customerName: transaction.customer?.first_name
        ? `${transaction.customer.first_name} ${transaction.customer.last_name ?? ""}`.trim()
        : customerEmail.split("@")[0],
      customerEmail,
      customerPhone: "",
      customerAddress: "",
      items: orderItems,
      totalAmount: amountKobo / 100,
      paymentMethod: "card",
      paymentStatus: "paid",
      paymentReference: reference,
      status: "received",
      userId,
      couponCode,
      discountAmount,
      notes: `Paystack ref: ${reference}`,
      createdAt: now,
      updatedAt: now,
    });

    // Write notification if logged-in user
    if (userId) {
      await addDoc(collection(db, "orderNotifications"), {
        userId,
        orderId: docRef.id,
        orderRef: docRef.id.slice(-8).toUpperCase(),
        title: "Order Received",
        message: "We've received your order and confirmed your payment. We'll keep you updated as it progresses.",
        status: "received",
        read: false,
        createdAt: now,
      });
    }

    return docRef.id;
  } catch (err) {
    console.error("[payment-success] Failed to record order:", err);
    return null;
  }
}

function fmtNGN(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Page ───────────────────────────────────────────────────────────────────

type Props = {
  searchParams: Promise<{ reference?: string | string[] }>;
};

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

  const resolvedParams = await searchParams;
  const reference = Array.isArray(resolvedParams.reference)
    ? resolvedParams.reference[0]
    : resolvedParams.reference;

  if (!reference) {
    return (
      <div className="w-[90%] max-w-2xl mx-auto pt-24 pb-16 space-y-4">
        <h1 className="text-2xl font-bold">Payment verification failed</h1>
        <p className="text-gray-600">No payment reference was provided. Please return to your cart and try again.</p>
        <Link href="/cart" className="inline-block bg-green-900 text-white px-6 py-3 text-sm hover:bg-green-800 transition">
          ← Back to Cart
        </Link>
      </div>
    );
  }

  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(reference)) {
    return (
      <div className="w-[90%] max-w-2xl mx-auto pt-24 pb-16 space-y-4">
        <h1 className="text-2xl font-bold">Invalid reference</h1>
        <p className="text-gray-600">The payment reference is malformed.</p>
        <Link href="/shop" className="text-green-900 hover:underline">← Back to shop</Link>
      </div>
    );
  }

  if (!PAYSTACK_SECRET_KEY) {
    return (
      <div className="w-[90%] max-w-2xl mx-auto pt-24 pb-16 space-y-4">
        <h1 className="text-2xl font-bold">Payment not configured</h1>
        <p className="text-gray-600">
          Please contact support with your reference:{" "}
          <code className="font-mono text-sm bg-gray-100 px-1">{reference}</code>
        </p>
      </div>
    );
  }

  const transaction = await verifyTransaction(reference, PAYSTACK_SECRET_KEY);

  if (!transaction) {
    return (
      <div className="w-[90%] max-w-2xl mx-auto pt-24 pb-16 space-y-4">
        <h1 className="text-2xl font-bold">Verification failed</h1>
        <p className="text-gray-600">
          We could not verify your payment. If money was deducted, contact us with reference:{" "}
          <code className="font-mono text-sm bg-gray-100 px-1">{reference}</code>
        </p>
        <Link href="/contact" className="text-green-900 hover:underline">Contact support →</Link>
      </div>
    );
  }

  const txStatus: string = transaction.status ?? "";
  const isPaid = txStatus === "success";

  if (!isPaid) {
    return (
      <div className="w-[90%] max-w-2xl mx-auto pt-24 pb-16 space-y-4">
        <h1 className="text-2xl font-bold text-red-700">Payment not completed</h1>
        <p className="text-gray-600">
          Status: <strong>{txStatus || "unknown"}</strong>. Your card was not charged.
        </p>
        <div className="flex gap-4">
          <Link href="/cart" className="bg-green-900 text-white px-6 py-3 text-sm hover:bg-green-800 transition">
            Back to Cart
          </Link>
          <Link href="/contact" className="border border-green-900 text-green-900 px-6 py-3 text-sm hover:bg-green-50 transition">
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  // ── Write order directly to Firestore ────────────────────────────────
  await recordOrderDirect(transaction);

  const customerEmail: string = transaction.customer?.email ?? "";
  const amountPaid: number = transaction.amount ?? 0;
  const items: { name?: string; quantity?: number; price?: number }[] =
    Array.isArray(transaction.metadata?.items) ? transaction.metadata.items : [];
  const userId: string | null = typeof transaction.metadata?.userId === "string"
    ? transaction.metadata.userId : null;
  const couponCode: string | null = typeof transaction.metadata?.couponCode === "string"
    ? transaction.metadata.couponCode : null;
  const discountAmount: number = typeof transaction.metadata?.discountAmount === "number"
    ? transaction.metadata.discountAmount : 0;

  return (
    <div className="w-[90%] max-w-2xl mx-auto pt-16 md:pt-24 pb-16 md:pb-24">
      {/* Success header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-green-900 flex items-center justify-center rounded-full shrink-0">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payment Confirmed!</h1>
          <p className="text-gray-500 text-sm mt-0.5">Your order is received and will be processed shortly.</p>
        </div>
      </div>

      {/* Order summary */}
      <div className="border border-gray-200 bg-white p-5 md:p-6 space-y-4 mb-6">
        <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Order Summary</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400 text-xs uppercase mb-0.5">Reference</p>
            <p className="font-mono font-semibold text-gray-900 break-all text-xs md:text-sm">
              {transaction.reference}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase mb-0.5">Email</p>
            <p className="font-medium text-gray-900 break-all text-xs md:text-sm">{customerEmail}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase mb-0.5">Amount Paid</p>
            <p className="font-bold text-green-700 text-base">{fmtNGN(amountPaid)}</p>
          </div>
          {discountAmount > 0 && (
            <div>
              <p className="text-gray-400 text-xs uppercase mb-0.5">
                Discount{couponCode ? ` (${couponCode})` : ""}
              </p>
              <p className="font-medium text-green-600">− {fmtNGN(discountAmount * 100)}</p>
            </div>
          )}
          <div>
            <p className="text-gray-400 text-xs uppercase mb-0.5">Status</p>
            <p className="font-semibold text-green-600 capitalize">{txStatus}</p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <p className="text-xs font-semibold uppercase text-gray-500 mb-2">Items Ordered</p>
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-700">
                <span>
                  {item.name ?? `Item ${i + 1}`}
                  <span className="text-gray-400"> × {item.quantity ?? 1}</span>
                </span>
                {item.price != null && (
                  <span className="font-medium">
                    {fmtNGN((item.price ?? 0) * (item.quantity ?? 1) * 100)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next steps */}
      <div className="bg-green-50 border border-green-200 px-5 py-4 text-sm text-green-800 mb-8 space-y-1">
        <p className="font-semibold">What happens next?</p>
        <ul className="list-disc list-inside space-y-0.5 text-green-700">
          <li>We'll process your order and update its status.</li>
          {userId && <li>You'll receive in-app notifications as your order progresses.</li>}
          <li>Use your reference below to track your order at any time.</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <Link
          href={`/track-my-order?ref=${encodeURIComponent(transaction.reference)}`}
          className="bg-green-900 text-white px-6 py-3 text-sm hover:bg-green-800 transition font-medium text-center"
        >
          Track This Order
        </Link>
        {userId && (
          <Link
            href="/profile"
            className="border border-green-900 text-green-900 px-6 py-3 text-sm hover:bg-green-50 transition font-medium text-center"
          >
            View My Orders
          </Link>
        )}
        <Link
          href="/shop"
          className="border border-gray-300 text-gray-700 px-6 py-3 text-sm hover:border-gray-500 transition font-medium text-center"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

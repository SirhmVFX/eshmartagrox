import React from "react";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
if (!PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY must be set in environment variables.");
}

type Props = {
  searchParams: {
    reference?: string | string[];
  };
};

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const reference = Array.isArray(searchParams.reference)
    ? searchParams.reference[0]
    : searchParams.reference;

  if (!reference) {
    return (
      <div className="w-[90%] max-w-2xl mx-auto py-24">
        <h1 className="text-2xl font-bold mb-4">Payment verification failed</h1>
        <p className="text-gray-600">No reference was provided. Please return to your cart and try again.</p>
      </div>
    );
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
      next: { revalidate: 0 },
    }
  );

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.status) {
    return (
      <div className="w-[90%] max-w-2xl mx-auto py-24">
        <h1 className="text-2xl font-bold mb-4">Payment verification failed</h1>
        <p className="text-gray-600">{data?.message || "Unable to verify this payment."}</p>
      </div>
    );
  }

  const transaction = data.data;
  const items = Array.isArray(transaction?.metadata?.items) ? transaction.metadata.items : [];

  return (
    <div className="w-[90%] max-w-2xl mx-auto py-24">
      <h1 className="text-2xl font-bold mb-4">Payment confirmed</h1>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-gray-700 mb-2">Reference: <span className="font-medium">{transaction.reference}</span></p>
        <p className="text-gray-700 mb-2">Status: <span className="font-medium">{transaction.status}</span></p>
        <p className="text-gray-700 mb-2">Customer: <span className="font-medium">{transaction.customer?.email || transaction.customer_email}</span></p>
        <p className="text-gray-700 mb-4">Amount paid: <span className="font-medium">₦{(transaction.amount / 100).toFixed(2)}</span></p>
        {items.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold">Order details</h2>
            <ul className="space-y-2">
              {items.map((item: any, index: number) => (
                <li key={index} className="border rounded-xl p-3 bg-gray-50">
                  <p className="font-medium">{item.name || item.title || `Item ${index + 1}`}</p>
                  {item.quantity != null && <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>}
                  {item.price != null && <p className="text-sm text-gray-600">Price: {item.price}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

import { NextResponse } from "next/server";

// Maximum order value accepted server-side (₦5,000,000 = 500_000_000 kobo).
const MAX_AMOUNT_KOBO = 500_000_000;

export async function POST(request: Request) {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_SECRET_KEY) {
    console.error("PAYSTACK_SECRET_KEY is not set");
    return NextResponse.json({ error: "Payment is not configured." }, { status: 503 });
  }

  // ── Parse body ────────────────────────────────────────────────────────
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const amount = Number(payload.amount); // kobo

  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  // Validate amount
  if (!Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json({ error: "Amount must be a positive integer (kobo)." }, { status: 400 });
  }
  if (amount > MAX_AMOUNT_KOBO) {
    return NextResponse.json(
      { error: "Order value exceeds the maximum allowed. Contact us for large orders." },
      { status: 400 }
    );
  }

  // ── Build callback URL ────────────────────────────────────────────────
  // Use NEXT_PUBLIC_BASE_URL so it works on localhost AND in production.
  // Paystack ignores localhost URLs in test mode which is why the redirect breaks.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "")
    || new URL(request.url).origin;
  const callbackUrl = `${baseUrl}/cart/payment-success`;

  // ── Sanitise metadata ─────────────────────────────────────────────────
  // Keep it lean — only what the success page and order creation need.
  const rawMeta = payload.metadata;
  let metadata: Record<string, unknown> = {};
  if (rawMeta !== null && typeof rawMeta === "object" && !Array.isArray(rawMeta)) {
    const m = rawMeta as Record<string, unknown>;

    // Items: cap at 100, only safe scalar fields
    if (Array.isArray(m.items)) {
      metadata.items = m.items.slice(0, 100).map((it: unknown) => {
        if (typeof it !== "object" || it === null) return {};
        const item = it as Record<string, unknown>;
        return {
          id: typeof item.id === "string" ? item.id.slice(0, 128) : "",
          name: typeof item.name === "string" ? item.name.slice(0, 256) : "",
          price: typeof item.price === "number" ? item.price : 0,
          quantity: typeof item.quantity === "number" ? Math.floor(item.quantity) : 1,
        };
      });
    }

    // User ID — for linking the order to an account
    if (typeof m.userId === "string") {
      metadata.userId = m.userId.slice(0, 128);
    }

    // Coupon / discount info
    if (typeof m.couponCode === "string") {
      metadata.couponCode = m.couponCode.slice(0, 64);
    }
    if (typeof m.discountAmount === "number") {
      metadata.discountAmount = m.discountAmount;
    }
  }

  // ── Call Paystack ─────────────────────────────────────────────────────
  let paystackResponse: Response;
  try {
    paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, amount, callback_url: callbackUrl, metadata }),
    });
  } catch (networkErr) {
    console.error("Paystack network error:", networkErr);
    return NextResponse.json(
      { error: "Could not reach payment provider. Please try again." },
      { status: 502 }
    );
  }

  let data: Record<string, unknown> | null = null;
  try { data = await paystackResponse.json(); } catch { /* leave null */ }

  if (!paystackResponse.ok || !data?.status) {
    const msg = typeof (data as any)?.message === "string"
      ? (data as any).message
      : "Payment initialization failed.";
    return NextResponse.json({ error: msg }, { status: paystackResponse.status || 500 });
  }

  const txData = (data as any).data;
  return NextResponse.json({
    authorizationUrl: txData.authorization_url,
    reference: txData.reference,
    accessCode: txData.access_code,
  });
}

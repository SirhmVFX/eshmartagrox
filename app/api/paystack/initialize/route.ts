import { NextResponse } from "next/server";

// Maximum order value accepted server-side (₦5,000,000 = 500_000_000 kobo).
// Adjust upward if you sell high-value bulk orders.
const MAX_AMOUNT_KOBO = 500_000_000;

// Allowed callback origin — prevents open redirects.
function isSafeCallbackUrl(url: string, requestOrigin: string): boolean {
  try {
    const parsed = new URL(url);
    const allowed = new URL(requestOrigin);
    return parsed.origin === allowed.origin;
  } catch {
    return false;
  }
}

function getDefaultCallbackUrl(request: Request): string {
  const url = new URL(request.url);
  return `${url.origin}/cart/payment-success`;
}

export async function POST(request: Request) {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_SECRET_KEY) {
    console.error("PAYSTACK_SECRET_KEY is not set");
    return NextResponse.json({ error: "Payment is not configured." }, { status: 503 });
  }

  // ── Parse and validate body ───────────────────────────────────────────
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const amount = Number(payload.amount); // kobo (integer)

  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  // Validate amount: must be a positive integer, max capped
  if (!Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json({ error: "Amount must be a positive integer (kobo)." }, { status: 400 });
  }
  if (amount > MAX_AMOUNT_KOBO) {
    return NextResponse.json(
      { error: "Order value exceeds the maximum allowed amount. Please contact us for large orders." },
      { status: 400 }
    );
  }

  // Validate callback URL — only allow same-origin to prevent open redirect
  const requestOrigin = new URL(request.url).origin;
  const defaultCallback = getDefaultCallbackUrl(request);
  let callbackUrl = defaultCallback;
  if (typeof payload.callbackUrl === "string" && payload.callbackUrl) {
    if (!isSafeCallbackUrl(payload.callbackUrl, requestOrigin)) {
      return NextResponse.json({ error: "Invalid callback URL." }, { status: 400 });
    }
    callbackUrl = payload.callbackUrl;
  }

  // Metadata: only accept a plain object, strip any prototype tricks
  const rawMeta = payload.metadata;
  let metadata: Record<string, unknown> = {};
  if (rawMeta !== null && typeof rawMeta === "object" && !Array.isArray(rawMeta)) {
    // Shallow copy to prevent prototype pollution
    metadata = Object.assign(Object.create(null), rawMeta);
    // Ensure items array only has safe scalar fields
    if (Array.isArray(metadata.items)) {
      metadata.items = (metadata.items as unknown[]).slice(0, 100).map((it: unknown) => {
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
    // Allow userId (string) to pass through for order linking
    if (typeof metadata.userId !== "string") delete metadata.userId;
    else metadata.userId = (metadata.userId as string).slice(0, 128);
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
    return NextResponse.json({ error: "Could not reach payment provider. Please try again." }, { status: 502 });
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

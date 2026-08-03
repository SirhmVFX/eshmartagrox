import { NextResponse } from "next/server";
import { createHmac } from "crypto";

/**
 * Paystack Webhook Handler
 * ─────────────────────────────────────────────────────────────────────────
 * Set this URL in your Paystack dashboard → Settings → API Keys & Webhooks:
 *   https://yourdomain.com/api/paystack/webhook
 *
 * Security model:
 *   1. Verify HMAC-SHA512 signature using PAYSTACK_SECRET_KEY (server-only).
 *   2. Only process events from the "charge.success" event type.
 *   3. Only write to Firestore if the transaction is actually successful.
 *   4. Idempotency: check if order already exists by paymentReference before writing.
 *
 * This is a secondary confirmation path. The primary path is payment-success/page.tsx.
 * Webhooks handle cases where the user closes the browser before the callback fires.
 */

// Constant-time string comparison to prevent timing attacks
function safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

export async function POST(request: Request) {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";

    if (!PAYSTACK_SECRET_KEY) {
        // Misconfigured server — return 200 so Paystack doesn't retry forever,
        // but log the error so it's visible in server logs.
        console.error("[webhook] PAYSTACK_SECRET_KEY not configured");
        return NextResponse.json({ received: true }, { status: 200 });
    }

    // ── 1. Read raw body for HMAC verification ────────────────────────────
    const rawBody = await request.text();

    // ── 2. Verify HMAC-SHA512 signature ───────────────────────────────────
    const paystackSignature = request.headers.get("x-paystack-signature") ?? "";
    const expectedHash = createHmac("sha512", PAYSTACK_SECRET_KEY)
        .update(rawBody)
        .digest("hex");

    if (!safeCompare(paystackSignature, expectedHash)) {
        // Invalid signature — could be a spoofed request
        console.warn("[webhook] Invalid Paystack signature — request rejected");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // ── 3. Parse event ────────────────────────────────────────────────────
    let event: Record<string, any>;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const eventType: string = event.event ?? "";
    const transaction = event.data ?? {};

    // ── 4. Handle charge.success ──────────────────────────────────────────
    if (eventType === "charge.success" && transaction.status === "success") {
        const reference: string = transaction.reference ?? "";
        const customerEmail: string = transaction.customer?.email ?? "";
        const amountKobo: number = transaction.amount ?? 0;

        if (!reference || !customerEmail || amountKobo <= 0) {
            console.warn("[webhook] Skipping — missing required fields", { reference, customerEmail, amountKobo });
            return NextResponse.json({ received: true });
        }

        const items: unknown[] = Array.isArray(transaction.metadata?.items)
            ? transaction.metadata.items
            : [];
        const userId: string | null = typeof transaction.metadata?.userId === "string"
            ? transaction.metadata.userId
            : null;

        // Fire order creation (idempotency handled inside orders/create route
        // by checking paymentReference against existing orders)
        if (BASE_URL) {
            try {
                await fetch(`${BASE_URL}/api/orders/create`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        customerEmail,
                        customerName: transaction.customer?.first_name
                            ? `${transaction.customer.first_name} ${transaction.customer.last_name ?? ""}`.trim()
                            : customerEmail.split("@")[0],
                        reference,
                        amount: amountKobo,
                        items,
                        paymentStatus: transaction.status,
                        userId,
                        source: "webhook",
                    }),
                });
            } catch (err) {
                console.error("[webhook] Failed to record order:", err);
                // Still return 200 so Paystack doesn't retry the webhook
            }
        }
    }

    // Acknowledge all other events silently
    return NextResponse.json({ received: true }, { status: 200 });
}

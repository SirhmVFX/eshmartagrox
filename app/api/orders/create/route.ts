import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminDb() {
    if (!getApps().length) {
        initializeApp({
            credential: cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                // For client-side-only projects without admin SDK credentials,
                // we fall through to the REST API approach below.
                clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            }),
        });
    }
    return getFirestore();
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            customerEmail,
            customerName,
            reference,
            amount,
            items,
            paymentStatus,
            userId,
        } = body;

        if (!customerEmail || !reference || !amount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Build order items from cart items
        const orderItems = (items ?? []).map((it: { id?: string; name?: string; price?: number; quantity?: number }) => ({
            productId: it.id ?? "",
            productName: it.name ?? "Unknown",
            productImage: "",
            productPrice: it.price ?? 0,
            size: "",
            color: "",
            quantity: it.quantity ?? 1,
            subtotal: (it.price ?? 0) * (it.quantity ?? 1),
        }));

        const db = getAdminDb();

        // ── Idempotency check: skip if order for this reference already exists ──
        const existing = await db.collection("orders")
            .where("paymentReference", "==", reference)
            .limit(1)
            .get();
        if (!existing.empty) {
            const existingId = existing.docs[0].id;
            return NextResponse.json({ orderId: existingId, duplicate: true });
        }

        const ref = await db.collection("orders").add({
            customerName: customerName ?? "",
            customerEmail,
            customerPhone: "",
            customerAddress: "",
            items: orderItems,
            totalAmount: amount / 100,
            paymentMethod: "card",
            paymentStatus: paymentStatus === "success" ? "paid" : "unpaid",
            paymentReference: reference,
            status: "received",
            userId: userId ?? null,
            notes: `Paystack ref: ${reference}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        // Write initial notification if customer is logged in
        if (userId) {
            await db.collection("orderNotifications").add({
                userId,
                orderId: ref.id,
                orderRef: ref.id.slice(-8).toUpperCase(),
                title: "Order Received",
                message: "We've received your order and confirmed your payment. We'll keep you updated as it progresses.",
                status: "received",
                read: false,
                createdAt: new Date().toISOString(),
            });
        }

        return NextResponse.json({ orderId: ref.id });
    } catch (err) {
        console.error("Order creation error:", err);
        // If admin SDK is not configured, fail silently rather than breaking the success page
        return NextResponse.json({ error: "Order recording failed", detail: String(err) }, { status: 500 });
    }
}

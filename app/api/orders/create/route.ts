import { NextResponse } from "next/server";
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { initializeApp as initClientApp, getApps as getClientApps } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, limit } from "firebase/firestore";

// ── Firebase Admin SDK (preferred — has service-account write privileges) ──
function tryGetAdminDb() {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) return null;

    try {
        let app: App;
        if (!getApps().length) {
            app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
        } else {
            app = getApps()[0];
        }
        return getAdminFirestore(app);
    } catch {
        return null;
    }
}

// ── Firebase Client SDK fallback (uses the same project, no service account needed) ──
function getClientDb() {
    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    // Use a separate named app so it doesn't clash with the client-side instance
    const existing = getClientApps().find(a => a.name === "server-orders");
    const app = existing ?? initClientApp(firebaseConfig, "server-orders");
    return getFirestore(app);
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
            couponCode,
            discountAmount,
        } = body;

        if (!customerEmail || !reference || !amount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Build order items from cart items
        const orderItems = (items ?? []).map((it: {
            id?: string; name?: string; price?: number; quantity?: number;
        }) => ({
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
        const orderData = {
            customerName: customerName ?? "",
            customerEmail,
            customerPhone: "",
            customerAddress: "",
            items: orderItems,
            totalAmount: amount / 100,           // Paystack sends kobo → convert to NGN
            paymentMethod: "card",
            paymentStatus: paymentStatus === "success" ? "paid" : "unpaid",
            paymentReference: reference,
            status: "received",
            userId: userId ?? null,
            couponCode: couponCode ?? null,
            discountAmount: discountAmount ?? 0,
            notes: `Paystack ref: ${reference}`,
            createdAt: now,
            updatedAt: now,
        };

        // ── Try Admin SDK first, fall back to client SDK ──────────────────
        const adminDb = tryGetAdminDb();

        if (adminDb) {
            // Admin path — check idempotency then write
            const existing = await adminDb.collection("orders")
                .where("paymentReference", "==", reference)
                .limit(1)
                .get();

            if (!existing.empty) {
                return NextResponse.json({ orderId: existing.docs[0].id, duplicate: true });
            }

            const ref = await adminDb.collection("orders").add(orderData);

            if (userId) {
                await adminDb.collection("orderNotifications").add({
                    userId,
                    orderId: ref.id,
                    orderRef: ref.id.slice(-8).toUpperCase(),
                    title: "Order Received",
                    message: "We've received your order and confirmed your payment. We'll keep you updated as it progresses.",
                    status: "received",
                    read: false,
                    createdAt: now,
                });
            }

            return NextResponse.json({ orderId: ref.id });
        }

        // ── Client SDK fallback (no service account) ──────────────────────
        const db = getClientDb();

        // Idempotency check
        const existingSnap = await getDocs(
            query(collection(db, "orders"), where("paymentReference", "==", reference), limit(1))
        );
        if (!existingSnap.empty) {
            return NextResponse.json({ orderId: existingSnap.docs[0].id, duplicate: true });
        }

        const docRef = await addDoc(collection(db, "orders"), orderData);

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

        return NextResponse.json({ orderId: docRef.id });

    } catch (err) {
        console.error("Order creation error:", err);
        return NextResponse.json(
            { error: "Order recording failed", detail: String(err) },
            { status: 500 }
        );
    }
}

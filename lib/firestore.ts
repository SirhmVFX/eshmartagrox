/**
 * Client-side Firestore readers — reads from the same collections
 * the eshmartagroxadmin writes to.
 */
import { collection, getDocs, query, orderBy, where, doc, getDoc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "./firebase";

// ── Types (matching admin's firestore.ts) ──────────────────────────────────

export interface HeroSlide {
    id?: string;
    image: string;
    headline: string;
    subheadline: string;
    ctaLabel: string;
    ctaHref: string;
    order: number;
    active: boolean;
}

export interface ProduceCard {
    id?: string;
    number: string;
    title: string;
    description: string;
    image: string;
    ctaLabel: string;
    ctaHref: string;
    order: number;
    active: boolean;
}

export interface QualityBlock {
    id?: string;
    title: string;
    description: string;
    order: number;
    active: boolean;
}

export interface CTA {
    id?: string;
    title: string;
    description: string;
    contactImage: string;
    secondaryTitle: string;
    secondaryDescription: string;
}

export interface SiteSettings {
    id?: string;
    siteName: string;
    tagline: string;
    title: string;
    description: string;
    logoUrl: string;
    faviconUrl: string;
    currency: string;
    currencySymbol: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    showSearch: boolean;
    showCart: boolean;
    showUser: boolean;
    shopBannerImage?: string;
    shopBannerTitle?: string;
}

export interface NavLink {
    id?: string;
    label: string;
    href: string;
    order: number;
    isVisible: boolean;
    active: boolean;
}

export interface PortfolioItem {
    id?: string;
    title: string;
    description: string;
    image: string;
    link?: string;
    order: number;
    active: boolean;
    content?: string;        // HTML from WYSIWYG — shown on detail page
    galleryImages?: string[]; // additional images shown on detail page
}

export interface Service {
    id?: string;
    title: string;
    duration: string;
    price: string;
    image: string;
    description: string;
    bookLabel: string;
    bookHref: string;
    order: number;
    active: boolean;
}

export interface BlogPost {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    author: string;
    publishedAt: string | null;
    active: boolean;
    order: number;
    tags: string[];
    readingTime?: string; // e.g. "5 min read"
}

export interface FirestoreProduct {
    id?: string;
    name: string;
    price: number;
    originalPrice?: number;
    category: string;
    subcategory?: string;
    images: string[];
    sizes: string[];
    colors: string[];
    description: string;
    details: string[];
    rating: number;
    reviews: number;
    inStock: boolean;
    isNew?: boolean;
    isBestSeller?: boolean;
    tags: string[];
    recommendedAddonIds?: string[];
}

export interface Testimonial {
    id?: string;
    name: string;
    location: string;
    text: string;
    rating: number;
    isVisible: boolean;
    imgSrc?: string;
    order?: number;
}

export interface TeamMember {
    id?: string;
    name: string;
    role: string;
    bio: string;
    image: string;
    order: number;
    isVisible: boolean;
}

export interface FAQ {
    id?: string;
    question: string;
    answer: string;
    order: number;
    isVisible: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function getOrdered<T>(col: string, field = "order"): Promise<T[]> {
    const snap = await getDocs(query(collection(db, col), orderBy(field)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

async function getAll<T>(col: string): Promise<T[]> {
    const snap = await getDocs(collection(db, col));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

// ── Public readers ─────────────────────────────────────────────────────────

// Hero Slides — active only, ordered
export async function getHeroSlides(): Promise<HeroSlide[]> {
    const snap = await getDocs(collection(db, "heroSlides"));
    return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as HeroSlide))
        .filter((s) => s.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export interface ProduceSection {
    id?: string;
    heading: string;
    subtext: string;
}

export async function getProduceSection(): Promise<ProduceSection | null> {
    const snap = await getDocs(collection(db, "produceSection"));
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as ProduceSection;
}

// Produce Cards — active only
export async function getProduceCards(): Promise<ProduceCard[]> {
    const snap = await getDocs(collection(db, "produceCards"));
    return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as ProduceCard))
        .filter((c) => c.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// Quality Blocks — active only
export async function getQualityBlocks(): Promise<QualityBlock[]> {
    const snap = await getDocs(collection(db, "qualityBlocks"));
    return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as QualityBlock))
        .filter((b) => b.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export interface QualitySection {
    id?: string;
    heading: string;
    mainImage: string;
    secondaryImage: string;
}

export async function getQualitySection(): Promise<QualitySection | null> {
    const snap = await getDocs(collection(db, "qualitySection"));
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as QualitySection;
}

// CTA (single doc)
export async function getCTA(): Promise<CTA | null> {
    const snap = await getDocs(collection(db, "cta"));
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as CTA;
}

// Site Settings (single doc)
export async function getSiteSettings(): Promise<SiteSettings | null> {
    const snap = await getDocs(collection(db, "settings"));
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as SiteSettings;
}

// Navigation — visible only
export async function getNavLinks(): Promise<NavLink[]> {
    const snap = await getDocs(collection(db, "navigation"));
    return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as NavLink))
        .filter((l) => l.isVisible && l.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// Portfolio — active only
export async function getPortfolioItems(): Promise<PortfolioItem[]> {
    const snap = await getDocs(collection(db, "portfolio"));
    return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as PortfolioItem))
        .filter((i) => i.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getPortfolioItem(id: string): Promise<PortfolioItem | null> {
    const snap = await getDoc(doc(db, "portfolio", id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as PortfolioItem;
}

// Services — active only
export async function getServices(): Promise<Service[]> {
    const snap = await getDocs(collection(db, "services"));
    return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Service))
        .filter((s) => s.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// Blog — active only
export async function getBlogPosts(): Promise<BlogPost[]> {
    const snap = await getDocs(collection(db, "blog"));
    return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as BlogPost))
        .filter((p) => p.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
    const snap = await getDoc(doc(db, "blog", id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as BlogPost;
}

// Products — from products collection
export async function getProducts(): Promise<FirestoreProduct[]> {
    const snap = await getDocs(collection(db, "products"));
    return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as FirestoreProduct))
        .filter((p) => p.inStock);
}

export async function getProduct(id: string): Promise<FirestoreProduct | null> {
    const snap = await getDoc(doc(db, "products", id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as FirestoreProduct;
}

// Testimonials — visible only
export async function getTestimonials(): Promise<Testimonial[]> {
    const snap = await getDocs(collection(db, "testimonials"));
    return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Testimonial))
        .filter((t) => t.isVisible);
}

// Team — visible only
export async function getTeamMembers(): Promise<TeamMember[]> {
    const snap = await getDocs(collection(db, "team"));
    return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as TeamMember))
        .filter((m) => m.isVisible)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// FAQs — visible only
export async function getFAQs(): Promise<FAQ[]> {
    const snap = await getDocs(collection(db, "faqs"));
    return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as FAQ))
        .filter((f) => f.isVisible)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ── Recommended Add-ons ────────────────────────────────────────────────────

export interface FirestoreProductWithAddons extends FirestoreProduct {
    recommendedAddonIds?: string[];
}

/**
 * Fetch a product and resolve its recommendedAddonIds into full product objects.
 * Returns an empty array if no addons are set or IDs don't resolve.
 */
export async function getRecommendedAddons(productId: string): Promise<FirestoreProduct[]> {
    const product = await getProduct(productId) as FirestoreProductWithAddons | null;
    if (!product?.recommendedAddonIds?.length) return [];

    const results = await Promise.allSettled(
        product.recommendedAddonIds.map((id) => getProduct(id))
    );

    return results
        .filter((r): r is PromiseFulfilledResult<FirestoreProduct | null> => r.status === "fulfilled")
        .map((r) => r.value)
        .filter((p): p is FirestoreProduct => p !== null && p.inStock);
}

// ── Coupons (client-side validation) ──────────────────────────────────────

export interface CouponValidationResult {
    valid: boolean;
    error?: string;
    discountType?: "percentage" | "fixed";
    discountValue?: number;
    /** Calculated discount amount in currency units */
    discountAmount?: number;
    /** Final total after discount */
    finalTotal?: number;
    couponId?: string;
    code?: string;
}

/**
 * Validate a coupon code against a cart total.
 * Returns a CouponValidationResult — never throws.
 */
export async function validateCoupon(
    code: string,
    cartTotal: number
): Promise<CouponValidationResult> {
    if (!code.trim()) return { valid: false, error: "Please enter a coupon code." };

    try {
        const snap = await getDocs(collection(db, "coupons"));
        const match = snap.docs.find(
            (d) => (d.data().code as string).toUpperCase() === code.toUpperCase().trim()
        );

        if (!match) return { valid: false, error: "Coupon code not found." };

        const c = { id: match.id, ...match.data() } as {
            id: string;
            code: string;
            active: boolean;
            discountType: "percentage" | "fixed";
            discountValue: number;
            minOrderAmount: number;
            maxUses: number;
            usedCount: number;
            validFrom: string;
            validUntil: string;
        };

        if (!c.active) return { valid: false, error: "This coupon is no longer active." };

        const now = new Date();
        const from = new Date(c.validFrom);
        const until = new Date(c.validUntil);

        if (now < from) {
            return { valid: false, error: `This coupon is not valid until ${c.validFrom}.` };
        }
        if (now > until) {
            return { valid: false, error: "This coupon has expired." };
        }
        if (c.maxUses > 0 && c.usedCount >= c.maxUses) {
            return { valid: false, error: "This coupon has reached its usage limit." };
        }
        if (c.minOrderAmount > 0 && cartTotal < c.minOrderAmount) {
            return {
                valid: false,
                error: `Minimum order of ₦${c.minOrderAmount.toLocaleString()} required for this coupon.`,
            };
        }

        const discountAmount =
            c.discountType === "percentage"
                ? Math.round((cartTotal * c.discountValue) / 100 * 100) / 100
                : Math.min(c.discountValue, cartTotal);

        const finalTotal = Math.max(0, cartTotal - discountAmount);

        return {
            valid: true,
            discountType: c.discountType,
            discountValue: c.discountValue,
            discountAmount,
            finalTotal,
            couponId: c.id,
            code: c.code.toUpperCase(),
        };
    } catch {
        return { valid: false, error: "Could not validate coupon. Please try again." };
    }
}

// ── Currency Rates ─────────────────────────────────────────────────────────

export interface CurrencyRate {
    id?: string;
    code: string;        // ISO 4217 e.g. "USD"
    symbol: string;      // e.g. "$"
    name: string;        // e.g. "US Dollar"
    rateFromNGN: number; // how many units of this currency = 1 NGN
    active: boolean;
}

export async function getCurrencyRates(): Promise<CurrencyRate[]> {
    const snap = await getDocs(collection(db, "currencyRates"));
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as CurrencyRate))
        .filter(r => r.active);
}

// ── Order interface (for client-side queries) ──────────────────────────────

export interface OrderItem {
    productId?: string;
    productName: string;
    productImage?: string;
    productPrice: number;
    size?: string;
    color?: string;
    quantity: number;
    subtotal: number;
}

export interface ClientOrder {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerAddress?: string;
    items: OrderItem[];
    totalAmount: number;
    paymentMethod?: string;
    paymentReference?: string;
    status: "pending" | "received" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";
    paymentStatus: "unpaid" | "paid" | "refunded";
    notes?: string;
    createdAt?: any;
    updatedAt?: any;
}

export async function getOrdersByEmail(email: string): Promise<ClientOrder[]> {
    const snap = await getDocs(
        query(collection(db, "orders"), where("customerEmail", "==", email))
    );
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as ClientOrder))
        .sort((a, b) => {
            const ta = a.createdAt?.toMillis?.() ?? new Date(a.createdAt ?? 0).getTime();
            const tb = b.createdAt?.toMillis?.() ?? new Date(b.createdAt ?? 0).getTime();
            return tb - ta;
        });
}

export async function getOrderById(id: string): Promise<ClientOrder | null> {
    const snap = await getDoc(doc(db, "orders", id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as ClientOrder;
}

// ── Order Notifications ────────────────────────────────────────────────────

export interface OrderNotification {
    id?: string;
    userId: string;          // Firebase Auth UID
    orderId: string;
    orderRef: string;        // short display ref e.g. last 8 chars
    title: string;
    message: string;
    status: string;          // the order status that triggered this
    read: boolean;
    createdAt?: any;
}

export async function getNotificationsForUser(userId: string): Promise<OrderNotification[]> {
    const snap = await getDocs(
        query(
            collection(db, "orderNotifications"),
            where("userId", "==", userId)
        )
    );
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as OrderNotification))
        .sort((a, b) => {
            const ta = a.createdAt?.toMillis?.() ?? new Date(a.createdAt ?? 0).getTime();
            const tb = b.createdAt?.toMillis?.() ?? new Date(b.createdAt ?? 0).getTime();
            return tb - ta;
        });
}

export async function markNotificationRead(id: string): Promise<void> {
    await updateDoc(doc(db, "orderNotifications", id), { read: true });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
    const snap = await getDocs(
        query(collection(db, "orderNotifications"), where("userId", "==", userId), where("read", "==", false))
    );
    await Promise.all(snap.docs.map(d => updateDoc(d.ref, { read: true })));
}

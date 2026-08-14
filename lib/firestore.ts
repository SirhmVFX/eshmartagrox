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
    teamPageLabel?: string;
    teamPageTitle?: string;
    teamPageSubtitle?: string;
    faqPageTitle?: string;
    faqPageSubtitle?: string;
    // Social media
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
    pinterest?: string;
    threads?: string;
    whatsapp?: string;
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

export const PRODUCT_MEASURE_UNITS = [
    "kg", "g", "cup", "pcs", "tbsp", "tsp", "bowl", "bunch", "pack", "litre", "ml",
] as const;

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
    detailsHtml?: string;
    rating: number;
    reviews: number;
    inStock: boolean;
    isNew?: boolean;
    isBestSeller?: boolean;
    tags: string[];
    recommendedAddonIds?: string[];
    relatedProductIds?: string[];
    weight?: number;
    weightUnit?: string;
    measureAmount?: number;
    measureUnit?: string;
    servingSize?: string;
    gramsPerUnit?: number;
    caloriesPerServing?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fibre?: number;
    sodium?: number;
    sugar?: number;
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
            const ta = typeof a.createdAt === "string"
                ? new Date(a.createdAt).getTime()
                : a.createdAt?.toMillis?.() ?? 0;
            const tb = typeof b.createdAt === "string"
                ? new Date(b.createdAt).getTime()
                : b.createdAt?.toMillis?.() ?? 0;
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

// ── Export Commodities (client readers) ───────────────────────────────────

export const EXPORT_CATEGORIES = [
    "Cocoa", "Nuts", "Seeds", "Spices", "Roots", "Fruits", "Botanicals", "Grains", "Oils",
] as const;
export const EXPORT_CERTIFICATIONS = ["Organic", "Non-GMO", "Conventional"] as const;
export const EXPORT_MARKETS = ["Europe", "USA", "Asia", "Middle East", "Africa"] as const;
export const EXPORT_PACKAGING = ["25 kg", "50 kg", "1 MT", "Bulk", "Container"] as const;

export type ExportCategory = (typeof EXPORT_CATEGORIES)[number];
export type ExportCertification = (typeof EXPORT_CERTIFICATIONS)[number];
export type ExportMarket = (typeof EXPORT_MARKETS)[number];
export type ExportPackaging = (typeof EXPORT_PACKAGING)[number];

export interface ExportCommodity {
    id?: string;
    name: string;
    spec: string;           // e.g. "99% purity, FFA <2%"
    priceMin: number;       // USD per MT
    priceMax: number;       // USD per MT
    moq: string;            // e.g. "25 MT"
    catalogType: "raw" | "processed"; // which tab to show under
    category?: ExportCategory;
    certification?: ExportCertification;
    markets?: ExportMarket[];
    packaging?: ExportPackaging[];
    image?: string;         // optional thumbnail
    galleryImages?: string[];
    description?: string;
    detailsHtml?: string;
    relatedIds?: string[];
    active: boolean;
    order: number;
}

export async function getExportCommodities(): Promise<ExportCommodity[]> {
    const snap = await getDocs(collection(db, "exportCommodities"));
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as ExportCommodity))
        .filter(c => c.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getExportCommodity(id: string): Promise<ExportCommodity | null> {
    const snap = await getDoc(doc(db, "exportCommodities", id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as ExportCommodity;
}

// ── Export Quote Requests (client write) ──────────────────────────────────

export interface ExportQuoteRequest {
    id?: string;
    name: string;
    company?: string;
    email: string;
    phone?: string;
    commodity: string;
    quantity: string;
    destination: string;
    message?: string;
    status: "new" | "contacted" | "closed";
    createdAt?: any;
}

export async function submitExportQuote(data: Omit<ExportQuoteRequest, "id" | "status">): Promise<string> {
    const ref = await addDoc(collection(db, "exportQuotes"), {
        ...data,
        status: "new",
        createdAt: new Date().toISOString(),
    });
    return ref.id;
}

// ── Subscription Packages (client readers) ────────────────────────────────

export interface SubscriptionPackage {
    id?: string;
    name: string;
    tag: string;
    tagColor: "green" | "orange";
    description?: string;
    price: number;
    period: string;
    items: string[];
    active: boolean;
    order: number;
}

export async function getSubscriptionPackages(): Promise<SubscriptionPackage[]> {
    const snap = await getDocs(collection(db, "subscriptionPackages"));
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as SubscriptionPackage))
        .filter(p => p.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ── Box Items (client readers) ─────────────────────────────────────────────

export interface BoxItem {
    id?: string;
    name: string;
    price: number;
    active: boolean;
    order: number;
}

export async function getBoxItems(): Promise<BoxItem[]> {
    const snap = await getDocs(collection(db, "boxItems"));
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as BoxItem))
        .filter(b => b.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ── Consultation Tiers (client readers) ───────────────────────────────────

export interface ConsultationTier {
    id?: string;
    icon: string;
    title: string;
    subtitle: string;
    price: number;
    active: boolean;
    order: number;
}

export async function getConsultationTiers(): Promise<ConsultationTier[]> {
    const snap = await getDocs(collection(db, "consultationTiers"));
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as ConsultationTier))
        .filter(t => t.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ── Homepage Stats (client readers) ───────────────────────────────────────

export interface HomepageStat {
    id?: string;
    value: string;
    label: string;
    order: number;
    active: boolean;
}

export async function getHomepageStats(): Promise<HomepageStat[]> {
    const snap = await getDocs(collection(db, "homepageStats"));
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as HomepageStat))
        .filter(s => s.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ── Food Library Categories (client readers) ──────────────────────────────

export interface FoodLibraryCategory {
    id?: string;
    category: string;
    items: string[];
    note: string;
    order: number;
    active: boolean;
}

export async function getFoodLibraryCategories(): Promise<FoodLibraryCategory[]> {
    const snap = await getDocs(collection(db, "foodLibrary"));
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as FoodLibraryCategory))
        .filter(c => c.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ── Export Destinations (client readers) ──────────────────────────────────

export interface ExportDestination {
    id?: string;
    flag: string;
    region: string;
    ports: string;
    note: string;
    order: number;
    active: boolean;
}

export async function getExportDestinations(): Promise<ExportDestination[]> {
    const snap = await getDocs(collection(db, "exportDestinations"));
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as ExportDestination))
        .filter(d => d.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ── Export Hero Content ────────────────────────────────────────────────────

export interface ExportHeroContent {
    id?: string;
    eyebrow: string;
    headingLine1: string;
    headingLine2: string;
    headingAccent: string;
    subtitle: string;
    cta1Label: string;
    cta2Label: string;
    catalogFootnote: string;
    quoteCta1Label: string;
    quoteCta2Label: string;
    hidePrices?: boolean;
}

export async function getExportHeroContent(): Promise<ExportHeroContent | null> {
    const snap = await getDocs(collection(db, "exportHero"));
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as ExportHeroContent;
}

// ── Compliance Certifications ──────────────────────────────────────────────

export interface ComplianceCertification {
    id?: string;
    title: string;
    body: string;
    badge: string;
    order: number;
    active: boolean;
}

export async function getComplianceCertifications(): Promise<ComplianceCertification[]> {
    const snap = await getDocs(collection(db, "complianceCerts"));
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as ComplianceCertification))
        .filter(c => c.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ── Compliance Destination Documents ──────────────────────────────────────

export interface ComplianceDestination {
    id?: string;
    region: string;
    docs: string[];
    order: number;
    active: boolean;
}

export async function getComplianceDestinations(): Promise<ComplianceDestination[]> {
    const snap = await getDocs(collection(db, "complianceDests"));
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as ComplianceDestination))
        .filter(c => c.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ── Compliance Hero Content ────────────────────────────────────────────────

export interface ComplianceHeroContent {
    id?: string;
    eyebrow: string;
    heading: string;
    subtitle: string;
    accrHeading: string;
    accrSubtitle: string;
    docsHeading: string;
    docsSubtitle: string;
    faqHeading: string;
    faqSubtitle: string;
    dueDiligenceHeading: string;
    dueDiligenceBody: string;
    cta1Label: string;
    cta2Label: string;
}

export async function getComplianceHeroContent(): Promise<ComplianceHeroContent | null> {
    const snap = await getDocs(collection(db, "complianceHero"));
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as ComplianceHeroContent;
}

// ── Export FAQs ────────────────────────────────────────────────────────────

export interface ExportFAQ {
    id?: string;
    question: string;
    answer: string;
    order: number;
    active: boolean;
}

export async function getExportFAQs(): Promise<ExportFAQ[]> {
    const snap = await getDocs(collection(db, "exportFAQs"));
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as ExportFAQ))
        .filter(f => f.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ── Homepage Hero Content ──────────────────────────────────────────────────

export interface HomepageHeroContent {
    id?: string;
    deliveryText: string;
    line1: string;
    line2: string;
    line3: string;
    subtitle: string;
    cta1Label: string;
    cta1Href: string;
    cta2Label: string;
    cta2Href: string;
    healthPills: string[];
    floatingCard1Title: string;
    floatingCard1Sub: string;
    floatingCard2Title: string;
    floatingCard2Sub: string;
    heroImage: string;
    assessmentHeading: string;
    assessmentCta1Label: string;
    assessmentCta2Label: string;
    consultationImage?: string;  // left-side photo in the Nutrition Consultations section
}

export async function getHomepageHeroContent(): Promise<HomepageHeroContent | null> {
    const snap = await getDocs(collection(db, "homepageHero"));
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as HomepageHeroContent;
}

// ── About Page ─────────────────────────────────────────────────────────────

export interface AboutStat { value: string; label: string; color: string; }
export interface AboutValue { icon: string; title: string; desc: string; }
export interface AboutService { icon: string; title: string; desc: string; href: string; }

export interface AboutPageContent {
    id?: string;
    heroLabel: string; heroHeading: string; heroSubtext: string; heroBgImage: string;
    whoHeading: string; whoParagraph1: string; whoParagraph2: string; whoParagraph3: string;
    stats: AboutStat[];
    valuesHeading: string; valuesSubtext: string; values: AboutValue[];
    servicesHeading: string; services: AboutService[];
    ctaHeading: string; ctaSubtext: string;
}

const DEFAULT_ABOUT: AboutPageContent = {
    heroLabel: "Our Story",
    heroHeading: "About Eshmart Agrox",
    heroSubtext: "Nigerian Produce. Exported with Integrity.",
    heroBgImage: "",
    whoHeading: "Who We Are",
    whoParagraph1: "Eshmart Agrox is a Nigerian agro-export and healthy food delivery company dedicated to bringing the best of Nigeria's organic produce to your table — and to the world.",
    whoParagraph2: "Whether you're looking for weekly grocery packs or you're an international buyer seeking certified Nigerian commodities — we are your reliable partner.",
    whoParagraph3: "Our commitment goes beyond commerce. We work to empower local farmers, support community food security, and make nutritious eating accessible for every Nigerian household.",
    stats: [
        { value: "500+", label: "Happy Customers", color: "bg-green-900 text-white" },
        { value: "20+", label: "Produce Varieties", color: "bg-orange-500 text-white" },
        { value: "10+", label: "Countries Served", color: "bg-green-100 text-green-900" },
        { value: "100%", label: "Organic Sourced", color: "bg-gray-100 text-gray-900" },
    ],
    valuesHeading: "Our Values",
    valuesSubtext: "Every decision we make is guided by these core principles.",
    values: [
        { icon: "🌱", title: "Freshness First", desc: "We source produce at peak freshness and deliver within 24–48 hours of harvest where possible." },
        { icon: "🤝", title: "Farmer Partnership", desc: "We pay fair prices to smallholder farmers and provide technical support to improve yield quality." },
        { icon: "📦", title: "Export Quality", desc: "All our export commodities meet EU, UK, and US phytosanitary and certification standards." },
        { icon: "❤️", title: "Wellness Focus", desc: "We design our packs around real health goals — diabetes, hypertension, weight management, and senior care." },
    ],
    servicesHeading: "What We Do",
    services: [
        { icon: "🛒", title: "Healthy Grocery Packs", desc: "Curated weekly meal packs designed for specific health conditions.", href: "/shop" },
        { icon: "🚢", title: "International Export", desc: "We export premium Nigerian commodities to buyers in Europe, USA and Asia.", href: "/export" },
        { icon: "📊", title: "Nutrition Calculator", desc: "Free tool to analyse Nigerian meals and build healthier eating habits.", href: "/calculator" },
        { icon: "👥", title: "Senior Wellness", desc: "Dedicated programmes for older adults with guidance from nutrition professionals.", href: "/shop" },
        { icon: "📱", title: "WhatsApp Support", desc: "Direct human support via WhatsApp — no bots, no long waits.", href: "https://wa.me/2347047296000" },
        { icon: "📰", title: "Health Blog", desc: "Expert articles on Nigerian nutrition and practical wellness advice.", href: "/blog" },
    ],
    ctaHeading: "Get in Touch",
    ctaSubtext: "Whether you're a customer, a farmer, or an international buyer — we'd love to hear from you.",
};

export async function getAboutPageContent(): Promise<AboutPageContent> {
    const snap = await getDocs(query(collection(db, "aboutPage")));
    if (snap.empty) return DEFAULT_ABOUT;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as AboutPageContent;
}

// ── Nutritionists ──────────────────────────────────────────────────────────

export interface NutritionistTier {
    icon: string;
    title: string;
    subtitle: string;
    price: number;
}

export interface Nutritionist {
    id?: string;
    name: string;
    designation: string;
    photo: string;
    tiers: NutritionistTier[];
    active: boolean;
    order: number;
}

export async function getNutritionists(): Promise<Nutritionist[]> {
    const snap = await getDocs(collection(db, "nutritionists"));
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Nutritionist))
        .filter(n => n.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ── Health Calculator ──────────────────────────────────────────────────────

export type HealthMetricKind = "number" | "derived_bmi";
export type HealthStatus = "good" | "fair" | "bad";

export interface HealthMetric {
    id?: string;
    key: string;
    label: string;
    unit: string;
    icon: string;
    placeholder?: string;
    helpText?: string;
    kind: HealthMetricKind;
    scored: boolean;
    greenMin: number;
    greenMax: number;
    yellowMin: number;
    yellowMax: number;
    order: number;
    active: boolean;
}

export interface HealthCalculatorPage {
    id?: string;
    pageTitle: string;
    pageSubtitle: string;
    disclaimer: string;
    goodLabel: string;
    fairLabel: string;
    badLabel: string;
    goodMinScore: number;
    fairMinScore: number;
    ctaLabel?: string;
    ctaHref?: string;
}

export const DEFAULT_HEALTH_PAGE: HealthCalculatorPage = {
    pageTitle: "Health Calculator",
    pageSubtitle: "Enter your height, weight, sleep, blood pressure, blood glucose and more to get a traffic-light health status.",
    disclaimer: "This calculator provides general wellness guidance only. It does not replace medical advice. Please consult your doctor for personal health conditions.",
    goodLabel: "Good health",
    fairLabel: "Fairly good health status",
    badLabel: "Very bad health",
    goodMinScore: 1.6,
    fairMinScore: 0.8,
    ctaLabel: "Book a nutrition consultation",
    ctaHref: "/book-online",
};

export const DEFAULT_HEALTH_METRICS: HealthMetric[] = [
    { key: "height", label: "Height", unit: "cm", icon: "📏", placeholder: "e.g. 170", helpText: "Used with weight to calculate BMI.", kind: "number", scored: false, greenMin: 0, greenMax: 0, yellowMin: 0, yellowMax: 0, order: 1, active: true },
    { key: "weight", label: "Weight", unit: "kg", icon: "⚖️", placeholder: "e.g. 68", helpText: "Used with height to calculate BMI.", kind: "number", scored: false, greenMin: 0, greenMax: 0, yellowMin: 0, yellowMax: 0, order: 2, active: true },
    { key: "bmi", label: "Body Mass Index (BMI)", unit: "kg/m²", icon: "📊", helpText: "Calculated automatically from height and weight.", kind: "derived_bmi", scored: true, greenMin: 18.5, greenMax: 24.9, yellowMin: 17, yellowMax: 29.9, order: 3, active: true },
    { key: "sleep", label: "Sleeping hours", unit: "hrs/night", icon: "😴", placeholder: "e.g. 7.5", helpText: "Average hours of sleep per night.", kind: "number", scored: true, greenMin: 7, greenMax: 9, yellowMin: 6, yellowMax: 10, order: 4, active: true },
    { key: "bp_systolic", label: "Blood Pressure (Systolic)", unit: "mmHg", icon: "🫀", placeholder: "e.g. 118", helpText: "The top number of your blood pressure reading.", kind: "number", scored: true, greenMin: 90, greenMax: 120, yellowMin: 80, yellowMax: 139, order: 5, active: true },
    { key: "bp_diastolic", label: "Blood Pressure (Diastolic)", unit: "mmHg", icon: "🫀", placeholder: "e.g. 76", helpText: "The bottom number of your blood pressure reading.", kind: "number", scored: true, greenMin: 60, greenMax: 80, yellowMin: 50, yellowMax: 89, order: 6, active: true },
    { key: "glucose", label: "Blood Glucose (fasting)", unit: "mg/dL", icon: "🩸", placeholder: "e.g. 92", helpText: "Fasting blood glucose reading.", kind: "number", scored: true, greenMin: 70, greenMax: 99, yellowMin: 55, yellowMax: 125, order: 7, active: true },
    { key: "heart_rate", label: "Resting Heart Rate", unit: "bpm", icon: "❤️", placeholder: "e.g. 72", helpText: "Beats per minute at rest.", kind: "number", scored: true, greenMin: 60, greenMax: 100, yellowMin: 50, yellowMax: 110, order: 8, active: true },
    { key: "waist", label: "Waist Circumference", unit: "cm", icon: "📐", placeholder: "e.g. 82", helpText: "Measured at the navel.", kind: "number", scored: true, greenMin: 0, greenMax: 94, yellowMin: 0, yellowMax: 102, order: 9, active: true },
    { key: "water", label: "Daily Water Intake", unit: "litres", icon: "💧", placeholder: "e.g. 2.5", helpText: "Average litres of water drunk per day.", kind: "number", scored: true, greenMin: 2, greenMax: 4, yellowMin: 1.5, yellowMax: 5, order: 10, active: true },
];

export async function getHealthMetrics(): Promise<HealthMetric[]> {
    const snap = await getDocs(collection(db, "healthMetrics"));
    const items = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as HealthMetric))
        .filter(m => m.active)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return items.length ? items : DEFAULT_HEALTH_METRICS;
}

export async function getHealthCalculatorPage(): Promise<HealthCalculatorPage> {
    const snap = await getDocs(collection(db, "healthCalculatorPage"));
    if (snap.empty) return DEFAULT_HEALTH_PAGE;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as HealthCalculatorPage;
}

export function scoreHealthMetric(metric: HealthMetric, value: number): HealthStatus {
    if (value >= metric.greenMin && value <= metric.greenMax) return "good";
    if (value >= metric.yellowMin && value <= metric.yellowMax) return "fair";
    return "bad";
}

export function overallHealthStatus(
    scores: HealthStatus[],
    page: HealthCalculatorPage
): HealthStatus {
    if (!scores.length) return "fair";
    const numeric: number[] = scores.map(s => (s === "good" ? 2 : s === "fair" ? 1 : 0));
    const avg = numeric.reduce((a, b) => a + b, 0) / numeric.length;
    if (avg >= (page.goodMinScore ?? 1.6)) return "good";
    if (avg >= (page.fairMinScore ?? 0.8)) return "fair";
    return "bad";
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Check, ArrowRight, ChevronRight, ChevronDown, ChevronUp, Globe } from "lucide-react";
import {
  getSubscriptionPackages, getBoxItems, getConsultationTiers, getHomepageStats,
  getExportCommodities, getTestimonials, getFAQs, getFoodLibraryCategories,
  getExportDestinations, getHomepageHeroContent,
  SubscriptionPackage, BoxItem, ConsultationTier, HomepageStat, ExportCommodity,
  Testimonial, FAQ, FoodLibraryCategory, ExportDestination, HomepageHeroContent,
} from "@/lib/firestore";

// ── Fallback data (used until Firestore is populated) ──────────────────────

const DEFAULT_PACKAGES: SubscriptionPackage[] = [
  { name: "Senior Wellness", tag: "Most loved", tagColor: "green", description: "Doctor-guided weekly supply for one senior — soft, easy-to-prep meals.", price: 28500, period: "/ week", items: ["Fresh ugu, spinach & garden eggs", "Ofada / brown rice", "Beans & soybeans", "Fish & lean protein", "Seasonal fruits"], active: true, order: 1 },
  { name: "Family of Four", tag: "Best value", tagColor: "orange", description: "A full monthly grocery basket for a household of four, balanced for kids and adults.", price: 92000, period: "/ month", items: ["Rice, yam & plantain", "Beans & legumes", "Fish & chicken", "Vegetables & fruits weekly", "Free delivery & swap"], active: true, order: 2 },
  { name: "Student Smart Pack", tag: "Campus-ready", tagColor: "green", description: "Affordable, energy-packed essentials for university students.", price: 14900, period: "/ week", items: ["Rice, noodles & spaghetti", "Eggs & beans", "Tomatoes & vegetables", "Quick-prep proteins"], active: true, order: 3 },
  { name: "Working Professional", tag: "Meal-prep ready", tagColor: "green", description: "Pre-portioned meal-prep groceries for busy weekdays.", price: 22400, period: "/ week", items: ["Lean proteins", "Smart carbs", "Salad & greens", "Healthy snacks"], active: true, order: 4 },
];

const DEFAULT_BOX_ITEMS: BoxItem[] = [
  { name: "Ofada rice (5kg)", price: 9500, active: true, order: 1 },
  { name: "Brown rice (5kg)", price: 11000, active: true, order: 2 },
  { name: "Honey beans (2kg)", price: 4500, active: true, order: 3 },
  { name: "Yam tubers (3 pcs)", price: 7800, active: true, order: 4 },
  { name: "Plantain bunch", price: 3500, active: true, order: 5 },
  { name: "Instant noodles (carton · 40 packs)", price: 7200, active: true, order: 6 },
  { name: "Spaghetti (pack of 10)", price: 6500, active: true, order: 7 },
  { name: "Macaroni (pack of 10)", price: 6200, active: true, order: 8 },
  { name: "Ugu & spinach bundle", price: 2200, active: true, order: 9 },
  { name: "Fresh tomato & pepper", price: 3800, active: true, order: 10 },
  { name: "Titus fish (1kg)", price: 6500, active: true, order: 11 },
  { name: "Croaker fish (1kg)", price: 8200, active: true, order: 12 },
  { name: "Chicken (whole)", price: 9800, active: true, order: 13 },
  { name: "Goat meat (1kg)", price: 8500, active: true, order: 14 },
  { name: "Crate of eggs (30)", price: 5200, active: true, order: 15 },
  { name: "Oats (1kg)", price: 3200, active: true, order: 16 },
];

const DEFAULT_CONSULTATIONS: ConsultationTier[] = [
  { icon: "📞", title: "Basic · 15 min", subtitle: "Phone call", price: 4500, active: true, order: 1 },
  { icon: "💬", title: "Standard · 30 min", subtitle: "WhatsApp", price: 8500, active: true, order: 2 },
  { icon: "🎥", title: "Premium · 60 min", subtitle: "Video call", price: 15000, active: true, order: 3 },
];

const DEFAULT_STATS: HomepageStat[] = [
  { value: "12k+", label: "Meals delivered", active: true, order: 1 },
  { value: "97%", label: "Subscriber retention", active: true, order: 2 },
  { value: "50+", label: "Nutritionist recipes", active: true, order: 3 },
];

const DEFAULT_COMMODITIES_RAW: ExportCommodity[] = [
  { name: "Raw cashew nuts (RCN)", spec: "OL 180–210", priceMin: 1250, priceMax: 1450, moq: "20 MT (1×20ft)", catalogType: "raw", active: true, order: 1 },
  { name: "Sesame seeds (white)", spec: "99% purity, FFA <2%", priceMin: 1550, priceMax: 1750, moq: "25 MT", catalogType: "raw", active: true, order: 2 },
  { name: "Cocoa beans", spec: "Grade 1, fermented", priceMin: 3200, priceMax: 3600, moq: "20 MT", catalogType: "raw", active: true, order: 3 },
  { name: "Hibiscus flower (Zobo)", spec: "Sun-dried, sortex-cleaned", priceMin: 1800, priceMax: 2100, moq: "10 MT", catalogType: "raw", active: true, order: 4 },
  { name: "Fresh / split ginger", spec: "Sun-dried, 8% moisture", priceMin: 2400, priceMax: 2800, moq: "20 MT", catalogType: "raw", active: true, order: 5 },
  { name: "Shea nuts", spec: "Hand-picked, 7% moisture", priceMin: 650, priceMax: 850, moq: "25 MT", catalogType: "raw", active: true, order: 6 },
  { name: "Soybeans", spec: "Non-GMO, 98% purity", priceMin: 520, priceMax: 640, moq: "25 MT", catalogType: "raw", active: true, order: 7 },
  { name: "Bitter kola (Garcinia)", spec: "Whole, sun-dried", priceMin: 3500, priceMax: 4200, moq: "5 MT", catalogType: "raw", active: true, order: 8 },
  { name: "Hardwood charcoal", spec: "Ash <4%, fixed C >75%", priceMin: 420, priceMax: 560, moq: "25 MT", catalogType: "raw", active: true, order: 9 },
  { name: "Palm kernel", spec: "Cracked, 8% moisture", priceMin: 480, priceMax: 620, moq: "25 MT", catalogType: "raw", active: true, order: 10 },
  { name: "Gum arabic", spec: "Grade 1, hand-picked", priceMin: 2800, priceMax: 3400, moq: "10 MT", catalogType: "raw", active: true, order: 11 },
  { name: "Tiger nuts", spec: "Cleaned, sortex", priceMin: 1900, priceMax: 2300, moq: "10 MT", catalogType: "raw", active: true, order: 12 },
];

const DEFAULT_COMMODITIES_PROCESSED: ExportCommodity[] = [
  { name: "Cashew kernels (W320)", spec: "Vacuum-packed, 22.68 kg tins", priceMin: 6800, priceMax: 7400, moq: "5 MT", catalogType: "processed", active: true, order: 1 },
  { name: "Unrefined shea butter", spec: "Grade A, food/cosmetic", priceMin: 2400, priceMax: 2900, moq: "5 MT", catalogType: "processed", active: true, order: 2 },
  { name: "Natural cocoa powder", spec: "10–12% fat, alkalised option", priceMin: 3900, priceMax: 4500, moq: "5 MT", catalogType: "processed", active: true, order: 3 },
  { name: "Dried hibiscus tea-cut", spec: "Cut & sifted, EU-grade", priceMin: 2400, priceMax: 2800, moq: "5 MT", catalogType: "processed", active: true, order: 4 },
  { name: "Ground ginger powder", spec: "Sortex, mesh 60", priceMin: 3100, priceMax: 3600, moq: "5 MT", catalogType: "processed", active: true, order: 5 },
  { name: "Cold-pressed palm oil", spec: "Red, FFA <5%, drums", priceMin: 1150, priceMax: 1350, moq: "20 MT", catalogType: "processed", active: true, order: 6 },
  { name: "Garri (export grade)", spec: "White & yellow, 5kg packs", priceMin: 1400, priceMax: 1650, moq: "10 MT", catalogType: "processed", active: true, order: 7 },
  { name: "Plantain flour", spec: "Stone-ground, 25kg bags", priceMin: 1800, priceMax: 2100, moq: "5 MT", catalogType: "processed", active: true, order: 8 },
  { name: "Yam flour (Elubo)", spec: "Pure, 25kg bags", priceMin: 1950, priceMax: 2250, moq: "5 MT", catalogType: "processed", active: true, order: 9 },
  { name: "Tiger-nut flour", spec: "Gluten-free, 10kg packs", priceMin: 3200, priceMax: 3800, moq: "3 MT", catalogType: "processed", active: true, order: 10 },
  { name: "Cocoa butter (natural)", spec: "Deodorised, food grade", priceMin: 7500, priceMax: 8400, moq: "5 MT", catalogType: "processed", active: true, order: 11 },
  { name: "Sesame oil (cold-pressed)", spec: "Virgin, 200L drums", priceMin: 3400, priceMax: 3900, moq: "5 MT", catalogType: "processed", active: true, order: 12 },
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { name: "Mrs. Adunni O.", location: "Ikeja, Lagos · Age 64", text: "My fasting blood sugar dropped from 184 to 121 in eight weeks. The weekly basket made it simple — no thinking, just eat.", rating: 5, isVisible: true },
  { name: "Chinedu A.", location: "Maitama, Abuja · Age 41", text: "I used to skip lunch at work. The Professional pack changed everything. I feel lighter, sharper, and my BP is normal again.", rating: 5, isVisible: true },
  { name: "Folake B.", location: "Caregiver · Lagos", text: "Mama lives alone in Yaba. The senior package and the WhatsApp check-ins give my whole family peace of mind.", rating: 5, isVisible: true },
];

const DEFAULT_FAQS: FAQ[] = [
  { question: "How does the weekly subscription work?", answer: "Choose a package, select your frequency (weekly, bi-weekly or monthly), and we hand-pack and deliver chilled to your door across Lagos and Abuja. Cancel or pause anytime.", order: 1, isVisible: true },
  { question: "Can I customise what's in my box?", answer: "Yes. Use the Build Your Own Box feature to pick exactly the items and quantities you want. We'll hand-pack it fresh and deliver it.", order: 2, isVisible: true },
  { question: "Do you cater for medical dietary needs?", answer: "All our packages are designed with specific health goals in mind. We also offer one-on-one Nutrition Consultations with qualified Nigerian nutritionists for personalised guidance.", order: 3, isVisible: true },
  { question: "What areas do you deliver to?", answer: "We currently deliver across Lagos and Abuja. Same-day delivery is available in Lagos; next-day delivery in Abuja. More cities coming soon.", order: 4, isVisible: true },
  { question: "How do I track my order?", answer: "You'll receive a confirmation and can track your order at any time from the Track My Order page using your email address or payment reference.", order: 5, isVisible: true },
  { question: "What payment methods do you accept?", answer: "We accept card payments via Paystack, bank transfer, and USSD. All transactions are processed securely.", order: 6, isVisible: true },
];

const DEFAULT_FOOD_LIBRARY: FoodLibraryCategory[] = [
  { category: "Grains", items: ["Ofada rice", "Brown rice", "Millet", "Guinea corn", "Oats"], note: "5 foods · updated weekly", order: 1, active: true },
  { category: "Proteins", items: ["Fish (Titus, Croaker)", "Turkey", "Chicken", "Beans", "Soybeans", "Eggs"], note: "6 foods · updated weekly", order: 2, active: true },
  { category: "Vegetables", items: ["Ugu", "Ewedu", "Waterleaf", "Bitterleaf", "Spinach", "Garden egg"], note: "6 foods · updated weekly", order: 3, active: true },
  { category: "Fruits", items: ["Pawpaw", "Watermelon", "Orange", "Apple", "Pear", "Banana"], note: "6 foods · updated weekly", order: 4, active: true },
  { category: "Swallows", items: ["Amala", "Eba", "Semovita", "Fufu"], note: "4 foods · portion-guided", order: 5, active: true },
  { category: "Soups", items: ["Egusi", "Okra", "Afang", "Ewedu", "Vegetable (Efo riro)", "Gbegiri", "Onunbu", "White soup (Nsala)", "Edikang Ikong"], note: "9 soups · nutrition-rated", order: 6, active: true },
  { category: "Local Dishes", items: ["Jollof rice", "Fried rice", "Moimoi", "Cooked yam", "Yam porridge (Asaro)"], note: "5 dishes · consumption advice", order: 7, active: true },
];

const DEFAULT_HERO: HomepageHeroContent = {
  deliveryText: "Now delivering across Lagos & Abuja",
  line1: "Eat better.", line2: "Live longer.", line3: "Stay healthier.",
  subtitle: "Healthy Nigerian foods and curated grocery packages designed for seniors, families, busy professionals, and students — guided by real nutrition science.",
  cta1Label: "Shop healthy packages", cta1Href: "/shop",
  cta2Label: "🧮 Try the nutrition calculator", cta2Href: "/calculator",
  healthPills: ["💧 Diabetes", "💚 Blood Pressure", "📈 Cholesterol", "✨ Healthy Aging"],
  floatingCard1Title: "AI meal plan", floatingCard1Sub: "Built around your health",
  floatingCard2Title: "Heart-healthy ✓", floatingCard2Sub: "Low-sodium, high-fibre",
  heroImage: "/assets/1.jpg",
  assessmentHeading: "Take the ESHMARTAGROX assessment and get a personalised food plan.",
  assessmentCta1Label: "Start assessment", assessmentCta2Label: "Browse packages instead",
  consultationImage: "",
};

const DEFAULT_EXPORT_DESTINATIONS: ExportDestination[] = [
  { flag: "🇪🇺", region: "Europe", ports: "Rotterdam · Hamburg · Antwerp", note: "EU-compliant documentation & phytosanitary certs.", order: 1, active: true },
  { flag: "🇺🇸", region: "USA", ports: "New York · Houston · Los Angeles", note: "FDA-registered facility, USDA-aligned processing.", order: 2, active: true },
  { flag: "🌏", region: "Asia", ports: "Shanghai · Mumbai · Singapore", note: "Bulk container freight with cold-chain options.", order: 3, active: true },
];

// ── Build-Your-Own Box ─────────────────────────────────────────────────────

function BuildBox({ items }: { items: BoxItem[] }) {
  const [qty, setQty] = useState<Record<number, number>>({});
  const total = items.reduce((s, it, i) => s + (qty[i] ?? 0) * it.price, 0);
  const count = Object.values(qty).reduce((s, q) => s + q, 0);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-2.5 bg-[#F5F0E8] flex items-center justify-between">
        <span className="text-sm font-bold text-gray-800">Build Your Own Box</span>
        <span className="text-[10px] font-bold bg-[#f97316] text-white px-2.5 py-0.5 rounded-full">Fully customisable</span>
      </div>
      <p className="text-xs text-gray-500 px-4 py-2 border-b border-gray-100">
        Pick exactly the groceries and proteins you want. Adjust quantities, see your live total, and we&apos;ll hand-pack and deliver it.
      </p>
      <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
        {items.map((item, i) => (
          <div key={item.id ?? i} className="flex items-center gap-2 px-4 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-gray-400">₦{item.price.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setQty(q => ({ ...q, [i]: Math.max(0, (q[i] ?? 0) - 1) }))} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-sm">−</button>
              <span className="w-5 text-center text-sm font-medium">{qty[i] ?? 0}</span>
              <button onClick={() => setQty(q => ({ ...q, [i]: (q[i] ?? 0) + 1 }))} className="w-6 h-6 rounded-full bg-[#14532d] text-white flex items-center justify-center text-sm hover:bg-green-800">+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{count} items in box</p>
          <p className="text-xl font-bold text-gray-900">₦{total.toLocaleString()}</p>
        </div>
        <button className="bg-gray-800 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-900 transition-colors disabled:opacity-40" disabled={!count}>
          Order custom box
        </button>
      </div>
    </div>
  );
}

// ── FAQ item ───────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-start justify-between gap-4 py-4 text-left">
        <span className="font-medium text-gray-900 text-sm leading-snug">{q}</span>
        {open ? <ChevronUp size={16} className="shrink-0 text-gray-400 mt-0.5" /> : <ChevronDown size={16} className="shrink-0 text-gray-400 mt-0.5" />}
      </button>
      {open && <p className="text-sm text-gray-600 pb-4 leading-relaxed">{a}</p>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>(DEFAULT_PACKAGES);
  const [boxItems, setBoxItems] = useState<BoxItem[]>(DEFAULT_BOX_ITEMS);
  const [consultations, setConsultations] = useState<ConsultationTier[]>(DEFAULT_CONSULTATIONS);
  const [stats, setStats] = useState<HomepageStat[]>(DEFAULT_STATS);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [faqs, setFaqs] = useState<FAQ[]>(DEFAULT_FAQS);
  const [catalogTab, setCatalogTab] = useState<"raw" | "processed">("raw");
  const [rawCommodities, setRawCommodities] = useState<ExportCommodity[]>(DEFAULT_COMMODITIES_RAW);
  const [processedCommodities, setProcessedCommodities] = useState<ExportCommodity[]>(DEFAULT_COMMODITIES_PROCESSED);
  const [foodLibrary, setFoodLibrary] = useState<FoodLibraryCategory[]>([]);
  const [exportDests, setExportDests] = useState<ExportDestination[]>(DEFAULT_EXPORT_DESTINATIONS);
  const [hero, setHero] = useState<HomepageHeroContent>(DEFAULT_HERO);

  useEffect(() => {
    getSubscriptionPackages().then(d => { if (d.length) setPackages(d); }).catch(() => { });
    getBoxItems().then(d => { if (d.length) setBoxItems(d); }).catch(() => { });
    getConsultationTiers().then(d => { if (d.length) setConsultations(d); }).catch(() => { });
    getHomepageStats().then(d => { if (d.length) setStats(d); }).catch(() => { });
    getTestimonials().then(d => { if (d.length) setTestimonials(d); }).catch(() => { });
    getFAQs().then(d => { if (d.length) setFaqs(d); }).catch(() => { });
    getExportCommodities().then(all => {
      const raw = all.filter(c => c.catalogType === "raw");
      const processed = all.filter(c => c.catalogType === "processed");
      if (raw.length) setRawCommodities(raw);
      if (processed.length) setProcessedCommodities(processed);
    }).catch(() => { });
    getFoodLibraryCategories().then(d => { if (d.length) setFoodLibrary(d); }).catch(() => { });
    getExportDestinations().then(d => { if (d.length) setExportDests(d); }).catch(() => { });
    getHomepageHeroContent().then(h => { if (h) setHero(h); }).catch(() => { });
  }, []);

  const activeCommodities = catalogTab === "raw" ? rawCommodities : processedCommodities;
  const displayFoodLibrary = foodLibrary.length ? foodLibrary : DEFAULT_FOOD_LIBRARY;

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-[#FFFDF7] pt-10 pb-16 md:pb-24">
        <div className="container-max">
          <div className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-3 py-1 text-xs text-gray-600 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {hero.deliveryText}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
                <span className="text-gray-900">{hero.line1}</span><br />
                <span className="text-[#14532d]">{hero.line2}</span><br />
                <span className="text-[#f97316]">{hero.line3}</span>
              </h1>
              <p className="text-gray-600 text-base sm:text-lg max-w-md leading-relaxed">{hero.subtitle}</p>

              <div className="flex flex-wrap gap-3">
                <Link href={hero.cta1Href} className="inline-flex items-center gap-2 bg-[#14532d] text-white px-5 py-3 rounded-full font-semibold text-sm hover:bg-green-800 transition-colors">
                  {hero.cta1Label} <ArrowRight size={14} />
                </Link>
                <Link href={hero.cta2Href} className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-3 rounded-full font-semibold text-sm hover:border-gray-500 transition-colors">
                  {hero.cta2Label}
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {hero.healthPills.map(pill => (
                  <span key={pill} className="inline-flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600">
                    {pill}
                  </span>
                ))}

                {/* Stats */}
                <div className="flex flex-wrap gap-8 pt-2">
                  {[["12k+", "Meals delivered"], ["97%", "Subscriber retention"], ["50+", "Nutritionist recipes"]].map(([v, l]) => (
                    <div key={l}>
                      <p className="text-2xl font-bold text-gray-900">{v}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: image with floating cards */}
            <div className="relative max-w-lg mx-auto lg:mx-0 lg:ml-auto w-full">
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <Image src={hero.heroImage || "/assets/1.jpg"} alt="Healthy Nigerian food" fill className="object-cover" priority />
              </div>
              <div className="absolute top-4 right-4 bg-white rounded-xl border border-gray-100 px-3 py-2 flex items-center gap-2 text-xs">
                <span className="text-[#14532d] font-bold">✦</span>
                <div>
                  <p className="font-bold text-gray-900 text-xs">{hero.floatingCard1Title}</p>
                  <p className="text-gray-400 text-[10px]">{hero.floatingCard1Sub}</p>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-white rounded-xl border border-gray-100 px-3 py-2 flex items-center gap-2 text-xs">
                <span className="text-green-500 text-base">💚</span>
                <div>
                  <p className="font-semibold text-gray-900 text-xs">{hero.floatingCard2Title}</p>
                  <p className="text-gray-400 text-[10px]">{hero.floatingCard2Sub}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── GROCERY PACKAGES ─────────────────────────────────────────── */}
      <section className="bg-[#e8f5e9] py-16 md:py-24">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Left: heading + image */}
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#14532d] mb-2">Grocery Shop</p>
                <h2 className="text-3xl sm:text-4xl text-gray-900 leading-tight">
                  Packages built for <span className="text-[#f97316]">real</span><br />
                  <span className="text-[#14532d]">Nigerian lives.</span>
                </h2>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Subscribe weekly, bi-weekly or monthly. Cancel anytime. Every order is hand-packed and delivered chilled across Lagos &amp; Abuja.
              </p>
              <div className="relative aspect-3/4 rounded-2xl overflow-hidden max-w-xs">
                <Image src="/assets/3.jpg" alt="Nigerian groceries" fill className="object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-4">
                  <p className="text-white font-bold text-sm">Hand-packed, doctor-approved, delivered to your door.</p>
                  <p className="text-white/70 text-xs mt-1">🛵 Same-day in Lagos · Next-day in Abuja</p>
                </div>
              </div>
            </div>

            {/* Right: 2×2 package cards + build-box */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {packages.map(pkg => {
                  const tagCls = pkg.tagColor === "orange" ? "bg-[#f97316] text-white" : "bg-[#14532d] text-white";
                  return (
                    <div key={pkg.name} className="bg-white rounded-2xl p-5 flex flex-col gap-3 border border-gray-100">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-900 text-base">{pkg.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${tagCls}`}>{pkg.tag}</span>
                      </div>
                      {pkg.description && <p className="text-xs text-gray-500 leading-snug">{pkg.description}</p>}
                      <div>
                        <span className="text-2xl font-bold text-gray-900">₦{pkg.price.toLocaleString()}</span>
                        <span className="text-xs text-gray-400 ml-1">{pkg.period}</span>
                      </div>
                      <ul className="space-y-1 flex-1">
                        {pkg.items.map(it => (
                          <li key={it} className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Check size={11} className="text-[#14532d] shrink-0" /> {it}
                          </li>
                        ))}
                      </ul>
                      <button className="w-full bg-[#0d1b12] text-white py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors mt-1">
                        Subscribe
                      </button>
                    </div>
                  );
                })}
              </div>
              {/* Build Your Own Box inline */}
              <BuildBox items={boxItems} />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOD LIBRARY ─────────────────────────────────────────────── */}
      <section className="bg-[#FFFDF7] py-16 md:py-24">
        <div className="container-max">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#14532d] mb-3">Nigerian Food Library</p>
            <h2 className="text-4xl sm:text-5xl text-gray-900 leading-tight mb-3">
              Know your food. <span className="text-[#f97316]">Know your</span><br />
              <span className="text-[#f97316]">health.</span>
            </h2>
            <p className="text-gray-500 max-w-lg text-sm leading-relaxed">
              A growing database of local ingredients with benefits, portions and cooking methods curated by Nigerian nutritionists.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayFoodLibrary.map(cat => (
              <div key={cat.category} className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="font-bold text-[#14532d] text-base mb-3">{cat.category}</p>
                <ul className="space-y-2">
                  {cat.items.map(item => (
                    <li key={item} className="flex items-center justify-between text-sm text-gray-700 border-b border-gray-100 pb-1.5 last:border-0 last:pb-0">
                      <span>{item}</span>
                      <ChevronRight size={13} className="text-gray-400 shrink-0" />
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-gray-400 mt-3">{cat.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NUTRITION CONSULTATIONS ──────────────────────────────────── */}
      <section className="bg-[#14532d] py-16 md:py-24">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-2xl">
            {/* Left: image */}
            <div className="relative min-h-70 sm:min-h-90 lg:min-h-0">
              <Image src={hero.consultationImage || "/assets/2.jpg"} alt="Nigerian nutritionist" fill className="object-cover" />
            </div>
            {/* Right: content */}
            <div className="bg-[#14532d] p-6 sm:p-8 md:p-12 flex flex-col justify-center space-y-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#f97316]">Nutrition Consultations</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl text-white leading-tight">
                Talk to a Nigerian<br />nutritionist who{" "}
                <span className="text-[#f97316]">gets it.</span>
              </h2>
              <p className="text-green-200 text-sm leading-relaxed">
                Personal guidance for diabetes, blood pressure, cholesterol and healthy aging — by phone, WhatsApp or video.
              </p>
              <div className="space-y-3">
                {consultations.map(t => (
                  <div key={t.title} className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3 hover:bg-white/15 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{t.icon}</span>
                      <div>
                        <p className="text-white font-semibold text-sm">{t.title}</p>
                        <p className="text-green-300 text-xs">{t.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">₦{t.price.toLocaleString()}</span>
                      <ChevronRight size={14} className="text-green-300" />
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/book-online" className="inline-flex items-center gap-2 bg-white text-[#14532d] px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors w-fit">
                Book a consultation <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── GLOBAL EXPORT PREVIEW ────────────────────────────────────── */}
      <section className="bg-[#0d1b12] py-16 md:py-24">
        <div className="container-max">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#4ade80] mb-4">Global Export</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
              <h2 className="text-4xl sm:text-5xl text-white leading-tight">
                Raw &amp; processed organic<br />
                commodities —{" "}
                <span className="text-[#4ade80]">Nigeria to<br />the world.</span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm lg:text-right">
                We source, process and ship certified organic Nigerian commodities to buyers across
                Europe, USA and Asia — bulk volumes, full traceability, export-grade packaging.
              </p>
            </div>
          </div>

          {/* Destination cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {exportDests.map(d => (
              <div key={d.region} className="bg-[#1a2e1f] rounded-2xl p-5 space-y-2">
                <span className="text-2xl">{d.flag}</span>
                <p className="font-bold text-white">{d.region}</p>
                <p className="text-xs text-gray-400">{d.ports}</p>
                <p className="text-xs text-gray-500">{d.note}</p>
              </div>
            ))}
          </div>

          {/* Full catalog with Raw / Processed tab — same as /export page */}
          <div className="bg-[#1a2e1f] rounded-2xl overflow-hidden mb-4">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 gap-4 flex-wrap">
              <p className="font-bold text-[#4ade80] text-sm">Full export catalog</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCatalogTab("raw")}
                  className={`text-xs font-bold px-4 py-1.5 rounded-full transition-colors ${catalogTab === "raw" ? "bg-[#4ade80] text-[#0d1b12]" : "bg-white/10 text-white hover:bg-white/20"}`}
                >
                  Raw ({rawCommodities.length})
                </button>
                <button
                  onClick={() => setCatalogTab("processed")}
                  className={`text-xs font-bold px-4 py-1.5 rounded-full transition-colors ${catalogTab === "processed" ? "bg-[#4ade80] text-[#0d1b12]" : "bg-white/10 text-white hover:bg-white/20"}`}
                >
                  Processed ({processedCommodities.length})
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-10"></th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Commodity</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Grade / Spec</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Indicative Price (FOB)</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">MOQ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeCommodities.map(c => (
                    <tr key={c.name} className="hover:bg-white/5 transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
                          <Image src={c.image || "/assets/6.jpg"} alt={c.name} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="px-5 py-3 font-semibold text-white">{c.name}</td>
                      <td className="px-5 py-3 text-gray-400 hidden sm:table-cell">{c.spec}</td>
                      <td className="px-5 py-3 font-semibold text-[#4ade80]">
                        ${c.priceMin.toLocaleString()} – ${c.priceMax.toLocaleString()} / MT
                      </td>
                      <td className="px-5 py-3 text-gray-400 hidden md:table-cell">{c.moq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-2.5 border-t border-white/10">
              <p className="text-xs text-gray-500">
                Prices are indicative FOB Lagos / Apapa in USD and subject to market conditions,
                lot size and destination. CIF, CFR and DDP terms available on request.
              </p>
            </div>
          </div>

          {/* Quote CTA bar */}
          <div className="bg-[#4ade80] rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-[#0d1b12] text-base">Request an export quote</p>
              <p className="text-[#0d1b12]/70 text-xs">
                Bulk pricing, FOB Lagos / Apapa · CIF on request. MOQ from 1 × 20ft container.
              </p>
            </div>
            <Link href="/export#quote" className="bg-[#0d1b12] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors whitespace-nowrap flex items-center gap-2">
              Talk to export desk <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-4">
            <Link href="/export-compliance" className="text-[#4ade80] text-sm hover:underline flex items-center gap-1">
              View compliance &amp; certifications <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="bg-[#FFFDF7] py-16 md:py-24">
        <div className="container-max">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#14532d] mb-3">Community</p>
            <h2 className="text-4xl sm:text-5xl text-gray-900 leading-tight">
              Real Nigerians. <span className="text-[#f97316]">Real results.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
                <p className="text-gray-700 text-sm leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-bold text-sm text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ASSESSMENT CTA ───────────────────────────────────────────── */}
      <section className="py-8 md:py-12">
        <div className="container-max">
          <div className="bg-[#f97316] rounded-2xl px-8 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-2">
              <p className="text-[#7c2800] text-xs font-bold uppercase tracking-widest">Free · 3 minutes</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#0d1b12] leading-tight font-bold">
                {hero.assessmentHeading}
              </h2>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <Link href="/calculator" className="bg-[#0d1b12] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 w-full lg:w-72">
                {hero.assessmentCta1Label} <ArrowRight size={14} />
              </Link>
              <Link href="/shop" className="bg-[#f97316]/20 text-[#7c2800] border border-[#f97316]/40 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-[#f97316]/30 transition-colors flex items-center justify-center w-full lg:w-72">
                {hero.assessmentCta2Label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="bg-[#FFFDF7] py-16 md:py-20">
        <div className="container-max">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-[#14532d] mb-3">FAQ</p>
              <h2 className="text-3xl sm:text-4xl text-gray-900 mb-2">Frequently asked questions</h2>
              <p className="text-gray-500 text-sm">Quick answers about our grocery packages, delivery, and health consultations.</p>
            </div>
            <div className="divide-y divide-gray-200 border-t border-gray-200">
              {faqs.map(f => <FaqItem key={f.question} q={f.question} a={f.answer} />)}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
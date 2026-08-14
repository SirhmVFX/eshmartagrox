"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Check, Shield } from "lucide-react";
import {
  getExportCommodities, submitExportQuote, ExportCommodity,
  getExportDestinations, getExportHeroContent, ExportDestination, ExportHeroContent,
} from "@/lib/firestore";
import ExportCatalog from "@/components/ExportCatalog";

// ── Static fallbacks ───────────────────────────────────────────────────────

const DEFAULT_HERO: ExportHeroContent = {
  eyebrow: "Global Export",
  headingLine1: "Raw & processed organic",
  headingLine2: "commodities —",
  headingAccent: "Nigeria to the world.",
  subtitle: "We source, process and ship certified organic Nigerian commodities to buyers across Europe, USA and Asia — bulk volumes, full traceability, export-grade packaging.",
  cta1Label: "View Commodities",
  cta2Label: "Request a Quote",
  catalogFootnote: "Prices are indicative FOB Lagos / Apapa in USD and subject to market conditions, lot size and destination. CIF, CFR and DDP terms available on request.",
  quoteCta1Label: "Send Quote Request",
  quoteCta2Label: "Talk to export desk",
  hidePrices: false,
};

const DEFAULT_DESTINATIONS: ExportDestination[] = [
  { flag: "🇪🇺", region: "Europe", ports: "Rotterdam · Hamburg · Antwerp", note: "EU-compliant documentation & phytosanitary certs.", order: 1, active: true },
  { flag: "🇺🇸", region: "USA", ports: "New York · Houston · Los Angeles", note: "FDA-registered facility, USDA-aligned processing.", order: 2, active: true },
  { flag: "🌏", region: "Asia", ports: "Shanghai · Mumbai · Singapore", note: "Bulk container freight with cold-chain options.", order: 3, active: true },
];

const FALLBACK_COMMODITIES: ExportCommodity[] = [
  { name: "Raw cashew nuts (RCN)", spec: "OL 180–210", priceMin: 1250, priceMax: 1450, moq: "20 MT (1×20ft)", catalogType: "raw", category: "Nuts", certification: "Organic", markets: ["Europe", "USA", "Asia"], packaging: ["1 MT", "Bulk", "Container"], image: "/assets/6.jpg", active: true, order: 1 },
  { name: "Sesame seeds (white)", spec: "99% purity, FFA <2%", priceMin: 1550, priceMax: 1750, moq: "25 MT", catalogType: "raw", category: "Seeds", certification: "Organic", markets: ["Europe", "Asia", "Middle East"], packaging: ["25 kg", "50 kg", "Bulk"], image: "/assets/7.jpg", active: true, order: 2 },
  { name: "Cocoa beans", spec: "Grade 1, fermented", priceMin: 3200, priceMax: 3600, moq: "20 MT", catalogType: "raw", category: "Cocoa", certification: "Organic", markets: ["Europe", "USA", "Asia"], packaging: ["50 kg", "1 MT", "Container"], image: "/assets/8.jpg", active: true, order: 3 },
  { name: "Hibiscus flower (Zobo)", spec: "Sun-dried, sortex-cleaned", priceMin: 1800, priceMax: 2100, moq: "10 MT", catalogType: "raw", category: "Botanicals", certification: "Organic", markets: ["Europe", "USA", "Middle East"], packaging: ["25 kg", "50 kg"], image: "/assets/9.jpg", active: true, order: 4 },
  { name: "Fresh / split ginger", spec: "Sun-dried, 8% moisture", priceMin: 2400, priceMax: 2800, moq: "20 MT", catalogType: "raw", category: "Roots", certification: "Organic", markets: ["Europe", "Asia", "Africa"], packaging: ["25 kg", "50 kg", "Bulk"], image: "/assets/10.jpg", active: true, order: 5 },
  { name: "Shea nuts", spec: "Hand-picked, 7% moisture", priceMin: 650, priceMax: 850, moq: "25 MT", catalogType: "raw", category: "Nuts", certification: "Conventional", markets: ["Europe", "USA", "Africa"], packaging: ["50 kg", "Bulk", "Container"], image: "/assets/11.jpg", active: true, order: 6 },
  { name: "Soybeans", spec: "Non-GMO, 98% purity", priceMin: 520, priceMax: 640, moq: "25 MT", catalogType: "raw", category: "Grains", certification: "Non-GMO", markets: ["Asia", "Africa", "Middle East"], packaging: ["50 kg", "1 MT", "Bulk"], image: "/assets/12.jpg", active: true, order: 7 },
  { name: "Bitter kola (Garcinia)", spec: "Whole, sun-dried", priceMin: 3500, priceMax: 4200, moq: "5 MT", catalogType: "raw", category: "Nuts", certification: "Conventional", markets: ["Africa", "Europe", "USA"], packaging: ["25 kg", "50 kg"], image: "/assets/13.jpg", active: true, order: 8 },
  { name: "Palm kernel", spec: "Cracked, 8% moisture", priceMin: 480, priceMax: 620, moq: "25 MT", catalogType: "raw", category: "Oils", certification: "Conventional", markets: ["Asia", "Europe", "Africa"], packaging: ["Bulk", "Container"], image: "/assets/15.jpg", active: true, order: 9 },
  { name: "Tiger nuts", spec: "Cleaned, sortex", priceMin: 1900, priceMax: 2300, moq: "10 MT", catalogType: "raw", category: "Nuts", certification: "Organic", markets: ["Europe", "USA"], packaging: ["25 kg", "50 kg"], image: "/assets/2.jpg", active: true, order: 10 },
  { name: "Cashew kernels (W320)", spec: "Vacuum-packed, 22.68 kg tins", priceMin: 6800, priceMax: 7400, moq: "5 MT", catalogType: "processed", category: "Nuts", certification: "Organic", markets: ["Europe", "USA", "Asia"], packaging: ["25 kg", "1 MT"], image: "/assets/3.jpg", active: true, order: 1 },
  { name: "Unrefined shea butter", spec: "Grade A, food/cosmetic", priceMin: 2400, priceMax: 2900, moq: "5 MT", catalogType: "processed", category: "Oils", certification: "Organic", markets: ["Europe", "USA", "Middle East"], packaging: ["25 kg", "50 kg"], image: "/assets/4.jpg", active: true, order: 2 },
  { name: "Natural cocoa powder", spec: "10–12% fat, alkalised option", priceMin: 3900, priceMax: 4500, moq: "5 MT", catalogType: "processed", category: "Cocoa", certification: "Organic", markets: ["Europe", "USA", "Asia"], packaging: ["25 kg", "50 kg"], image: "/assets/6.jpg", active: true, order: 3 },
  { name: "Dried hibiscus tea-cut", spec: "Cut & sifted, EU-grade", priceMin: 2400, priceMax: 2800, moq: "5 MT", catalogType: "processed", category: "Botanicals", certification: "Organic", markets: ["Europe", "USA"], packaging: ["25 kg", "50 kg"], image: "/assets/7.jpg", active: true, order: 4 },
  { name: "Ground ginger powder", spec: "Sortex, mesh 60", priceMin: 3100, priceMax: 3600, moq: "5 MT", catalogType: "processed", category: "Spices", certification: "Organic", markets: ["Europe", "Asia", "Middle East"], packaging: ["25 kg", "50 kg"], image: "/assets/8.jpg", active: true, order: 5 },
  { name: "Cold-pressed palm oil", spec: "Red, FFA <5%, drums", priceMin: 1150, priceMax: 1350, moq: "20 MT", catalogType: "processed", category: "Oils", certification: "Conventional", markets: ["Africa", "Asia", "Europe"], packaging: ["1 MT", "Bulk", "Container"], image: "/assets/9.jpg", active: true, order: 6 },
  { name: "Garri (export grade)", spec: "White & yellow, 5kg packs", priceMin: 1400, priceMax: 1650, moq: "10 MT", catalogType: "processed", category: "Roots", certification: "Conventional", markets: ["Africa", "Europe", "USA"], packaging: ["25 kg", "50 kg"], image: "/assets/10.jpg", active: true, order: 7 },
  { name: "Plantain flour", spec: "Stone-ground, 25kg bags", priceMin: 1800, priceMax: 2100, moq: "5 MT", catalogType: "processed", category: "Fruits", certification: "Organic", markets: ["Europe", "USA", "Africa"], packaging: ["25 kg"], image: "/assets/11.jpg", active: true, order: 8 },
  { name: "Yam flour (Elubo)", spec: "Pure, 25kg bags", priceMin: 1950, priceMax: 2250, moq: "5 MT", catalogType: "processed", category: "Roots", certification: "Conventional", markets: ["Europe", "USA", "Africa"], packaging: ["25 kg"], image: "/assets/12.jpg", active: true, order: 9 },
  { name: "Tiger-nut flour", spec: "Gluten-free, 10kg packs", priceMin: 3200, priceMax: 3800, moq: "3 MT", catalogType: "processed", category: "Nuts", certification: "Organic", markets: ["Europe", "USA"], packaging: ["25 kg"], image: "/assets/13.jpg", active: true, order: 10 },
  { name: "Cocoa butter (natural)", spec: "Deodorised, food grade", priceMin: 7500, priceMax: 8400, moq: "5 MT", catalogType: "processed", category: "Cocoa", certification: "Organic", markets: ["Europe", "USA", "Asia"], packaging: ["25 kg", "50 kg"], image: "/assets/14.jpg", active: true, order: 11 },
  { name: "Sesame oil (cold-pressed)", spec: "Virgin, 200L drums", priceMin: 3400, priceMax: 3900, moq: "5 MT", catalogType: "processed", category: "Oils", certification: "Organic", markets: ["Asia", "Europe", "Middle East"], packaging: ["1 MT", "Bulk"], image: "/assets/15.jpg", active: true, order: 12 },
];

interface FormState { name: string; company: string; email: string; phone: string; commodity: string; quantity: string; destination: string; message: string; }
const emptyForm: FormState = { name: "", company: "", email: "", phone: "", commodity: "", quantity: "", destination: "", message: "" };

export default function ExportPage() {
  const [commodities, setCommodities] = useState<ExportCommodity[]>(FALLBACK_COMMODITIES);
  const [destinations, setDestinations] = useState<ExportDestination[]>(DEFAULT_DESTINATIONS);
  const [hero, setHero] = useState<ExportHeroContent>(DEFAULT_HERO);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    getExportCommodities().then(all => {
      if (all.length) setCommodities(all);
    }).catch(() => { });
    getExportDestinations().then(d => { if (d.length) setDestinations(d); }).catch(() => { });
    getExportHeroContent().then(h => { if (h) setHero(h); }).catch(() => { });
  }, []);

  const rawCommodities = commodities.filter(c => c.catalogType === "raw");
  const processedCommodities = commodities.filter(c => c.catalogType === "processed");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitExportQuote({
        name: form.name, company: form.company, email: form.email,
        phone: form.phone, commodity: form.commodity,
        quantity: form.quantity, destination: form.destination, message: form.message,
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1b12]">

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="container-max">
          <p className="text-xs font-bold uppercase tracking-widest text-[#4ade80] mb-6">{hero.eyebrow}</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.05]">
              {hero.headingLine1}<br />
              {hero.headingLine2}{" "}
              <span className="text-[#4ade80]">{hero.headingAccent}</span>
            </h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-sm lg:ml-auto lg:text-right">
              {hero.subtitle}
            </p>
          </div>

          {/* Destination cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {destinations.map(d => (
              <div key={d.region} className="bg-[#1a2e1f] rounded-2xl p-5 space-y-2 border border-white/5">
                <span className="text-2xl">{d.flag}</span>
                <p className="font-bold text-white text-base mt-2">{d.region}</p>
                <p className="text-sm text-gray-400">{d.ports}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{d.note}</p>
              </div>
            ))}
          </div>

          <ExportCatalog commodities={commodities} footnote={hero.catalogFootnote} hidePricesDefault={!!hero.hidePrices} />

          {/* Compliance link */}
          <div className="mt-4">
            <Link href="/export-compliance" className="text-[#4ade80] text-sm hover:underline flex items-center gap-1 w-fit">
              <Shield size={13} /> View compliance &amp; certifications →
            </Link>
          </div>

          {/* Quote CTA bar */}
          <div className="mt-6 bg-[#4ade80] rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-[#0d1b12] text-base">Request an export quote</p>
              <p className="text-[#0d1b12]/70 text-xs mt-0.5">
                Bulk pricing, FOB Lagos / Apapa · CIF on request. MOQ from 1 × 20ft container.
              </p>
            </div>
            <a
              href="/book-online"
              className="bg-[#0d1b12] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors whitespace-nowrap flex items-center gap-2"
            >
              Talk to export desk <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ── QUOTE FORM ──────────────────────────────────────────────── */}
      <section id="quote" className="py-16 md:py-24">
        <div className="container-max">
          <div className="max-w-2xl mx-auto">
            <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">Request a Quote</p>
            <h2 className="text-4xl text-white mb-2">Bulk pricing, FOB Lagos / Apapa</h2>
            <p className="text-gray-400 text-sm mb-8">
              CIF on request. MOQ from 1 × 20ft container. Our export desk responds within one business day.
            </p>

            {submitted ? (
              <div className="bg-[#1a2e1f] border border-[#4ade80]/30 rounded-2xl p-10 text-center space-y-3">
                <div className="w-12 h-12 bg-[#4ade80] rounded-full flex items-center justify-center mx-auto">
                  <Check size={22} className="text-[#0d1b12]" />
                </div>
                <p className="text-white font-bold text-lg">Quote request received</p>
                <p className="text-gray-400 text-sm">Our export desk will contact you within one business day.</p>
                <button
                  onClick={() => { setForm(emptyForm); setSubmitted(false); }}
                  className="text-[#4ade80] text-sm hover:underline"
                >
                  Submit another →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 bg-[#1a2e1f] rounded-2xl border border-white/10 p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                    { label: "Full Name *", key: "name" as const, placeholder: "Jane Smith", required: true, type: "text" },
                    { label: "Company", key: "company" as const, placeholder: "Acme Trading Ltd", required: false, type: "text" },
                    { label: "Email *", key: "email" as const, placeholder: "jane@company.com", required: true, type: "email" },
                    { label: "Phone / WhatsApp", key: "phone" as const, placeholder: "+1 234 567 8901", required: false, type: "tel" },
                  ] as const).map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{f.label}</label>
                      <input
                        required={f.required}
                        type={f.type}
                        value={form[f.key]}
                        onChange={e => set(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#4ade80]"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Commodity *</label>
                    <select
                      required
                      value={form.commodity}
                      onChange={e => set("commodity", e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#4ade80]"
                    >
                      <option value="" className="bg-[#1a2e1f]">Select commodity…</option>
                      <optgroup label="Raw" className="bg-[#1a2e1f]">
                        {rawCommodities.map(c => <option key={c.name} value={c.name} className="bg-[#1a2e1f]">{c.name}</option>)}
                      </optgroup>
                      <optgroup label="Processed" className="bg-[#1a2e1f]">
                        {processedCommodities.map(c => <option key={c.name} value={c.name} className="bg-[#1a2e1f]">{c.name}</option>)}
                      </optgroup>
                      <option value="Other / Multiple" className="bg-[#1a2e1f]">Other / Multiple</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Quantity (MT) *</label>
                    <input
                      required
                      value={form.quantity}
                      onChange={e => set("quantity", e.target.value)}
                      placeholder="e.g. 25 MT"
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#4ade80]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Destination *</label>
                  <input
                    required
                    value={form.destination}
                    onChange={e => set("destination", e.target.value)}
                    placeholder="e.g. Rotterdam, Netherlands"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#4ade80]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Additional Notes</label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={e => set("message", e.target.value)}
                    placeholder="Incoterms, packaging spec, certification requirements…"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#4ade80] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#4ade80] text-[#0d1b12] py-3.5 rounded-full font-bold text-sm hover:bg-green-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? "Sending…" : <> Send Quote Request <ArrowRight size={15} /> </>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

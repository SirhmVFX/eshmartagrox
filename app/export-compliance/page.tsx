"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowRight, Globe } from "lucide-react";

const CERTIFICATIONS = [
  { title: "Organic Certification", body: "Our farm partners and processing units are certified under EU Organic Regulation (EC) 834/2007 and USDA NOP standards. Annual audits verify zero synthetic pesticide use, non-GMO seed stock, and soil-health compliance across all raw-crop sourcing regions.", badge: "EU · USA · ASIA" },
  { title: "Certificate of Inspection (COI)", body: "Every consignment ships with a third-party Certificate of Inspection issued by accredited inspection bodies. COI covers quality grade, moisture content, foreign-matter screening, and lot-specific traceability back to the farm gate.", badge: "MANDATORY PER SHIPMENT" },
  { title: "HACCP & Food Safety", body: "Processing lines operate under HACCP-certified hazard-analysis plans. We control critical points for aflatoxin, heavy metals, and microbial load with in-house lab testing and third-party validation for every batch.", badge: "ALL PROCESSED COMMODITIES" },
  { title: "Phytosanitary & Export Permits", body: "Nigerian Federal Ministry of Agriculture phytosanitary certificates and NEPC (Nigerian Export Promotion Council) export permits are secured for every cargo. Destination-specific fumigation and quarantine requirements are pre-cleared before container loading.", badge: "EUROPE · USA · ASIA" },
  { title: "ISO 22000:2018", body: "Our main processing facility is ISO 22000:2018 certified for food-safety management systems. This covers supplier approval, traceability, recall readiness, and documented sanitation protocols.", badge: "PROCESSING FACILITY" },
  { title: "Fair-Trade & Social Compliance", body: "Selected cooperatives hold Fair-Trade and SMETA (Sedex) social-compliance accreditations. This ensures ethical labour practices, fair pricing for smallholder farmers, and transparent supply-chain reporting.", badge: "CASHEW · SHEA · COCOA COOPERATIVES" },
];

const DESTINATIONS = [
  {
    region: "Europe",
    docs: ["EU Organic Regulation (EC) 834/2007 compliance statement", "Certificate of Origin (EUR.1 / Form A)", "Phytosanitary certificate (NPPO-Nigeria)", "Health certificate for food-of-non-animal-origin", "Aflatoxin & pesticide residue lab report (EU MRL aligned)", "Bill of Lading & packing list"],
  },
  {
    region: "USA",
    docs: ["FDA Facility Registration & FSVP compliance", "USDA NOP Organic certificate (where applicable)", "Aflatoxin B1 / Total aflatoxin test report", "Certificate of Analysis (moisture, FFA, purity)", "Phytosanitary certificate (if plant material)", "Commercial invoice & packing declaration"],
  },
  {
    region: "Asia",
    docs: ["Destination-country import permit copy (where required)", "Certificate of Origin (COO)", "Fumigation certificate (methyl-bromide alternative)", "Quality & weight inspection report", "Halal certificate (where applicable)", "Non-GMO declaration (for soybeans, sesame)"],
  },
];

const FAQS = [
  { q: "What is a Certificate of Inspection (COI) and why do I need it?", a: "A COI is a third-party document certifying quality grade, moisture content, and lot-level traceability back to the farm gate. Most destination customs authorities and buyers require it to clear goods at port." },
  { q: "How does HACCP certification protect my order?", a: "HACCP controls critical points in our processing lines — specifically aflatoxin levels, heavy metals, and microbial load. Every batch is tested in-house and validated by a third-party lab before shipment." },
  { q: "What are phytosanitary certificates and when are they required?", a: "Phytosanitary certificates are issued by Nigeria's Federal Ministry of Agriculture and confirm that plant-based commodities are free from pests and disease. They are mandatory for most agricultural exports to Europe, USA, and Asia." },
  { q: "What does ISO 22000:2018 cover and how does it benefit me?", a: "ISO 22000:2018 covers our food-safety management system including supplier approval, traceability, recall readiness, and documented sanitation. It gives buyers confidence that our facility meets an internationally recognised food-safety standard." },
  { q: "Can I receive redacted copies of your certificates under NDA?", a: "Yes. We share redacted certificate copies under a standard NDA for serious buyers. Contact our compliance team and we respond within one business day." },
  { q: "Do you support buyer-led factory and farm-gate audits?", a: "Absolutely. We welcome buyer or third-party audits with a minimum 5 business days' notice. Our compliance team will coordinate the visit and provide full facility access." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-start justify-between gap-4 py-4 text-left">
        <span className="text-sm text-gray-800 leading-snug">{q}</span>
        {open ? <ChevronUp size={15} className="shrink-0 text-gray-400 mt-0.5" /> : <ChevronDown size={15} className="shrink-0 text-gray-400 mt-0.5" />}
      </button>
      {open && <p className="text-sm text-gray-500 pb-4 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function ExportCompliancePage() {
  return (
    <div className="min-h-screen bg-[#FFFDF7]">

      {/* ── HERO — dark navy ───────────────────────────────────────────── */}
      <section className="bg-[#0d1b12] py-16 md:py-24">
        <div className="container-max">
          <div className="flex items-center gap-2 mb-6 text-xs text-gray-500">
            <Globe size={13} className="text-[#4ade80]" />
            <Link href="/export" className="text-[#4ade80] hover:underline">International Export</Link>
            <span className="text-gray-600">/</span>
            <span className="text-gray-500">Compliance</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#4ade80] mb-4">Trust &amp; Transparency</p>
          <h1 className="text-5xl sm:text-6xl text-white leading-tight mb-6">
            Compliance &amp; certifications.
          </h1>
          <p className="text-gray-400 text-base max-w-xl leading-relaxed">
            Every shipment from ESHMARTAGROX is backed by verified organic certifications, food-safety audits, and destination-ready documentation. Full traceability from farm gate to foreign port.
          </p>
        </div>
      </section>

      {/* ── ACCREDITATIONS — cream bg, white rounded cards ────────────── */}
      <section className="bg-[#FFFDF7] py-16 md:py-20">
        <div className="container-max">
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl text-gray-900 mb-3">Our accreditations</h2>
            <p className="text-gray-500 text-sm">
              We maintain active certifications with internationally recognised bodies.<br />
              Copies are available under NDA for serious buyers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CERTIFICATIONS.map(cert => (
              <div key={cert.title} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-3 ">
                <h3 className="font-bold text-[#14532d] text-base">{cert.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed flex-1">{cert.body}</p>
                <p className="text-xs font-bold text-[#14532d] tracking-wider">{cert.badge}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCUMENTS PER DESTINATION — cream bg, white rounded cards ─── */}
      <section className="bg-[#FFFDF7] py-16 md:py-20 border-t border-gray-100">
        <div className="container-max">
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl text-gray-900 mb-3">Documents per destination</h2>
            <p className="text-gray-500 text-sm max-w-lg leading-relaxed">
              We prepare region-specific export dossiers so your customs broker and quarantine office receive every paper they need — pre-cleared, pre-validated, and digitally archived.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DESTINATIONS.map(d => (
              <div key={d.region} className="bg-white rounded-2xl border border-gray-100 p-6 ">
                <h3 className="font-bold text-[#14532d] text-lg mb-4">{d.region}</h3>
                <ul className="space-y-2.5">
                  {d.docs.map(doc => (
                    <li key={doc} className="flex items-start gap-2 text-sm text-gray-600 leading-snug">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0 mt-1.5" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ — cream bg, no border box ─────────────────────────────── */}
      <section id="faq" className="bg-[#FFFDF7] py-16 md:py-20 border-t border-gray-100">
        <div className="container-max">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl text-gray-900 mb-2">Frequently asked questions</h2>
            <p className="text-gray-500 text-sm mb-8">
              Quick answers to common compliance and certification questions from buyers and customs brokers.
            </p>
            <div>
              {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── DUE DILIGENCE CTA — green card, rounded pill buttons ─────── */}
      <section className="bg-[#FFFDF7] pb-16 md:pb-20">
        <div className="container-max">
          <div className="bg-[#14532d] rounded-2xl px-8 py-10 md:py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-green-300">Due Diligence</p>
              <h2 className="text-2xl sm:text-3xl text-white leading-snug">
                Need certified copies or an audit visit?
              </h2>
              <p className="text-green-200 text-sm leading-relaxed max-w-sm">
                We share redacted certificates under NDA and welcome buyer-led factory audits with prior notice. Our compliance team responds within one business day.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <Link href="/export#quote" className="bg-[#0d1b12] text-white px-6 py-3.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                Request compliance pack <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className="bg-[#1a4a2a] text-white px-6 py-3.5 rounded-full font-semibold text-sm hover:bg-[#1f5530] transition-colors flex items-center justify-center border border-white/20">
                Email compliance desk
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

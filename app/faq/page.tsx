"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getFAQs, getSiteSettings, FAQ, SiteSettings } from "@/lib/firestore";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-start justify-between gap-4 py-5 text-left">
        <span className="font-medium text-gray-900 text-base leading-snug">{q}</span>
        <ChevronDown size={18} className={`shrink-0 text-gray-400 mt-0.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="text-sm text-gray-600 pb-5 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFAQs(), getSiteSettings()])
      .then(([items, s]) => {
        setFaqs(items);
        setSettings(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const title = settings?.faqPageTitle || "Frequently Asked Questions";
  const subtitle = settings?.faqPageSubtitle || "Answers to common questions about packs, delivery and exports.";

  return (
    <main className="min-h-screen bg-[#FFFDF7]">
      <section className="bg-green-900 text-white py-20 sm:py-28">
        <div className="container-max text-center">
          <p className="text-green-300 text-xs font-bold uppercase tracking-widest mb-3">Company</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{title}</h1>
          {subtitle && <p className="text-white/70 max-w-xl mx-auto">{subtitle}</p>}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-max max-w-3xl">
          {loading ? (
            <p className="text-center text-gray-400">Loading…</p>
          ) : faqs.length === 0 ? (
            <p className="text-center text-gray-500">FAQs will appear here once they are added in admin.</p>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 px-6">
              {faqs.map(f => (
                <FaqItem key={f.id ?? f.question} q={f.question} a={f.answer} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getFAQs, getSiteSettings, FAQ, SiteSettings } from "@/lib/firestore";

const STATIC_FAQS: FAQ[] = [
    { question: "How do I place a bulk order?", answer: "Contact us via the form below with your requirements — product type, quantity, destination port, and preferred delivery timeline. Our export team will respond within 24 hours.", order: 1, isVisible: true },
    { question: "What produce do you export?", answer: "We currently export premium-grade Okra and Ugu (fluted pumpkin leaves), with seasonal specialities available. All produce meets EU phytosanitary standards.", order: 2, isVisible: true },
    { question: "How is quality assured?", answer: "Every batch undergoes multi-stage quality control: physical uniformity analysis, residue testing, and rapid cooling. We are fully compliant with international phytosanitary requirements.", order: 3, isVisible: true },
    { question: "What are your payment terms?", answer: "We work with standard trade finance instruments. Contact us to discuss terms suited to your order size and relationship history.", order: 4, isVisible: true },
    { question: "Do you ship internationally?", answer: "Yes — we ship to Europe, the UK, North America, and the Middle East. Reach out with your destination and we will provide a shipping quote.", order: 5, isVisible: true },
];

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);
    const [faqs, setFaqs] = useState<FAQ[]>(STATIC_FAQS);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [activeIdx, setActiveIdx] = useState<number | null>(null);

    useEffect(() => {
        getFAQs().then(data => { if (data.length > 0) setFaqs(data); }).catch(() => { });
        getSiteSettings().then(s => { if (s) setSettings(s); }).catch(() => { });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            await addDoc(collection(db, "contactMessages"), {
                ...form,
                read: false,
                createdAt: Timestamp.now(),
            });
            setSent(true);
        } catch {
            setSent(true); // still show success even if Firestore write fails
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="w-[90%] mx-auto py-12 md:py-20">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-green-900 mb-4">Contact Us</h1>
            <p className="text-gray-600 mb-12 max-w-xl">
                Ready to source premium Nigerian produce? Share your requirements with our export team.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
                {/* Contact form */}
                <div>
                    {sent ? (
                        <div className="border border-green-900 p-10 text-center">
                            <p className="text-green-900 text-2xl font-bold mb-2">Message Sent!</p>
                            <p className="text-gray-600 mb-6">Our team will get back to you within 24 hours.</p>
                            <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                                className="bg-green-900 text-white px-6 py-2 text-sm">
                                Send Another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-green-900 mb-1">Name *</label>
                                    <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-green-900" placeholder="Your full name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-green-900 mb-1">Email *</label>
                                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-green-900" placeholder="your@email.com" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-green-900 mb-1">Subject *</label>
                                <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                                    className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-green-900 bg-white">
                                    <option value="">Select a subject</option>
                                    <option>Bulk Order Inquiry</option>
                                    <option>Product Information</option>
                                    <option>Shipping & Logistics</option>
                                    <option>Quality & Compliance</option>
                                    <option>Partnership</option>
                                    <option>Farm Tour</option>
                                    <option>Order Planning</option>
                                    <option>Produce Consultation</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-green-900 mb-1">Message *</label>
                                <textarea required rows={6} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                    className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-green-900 resize-none"
                                    placeholder="Describe your requirements — product type, quantity, destination..." />
                            </div>
                            <button type="submit" disabled={sending}
                                className="w-full bg-green-900 text-white py-3 font-semibold hover:bg-green-800 transition-colors disabled:opacity-60">
                                {sending ? "Sending…" : "Send Message →"}
                            </button>
                        </form>
                    )}
                </div>

                {/* Contact info from settings */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-green-900 mb-4">Get in Touch</h2>
                        <div className="space-y-3">
                            {[
                                { label: "Email", value: settings?.contactEmail ?? "exports@eshmartagrox.com" },
                                { label: "Phone", value: settings?.contactPhone ?? "+234 800 ESHMART" },
                                { label: "Address", value: settings?.address ?? "20b Kingsley Emu Street, Lekki Phase 1 Lagos" },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex gap-4 items-start">
                                    <span className="text-xs font-bold uppercase tracking-widest text-green-900 w-16 pt-0.5 shrink-0">{label}</span>
                                    <span className="text-gray-700 text-sm">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQs from Firestore */}
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-8">Frequently Asked Questions</h2>
                <div className="divide-y divide-gray-200 border-y border-gray-200 max-w-3xl">
                    {faqs.map((faq, i) => (
                        <div key={faq.id ?? i}>
                            <button onClick={() => setActiveIdx(activeIdx === i ? null : i)}
                                className="w-full flex justify-between items-center py-4 text-left">
                                <span className="font-semibold text-gray-800 pr-4">{faq.question}</span>
                                <span className={`text-green-900 text-xl transition-transform duration-300 shrink-0 ${activeIdx === i ? "rotate-45" : ""}`}>+</span>
                            </button>
                            {activeIdx === i && (
                                <p className="pb-4 text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getSiteSettings, SiteSettings } from "@/lib/firestore";

const COLS = [
  {
    heading: "Shop",
    links: [
      { label: "Senior Wellness", href: "/shop" },
      { label: "Family Package", href: "/shop" },
      { label: "Student Smart Pack", href: "/shop" },
      { label: "Working Professional", href: "/shop" },
      { label: "Subscriptions", href: "/shop" },
    ],
  },
  {
    heading: "Health",
    links: [
      { label: "Nutrition Calculator", href: "/calculator" },
      { label: "Health Calculator", href: "/health-calculator" },
      { label: "Diabetes", href: "/calculator" },
      { label: "Blood Pressure", href: "/calculator" },
      { label: "Healthy Aging", href: "/calculator" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Team members", href: "/team" },
      { label: "FAQ", href: "/faq" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "WhatsApp Support", href: "https://wa.me/2347047296000" },
      { label: "Delivery Zones", href: "/contact" },
      { label: "Returns", href: "/contact" },
      { label: "+234 704 729 6000", href: "tel:+2347047296000" },
      { label: "FAQ", href: "/faq" },
    ],
  },
];

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => { });
  }, []);

  const siteName = settings?.siteName ?? "ESHMARTAGROX";
  const tagline = settings?.tagline ?? "Nigeria's home for healthy eating, senior wellness, smart grocery delivery and organic commodity exports to Europe, USA & Asia.";
  const year = new Date().getFullYear();

  // Build social links dynamically from settings — only show configured ones
  const socials = [
    { label: "Facebook", href: settings?.facebook },
    { label: "Instagram", href: settings?.instagram },
    { label: "TikTok", href: settings?.tiktok },
    { label: "YouTube", href: settings?.youtube },
    { label: "LinkedIn", href: settings?.linkedin },
    { label: "Pinterest", href: settings?.pinterest },
    { label: "Threads", href: settings?.threads },
    { label: "Twitter/X", href: settings?.twitter },
    { label: "WhatsApp", href: settings?.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}` : undefined },
  ].filter(s => s.href);

  return (
    <footer className="bg-[#FFFDF7] border-t border-gray-200 pt-14 pb-8">
      <div className="container-max">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 shrink-0">
                {settings?.logoUrl
                  ? <Image src={settings.logoUrl} alt={siteName} fill className="object-contain" />
                  : <Image src="/assets/eshmartlogo.png" alt={siteName} width={32} height={32} className="object-contain" />}
              </div>
              <span className="font-bold text-sm tracking-widest text-gray-900 uppercase">{siteName}</span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed max-w-[220px]">{tagline}</p>

            {/* Social links — dynamic from admin */}
            <div className="flex flex-wrap gap-1.5">
              {socials.length > 0 ? (
                socials.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600 hover:border-gray-400 hover:text-gray-900 cursor-pointer transition-colors">
                    {s.label}
                  </a>
                ))
              ) : (
                // Fallback placeholder pills while settings load
                ["Facebook", "Instagram", "TikTok", "YouTube"].map(s => (
                  <span key={s} className="border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-400">
                    {s}
                  </span>
                ))
              )}
            </div>

            {/* Payment methods */}
            <p className="text-xs text-gray-400">Paystack · Flutterwave · Bank transfer · USSD</p>
          </div>

          {/* Link columns */}
          {COLS.map(col => (
            <div key={col.heading}>
              <h3 className="text-sm font-bold text-gray-900 mb-4">{col.heading}</h3>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">© {year} {siteName}. All rights reserved.</p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            Made in Lagos with <span className="text-green-600">♥</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

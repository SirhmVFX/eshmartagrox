"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getSiteSettings, SiteSettings } from "@/lib/firestore";

function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => { });
  }, []);

  const phone = settings?.contactPhone ?? "+234 800 ESHMART";
  const email = settings?.contactEmail ?? "export@eshmartagrox.com";
  const address = settings?.address ?? "20b Kingsley Emu Street, Lekki Phase 1 Lagos";
  const copyright = `© ${new Date().getFullYear()} ${settings?.siteName ?? "Eshmart Agrox"}. All Rights Reserved.`;

  return (
    <footer className="py-8 md:py-20 mt-auto">
      <div className="w-[90%] mx-auto">
        <div className="w-full bg-green-900 h-px" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-8 md:mt-12">
          <div>
            {settings?.logoUrl ? (
              <div className="relative w-20 h-20 mb-4">
                <Image src={settings.logoUrl} alt={settings.siteName} fill className="object-contain" />
              </div>
            ) : (
              <Image src="/assets/eshmartlogo.png" alt="Eshmart Agrox Logo" width={1000} height={1000} className="object-contain w-20 h-20 md:w-60 md:h-auto" />
            )}
            <p className="text-sm md:text-base">{settings?.tagline ?? "Premium Nigerian produce for international markets."}</p>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold mb-2">Lagos Office</h1>
            <p className="text-sm md:text-base">{address}</p>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold mb-2">Inquiries</h1>
            <p className="text-sm md:text-base">T: {phone}</p>
            <p className="text-sm md:text-base">E: <a href={`mailto:${email}`} className="hover:underline">{email}</a></p>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold mb-2">Social Media</h1>
            <p className="text-sm md:text-base">{copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

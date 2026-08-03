"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getCTA, CTA } from "@/lib/firestore";

function Calltoaction() {
  const [cta, setCta] = useState<CTA | null>(null);

  useEffect(() => {
    getCTA().then(setCta).catch(() => { });
  }, []);

  const title = cta?.title ?? "Start Your Export Inquiry";
  const description = cta?.description ?? "Ready to source premium Nigerian okra and ugu? Share your requirements with our export experts and receive a customized quote.";
  const secondaryTitle = cta?.secondaryTitle ?? "From Soil to Soul";

  return (
    <div>
      {/* Top green banner */}
      <div className="bg-green-900 py-10 md:py-20">
        <div className="w-[90%] mx-auto space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white leading-tight">{title}</h1>
          <p className="text-white text-sm sm:text-base max-w-xl opacity-90">{description}</p>
        </div>
      </div>

      {/* Image panel with overlay card */}
      <div className="relative w-full h-64 sm:h-80 md:h-[500px] flex items-center">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={cta?.contactImage || "/assets/10.jpg"}
            alt="Contact"
            fill
            className="object-cover"
          />
        </div>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-green-900/40" />

        {/* Overlay card — responsive positioning */}
        <div className="relative z-10 w-[90%] mx-auto md:w-auto md:ml-auto md:mr-[8%] border border-white p-6 sm:p-8 md:p-12 max-w-sm md:max-w-md">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-snug">{secondaryTitle}</h2>
          {cta?.secondaryDescription && (
            <p className="text-white text-sm mt-2 opacity-90">{cta.secondaryDescription}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Calltoaction;

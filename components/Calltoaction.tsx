"use client";

import Image from "next/image";
import { useSiteContent } from "@/components/ContentProvider";

const FALLBACK_CONTACT = "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&q=80";

function Calltoaction() {
  const { callToAction } = useSiteContent();

  const contactImg = callToAction.contactImage || FALLBACK_CONTACT;

  return (
    <div>
      <div className="bg-green-900 py-12 md:py-20">
        <div className="w-[90%] md:w-350 mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Start Your Export Inquiry</h1>
          <p className="text-white w-full md:w-1/2 text-sm md:text-base">Ready to source premium Nigerian okra and ugu? Share your requirements with our export experts and receive a customized quote.</p>
        </div>
      </div>
      <div className="flex relative mx-auto py-12 gap-8 items-center h-64 sm:h-125 md:h-200">
        <div className="bg-green-900/30 absolute top-0 left-0 right-0 bottom-0 z-10"></div>
        <div className="absolute left-0 top-0 right-0 bottom-0">
          <Image
            src="/assets/10.jpg"
            alt="Contact"
            fill
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute left-4 sm:left-[20%] md:left-[40%] z-20 border border-white p-6 sm:p-8 md:p-12">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            From Soil to Soul
          </h1>
        </div>
      </div>
    </div>
  );
}

export default Calltoaction;

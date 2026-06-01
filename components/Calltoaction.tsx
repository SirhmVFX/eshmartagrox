"use client";

import Image from "next/image";
import { useSiteContent } from "@/components/ContentProvider";

const FALLBACK_CONTACT = "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&q=80";

function Calltoaction() {
  const { callToAction } = useSiteContent();

  const contactImg = callToAction.contactImage || FALLBACK_CONTACT;

  return (
    <div>
      <div className="bg-green-900 py-20">
        <div className="w-[90%] mx-auto space-y-4">
          <h1 className="text-5xl font-bold text-white">{callToAction.title}</h1>
          <p className="text-white w-1/2">{callToAction.description}</p>
        </div>
      </div>
      <div className="flex w-[90%] mx-auto py-12 gap-8 items-center">
        <div className="relative w-[420px] h-[320px] flex-shrink-0">
          <Image
            src={contactImg}
            alt="Contact"
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-green-900">
            {callToAction.secondaryTitle}
          </h1>
          <p className="mt-4 text-green-900">{callToAction.secondaryDescription}</p>
        </div>
      </div>
    </div>
  );
}

export default Calltoaction;

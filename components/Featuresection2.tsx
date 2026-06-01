"use client";

import Image from "next/image";
import { useSiteContent } from "@/components/ContentProvider";

const FALLBACK_MAIN = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80";
const FALLBACK_SECONDARY = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80";

function Featuresection2() {
  const { homeQuality } = useSiteContent();

  const mainImg = homeQuality.mainImage || FALLBACK_MAIN;
  const secondaryImg = homeQuality.secondaryImage || FALLBACK_SECONDARY;

  return (
    <div className="bg-green-200 py-20">
      <div className="w-[90%] mx-auto space-y-4">
        <h1 className="text-5xl font-bold w-1/2">{homeQuality.sectionTitle}</h1>
        <div className="grid grid-cols-2 gap-8">
          <div className="relative w-full h-[480px]">
            <Image
              src={mainImg}
              alt="Quality cultivation"
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="space-y-10">
            {homeQuality.blocks.map((block) => (
              <div key={block.id} className="space-y-4">
                <h2 className="text-2xl font-bold">{block.title}</h2>
                <div className="w-full bg-green-900 h-px" />
                <p>{block.description}</p>
              </div>
            ))}
            <div className="relative w-full h-56">
              <Image
                src={secondaryImg}
                alt="Quality warehouse"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Featuresection2;

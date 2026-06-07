"use client";

import Image from "next/image";
import { useSiteContent } from "@/components/ContentProvider";

const FALLBACK_MAIN = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80";
const FALLBACK_SECONDARY = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80";

function Featuresection2() {

  const sectionBlocks = [
    {
      id: 1,
      title: "Ethical Cultivation",
      subtext: "Our okra and ugu cultivation begins with non-GMO seeds and organic soil enrichment. We employ advanced irrigation and pest-management systems that prioritize environmental health while maximizing nutrient density for the European market."
    },
    {
      id: 2,
      title: "Rigorous Export Audit",
      subtext: "Each harvest undergoes a multi-stage audit: physical uniformity analysis, residue testing, and rapid cooling. Our quality compliance ensures every batch meets phytosanitary standards for international trade."
    }
  ]


  return (
    <div className="bg-[#F4F7ED] py-12 md:py-20">
      <div className="w-[90%] md:w-350 mx-auto space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold w-full md:w-1/2 text-green-900 mb-8 md:mb-12">Meticulous Cultivation and Export Grade Quality Systems</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative w-full h-80 md:h-225">
            <Image
              src="/assets/8.jpg"
              alt="Quality cultivation"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-6 md:space-y-10">
            {sectionBlocks.map((block) => (
              <div key={block.id} className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold  text-green-900">{block.title}</h2>
                <div className="w-full bg-green-900 h-px" />
                <p className="text-sm md:text-base">{block.subtext}</p>
              </div>
            ))}
            <div className="relative w-full h-64 md:h-125">
              <Image
                src="/assets/9.jpg"
                alt="Quality warehouse"
                fill
                className="object-cover "
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Featuresection2;

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getQualityBlocks, getQualitySection, QualityBlock, QualitySection } from "@/lib/firestore";

const FALLBACK_BLOCKS: QualityBlock[] = [
  { title: "Ethical Cultivation", description: "Our okra and ugu cultivation begins with non-GMO seeds and organic soil enrichment. We employ advanced irrigation and pest-management systems that prioritize environmental health while maximizing nutrient density for the European market.", order: 1, active: true },
  { title: "Rigorous Export Audit", description: "Each harvest undergoes a multi-stage audit: physical uniformity analysis, residue testing, and rapid cooling. Our quality compliance ensures every batch meets phytosanitary standards for international trade.", order: 2, active: true },
];

const DEFAULT_HEADING = "Meticulous Cultivation and Export Grade Quality Systems";
const DEFAULT_MAIN_IMAGE = "/assets/8.jpg";
const DEFAULT_SECONDARY_IMAGE = "/assets/9.jpg";

function Featuresection2() {
  const [blocks, setBlocks] = useState<QualityBlock[]>([]);
  const [section, setSection] = useState<QualitySection | null>(null);

  useEffect(() => {
    getQualityBlocks()
      .then((data) => setBlocks(data.length > 0 ? data : FALLBACK_BLOCKS))
      .catch(() => setBlocks(FALLBACK_BLOCKS));

    getQualitySection()
      .then((data) => { if (data) setSection(data); })
      .catch(() => { });
  }, []);

  const displayed = blocks.length > 0 ? blocks : FALLBACK_BLOCKS;
  const heading = section?.heading || DEFAULT_HEADING;
  const mainImage = section?.mainImage || DEFAULT_MAIN_IMAGE;
  const secondaryImage = section?.secondaryImage || DEFAULT_SECONDARY_IMAGE;

  return (
    <div className="bg-[#F4F7ED] py-12 md:py-20">
      <div className="w-[90%] md:w-350 mx-auto space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold w-full md:w-1/2 text-green-900 mb-8 md:mb-12">
          {heading}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative w-full h-80 md:h-225 overflow-hidden">
            <div className="absolute inset-0">
              <Image src={mainImage} alt="Quality cultivation" fill className="object-cover" />
            </div>
          </div>
          <div className="space-y-6 md:space-y-10">
            {displayed.map((block, i) => (
              <div key={block.id ?? i} className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-green-900">{block.title}</h2>
                <div className="w-full bg-green-900 h-px" />
                <p className="text-sm md:text-base">{block.description}</p>
              </div>
            ))}
            <div className="relative w-full h-64 md:h-125 overflow-hidden">
              <div className="absolute inset-0">
                <Image src={secondaryImage} alt="Quality warehouse" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Featuresection2;

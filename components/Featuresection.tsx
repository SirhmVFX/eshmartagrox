"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProduceCards, getProduceSection, ProduceCard, ProduceSection } from "@/lib/firestore";

const FALLBACK: ProduceCard[] = [
  { number: "01", image: "/assets/6.jpg", title: "Export Grade Okra", description: "Hand-picked for uniform size and vibrant color, ensuring the highest standards for European markets.", ctaLabel: "Inquire Now", ctaHref: "/contact", order: 1, active: true },
  { number: "02", image: "/assets/7.jpg", title: "Premium Ugu Leaves", description: "Nutrient-rich fluted pumpkin leaves, flash-chilled within 4 hours of harvest for maximum freshness.", ctaLabel: "Inquire Now", ctaHref: "/contact", order: 2, active: true },
  { number: "03", image: "", title: "Seasonal Specialities", description: "Beyond our core exports, we curate a selection of seasonal Nigerian produce tailored for luxury grocery retailers and bulk wholesalers in Europe.", ctaLabel: "Inquire Now", ctaHref: "/contact", order: 3, active: true },
];

const DEFAULT_HEADING = "Our Produce";
const DEFAULT_SUBTEXT = "Premium Nigerian harvests meticulously selected for international prestige and exceptional freshness.";

function Featuresection() {
  const [cards, setCards] = useState<ProduceCard[]>([]);
  const [section, setSection] = useState<ProduceSection | null>(null);

  useEffect(() => {
    getProduceCards()
      .then((data) => setCards(data.length > 0 ? data : FALLBACK))
      .catch(() => setCards(FALLBACK));

    getProduceSection()
      .then((data) => { if (data) setSection(data); })
      .catch(() => { });
  }, []);

  const displayed = cards.length > 0 ? cards : FALLBACK;
  const heading = section?.heading || DEFAULT_HEADING;
  const subtext = section?.subtext || DEFAULT_SUBTEXT;

  return (
    <div className="py-12 md:py-20">
      <div className="w-[90%] md:w-350 mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-green-900">{heading}</h1>
        <p className="text-green-900 mt-2">{subtext}</p>
        <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 justify-between mt-8 gap-6 md:gap-8">
          {displayed.map((card, i) => (
            <div key={card.id ?? i} className="space-y-4">
              {card.image && (
                <div className="relative w-full h-72 sm:h-100 md:h-150 overflow-hidden">
                  <Image src={card.image} alt={card.title} fill className="object-cover" />
                </div>
              )}
              <p className="text-green-900 font-mono text-sm">{card.number}</p>
              <h2 className="text-xl md:text-2xl font-bold text-green-900">{card.title}</h2>
              <p className="text-green-900 text-sm md:text-base">{card.description}</p>
              <Link href={card.ctaHref || "/contact"} className="inline-block border border-green-900 py-2 px-4 text-green-900 hover:bg-green-900 hover:text-white transition-colors">
                {card.ctaLabel || "Inquire Now"}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Featuresection;

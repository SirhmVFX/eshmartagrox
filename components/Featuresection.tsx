"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "@/components/ContentProvider";

// Fallback images per card index
const CARD_FALLBACKS = [
  "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=600&q=80",
  "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80",
  "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80",
];

function Featuresection() {


  const produce = [
    {
      id: "01",
      image: "/assets/6.jpg",
      title: "Export Grade Okra",
      subtext: "Hand-picked for uniform size and vibrant color, ensuring the highest standards for European markets."
    },
    {
      id: "02",
      image: "/assets/7.jpg",
      title: "Export Grade Okra",
      subtext: "Hand-picked for uniform size and vibrant color, ensuring the highest standards for European markets."
    },
    {
      id: "03",
      title: "Seasonal Specialities",
      subtext: "Beyond our core exports, we curate a selection of seasonal Nigerian produce tailored for luxury grocery retailers and bulk wholesalers in Europe."
    }
  ]

  return (
    <div className="py-20">
      <div className="w-350 mx-auto">
        <h1 className="text-4xl font-bold text-green-900">Our Produce</h1>
        <p className="text-green-900">Premium Nigerian harvests meticulously selected for international prestige and exceptional freshness.</p>
        <div className="mx-auto grid grid-cols-3 justify-between mt-8 gap-8">
          {produce.map((card, i) => {
            const imgSrc = card.image || CARD_FALLBACKS[i % CARD_FALLBACKS.length];
            return (
              <div key={card.id} className="space-y-4">
                {card.image ?
                  <div className="relative w-full h-150 overflow-hidden ">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  : ""}
                <p className="text-green-900 font-mono text-sm">{card.id}</p>
                <h2 className="text-2xl font-bold text-green-900">{card.title}</h2>
                <p className="text-green-900">{card.subtext}</p>
                <Link
                  href="/contact"
                  className="inline-block border border-green-900 py-2 px-4 text-green-900 hover:bg-green-900 hover:text-white transition-colors"
                >
                  Inquire Now
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Featuresection;

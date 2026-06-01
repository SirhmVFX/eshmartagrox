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
  const { homeFeatures } = useSiteContent();

  return (
    <div className="py-20">
      <div className="w-[90%] mx-auto">
        <h1 className="text-4xl font-bold text-green-900">{homeFeatures.sectionTitle}</h1>
        <p className="text-green-900">{homeFeatures.sectionSubtitle}</p>
        <div className="mx-auto grid grid-cols-3 justify-between mt-8 gap-8">
          {homeFeatures.cards.map((card, i) => {
            const imgSrc = card.image || CARD_FALLBACKS[i % CARD_FALLBACKS.length];
            return (
              <div key={card.id} className="space-y-4">
                <div className="relative w-full h-56 overflow-hidden rounded-lg">
                  <Image
                    src={imgSrc}
                    alt={card.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-green-900 font-mono text-sm">{card.number}</p>
                <h2 className="text-2xl font-bold text-green-900">{card.title}</h2>
                <p className="text-green-900">{card.description}</p>
                <Link
                  href={card.ctaHref}
                  className="inline-block border border-green-900 py-2 px-4 text-green-900 hover:bg-green-900 hover:text-white transition-colors"
                >
                  {card.ctaLabel}
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

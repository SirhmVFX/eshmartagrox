"use client";

import Image from "next/image";
import { useSiteContent } from "@/components/ContentProvider";

const FALLBACKS = [
  "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80",
  "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80",
  "https://images.unsplash.com/photo-1615485290382-441d4f1e1e8c?w=600&q=80",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80",
  "https://images.unsplash.com/photo-1610832958506-aa563681aa1f?w=600&q=80",
];

function Portfolio() {
  const { portfolio } = useSiteContent();
  const items = portfolio.items.filter((i) => i.isPublished);

  return (
    <div className="w-[90%] mx-auto py-20">
      <h1 className="text-4xl font-bold text-green-900">{portfolio.pageTitle}</h1>
      <p className="text-green-900 mt-2 mb-12">{portfolio.pageSubtitle}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map((item, i) => {
          const imgSrc = item.image || FALLBACKS[i % FALLBACKS.length];
          return (
            <div key={item.id} className="space-y-4">
              <div className="relative h-64 w-full">
                <Image
                  src={imgSrc}
                  alt={item.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <h2 className="text-xl font-bold text-green-900">{item.title}</h2>
              <p className="text-gray-600">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Portfolio;

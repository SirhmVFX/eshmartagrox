"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPortfolioItems, PortfolioItem } from "@/lib/firestore";

const FALLBACK: PortfolioItem[] = [
  { title: "Ugu - The Nigerian Superfood", description: "Featuring our high-quality Ugu leaves, carefully harvested and prepared for export.", image: "/assets/11.jpg", order: 1, active: true },
  { title: "Buyer Inquiry Portal", description: "Facilitating seamless transactions with our international buyers.", image: "/assets/12.jpg", order: 2, active: true },
  { title: "Cultivation Excellence", description: "An in-depth look at Eshmart Agrox's farming practices and sustainable cultivation.", image: "/assets/13.jpg", order: 3, active: true },
  { title: "Rigorous Quality Assurance", description: "Detailing Eshmart's multi-stage quality control processes from farm to export.", image: "/assets/14.jpg", order: 4, active: true },
  { title: "Our Produce Range", description: "An overview of the various types of premium Nigerian produce Eshmart Agrox offers for export.", image: "/assets/15.jpg", order: 5, active: true },
  { title: "Premium Okra Export", description: "Showcasing Eshmart's top-grade Okra, ready for export to European markets.", image: "/assets/10.jpg", order: 6, active: true },
];

function Portfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPortfolioItems()
      .then((data) => setItems(data.length > 0 ? data : FALLBACK))
      .catch(() => setItems(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const displayed = items.length > 0 ? items : FALLBACK;

  return (
    <div className="w-[90%] mx-auto py-12 md:py-20">
      <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-green-900 mb-8 md:mb-16">Portfolio</h1>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading portfolio…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {displayed.map((item, i) => {
            const hasDetailPage = !!item.id && (!!item.content || (item.galleryImages?.length ?? 0) > 0);
            return (
              <div key={item.id ?? i} className="space-y-6 group ">
                {/* Cover image — links to detail page if content exists */}
                {item.id && hasDetailPage ? (
                  <Link href={`/portfolio/${item.id}`}>
                    <div className="relative h-72 sm:h-100 md:h-80 w-full overflow-hidden ">
                      <Image
                        src={item.image || "/assets/10.jpg"}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                ) : (
                  <div className="relative h-72 sm:h-100 md:h-80 w-full overflow-hidden">
                    <Image
                      src={item.image || "/assets/10.jpg"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Title */}
                {item.id && hasDetailPage ? (
                  <Link href={`/portfolio/${item.id}`}>
                    <h2 className="text-xl md:text-2xl font-bold text-green-900 hover:underline my-4">
                      {item.title}
                    </h2>
                  </Link>
                ) : (
                  <h2 className="text-xl md:text-2xl font-bold text-green-900 my-4">{item.title}</h2>
                )}

                <p className="text-sm md:text-base text-gray-600">{item.description}</p>

                <div className="flex flex-wrap gap-3">
                  {/* Detail page CTA */}
                  {item.id && hasDetailPage && (
                    <Link
                      href={`/portfolio/${item.id}`}
                      className="inline-block border border-green-900 py-2 px-4 text-green-900 text-sm hover:bg-green-900 hover:text-white transition-colors"
                    >
                      View details →
                    </Link>
                  )}
                  {/* External link */}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block border border-gray-300 py-2 px-4 text-gray-600 text-sm hover:border-green-900 hover:text-green-900 transition-colors"
                    >
                      View project →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Portfolio;

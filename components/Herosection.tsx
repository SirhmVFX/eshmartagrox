"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getHeroSlides, HeroSlide } from "@/lib/firestore";

const FALLBACK: HeroSlide[] = [
  { image: "/assets/1.jpg", headline: "Nigerian Produce. Exported with Integrity.", subheadline: "We bridge the gap between Nigeria's finest farms and European markets, delivering premium grade Okra and Ugu with an unwavering commitment to quality and transparency.", ctaLabel: "View Products", ctaHref: "/shop", order: 1, active: true },
  { image: "/assets/2.jpg", headline: "Export Grade Okra — Straight from Nigerian Farms.", subheadline: "Hand-picked for uniform size and vibrant color. Every crate meets EU phytosanitary standards, cold-chained from packhouse to port.", ctaLabel: "Shop Okra", ctaHref: "/shop", order: 2, active: true },
  { image: "/assets/3.jpg", headline: "Premium Ugu Leaves — Freshness Preserved.", subheadline: "Nutrient-dense Nigerian fluted pumpkin leaves, flash-chilled within 4 hours of harvest and shipped to diaspora markets across Europe.", ctaLabel: "Shop Ugwu", ctaHref: "/shop", order: 3, active: true },
];

function Herosection() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    getHeroSlides()
      .then((data) => setSlides(data.length > 0 ? data : FALLBACK))
      .catch(() => setSlides(FALLBACK));
  }, []);

  const displayed = slides.length > 0 ? slides : FALLBACK;

  const next = useCallback(() => setCurrent((c) => (c + 1) % displayed.length), [displayed.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + displayed.length) % displayed.length), [displayed.length]);

  useEffect(() => {
    if (displayed.length <= 1) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [displayed.length, next]);

  const slide = displayed[current];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Mobile: stacked. Desktop: side-by-side */}
      <div className="flex flex-col md:flex-row md:h-[85vh]">

        {/* Image panel */}
        <div className="relative w-full h-56 sm:h-72 md:h-full md:w-[58%] overflow-hidden">
          <Image
            src={slide?.image || "/assets/1.jpg"}
            alt={slide?.headline || "Hero"}
            fill
            sizes="(max-width: 768px) 100vw, 58vw"
            className="object-cover transition-opacity duration-700"
            priority
          />
          {/* Mobile: slide dots overlay on image */}
          {displayed.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 md:hidden">
              {displayed.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Slide ${i + 1}`}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? 20 : 7,
                    height: 7,
                    background: i === current ? "#fff" : "rgba(255,255,255,0.5)",
                    border: "none",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Text panel */}
        <div className="w-full md:w-[42%] px-5 py-8 sm:px-8 sm:py-10 md:px-14 md:py-0 flex flex-col justify-center gap-4 md:gap-6 bg-white">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-green-900 leading-tight transition-all duration-500">
            {slide?.headline}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed transition-all duration-500 max-w-md">
            {slide?.subheadline}
          </p>
          <Link
            href={slide?.ctaHref || "/shop"}
            className="inline-block bg-green-900 text-white px-5 py-2.5 w-fit text-sm sm:text-base font-medium hover:bg-green-800 transition-colors"
          >
            {slide?.ctaLabel || "View Products"}
          </Link>

          {/* Desktop: dots in text panel */}
          {displayed.length > 1 && (
            <div className="hidden md:flex items-center gap-2 pt-2">
              {displayed.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Slide ${i + 1}`}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? 24 : 8,
                    height: 8,
                    background: i === current ? "#14532d" : "rgba(20,83,45,0.25)",
                    border: "none",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Prev / Next arrows — only on desktop, positioned on the image */}
      {displayed.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-green-900/70 text-white hover:bg-green-900 transition-colors text-lg"
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="hidden md:flex absolute right-[43%] top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-green-900/70 text-white hover:bg-green-900 transition-colors text-lg"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}

export default Herosection;

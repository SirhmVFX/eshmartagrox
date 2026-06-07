"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useSiteContent } from "@/components/ContentProvider";
import type { HeroSlide } from "@/lib/types";


function Herosection() {


  const [current, setCurrent] = useState(0);

  const heroSlidee = [
    {
      id: 1,
      image: "/assets/1.jpg",
      headline: "Nigerian Produce. Exported with Integrity.",
      subtext: "We bridge the gap between Nigeria's finest farms and European markets, delivering premium grade Okra and Ugu with an unwavering commitment to quality and transparency.",
      buttonText: "View Products",
      url: "/products"
    },
    {
      id: 2,
      image: "/assets/2.jpg",
      headline: "Export Grade Okra — Straight from Nigerian Farms.",
      subtext: "Hand-picked for uniform size and vibrant color. Every crate meets EU phytosanitary standards, cold-chained from packhouse to port.",
      buttonText: "Shop Okro",
      url: "/products"
    },
    {
      id: 3,
      image: "/assets/3.jpg",
      headline: "Premium Ugu Leaves — Freshness Preserved.",
      subtext: "Nutrient-dense Nigerian fluted pumpkin leaves, flash-chilled within 4 hours of harvest and shipped to diaspora markets across Europe.",
      buttonText: "Shop Ugwu",
      url: "/products"
    },
    {
      id: 3,
      image: "/assets/4.jpg",
      headline: "Ethical Cultivation. Transparent Supply Chains.",
      subtext: "From non-GMO seeds to certified packhouses — every step of our supply chain is documented, audited, and traceable for our European partners.",
      buttonText: "View Portfolio",
      url: "/products"
    },
    {
      id: 5,
      image: "/assets/5.jpg",
      headline: "Cold Chain Excellence. 99.2% Arrival Freshness.",
      subtext: "Our rapid cooling and transit quality systems ensure your produce arrives in perfect condition — every time, every shipment.",
      buttonText: "Start Enquiry",
      url: "/products"
    }
  ]

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % heroSlidee.length),
    [heroSlidee.length]
  );
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + heroSlidee.length) % heroSlidee.length),
    [heroSlidee.length]
  );

  // Auto-advance every 6 s when there are multiple heroSlidee
  useEffect(() => {
    if (heroSlidee.length <= 1) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [heroSlidee.length, next]);







  return (
    <div className="relative overflow-hidden h-[80vh] w-[1400] mx-auto">
      {/* ── Original two-column layout ── */}
      {heroSlidee && heroSlidee.length > 0 ? heroSlidee.map((hero) => (
        <div className="mx-auto flex justify-between items-stretch h-full">
          {/* Left — image */}
          <div className="w-[60%] relative h-full overflow-hidden">
            <Image
              key={hero.id}
              src={hero.image}
              alt={hero.headline}
              fill
              sizes="60vw"
              className="w-full h-full object-cover transition-opacity duration-700"
              priority
            />
          </div>

          {/* Right — text */}
          <div className="w-[40%] p-24 space-y-6 flex flex-col justify-center h-full bg-white">
            <h1
              key={`h-${hero.id}`}
              className="text-6xl font-bold text-green-900 transition-all duration-500"
            >
              {hero.headline}
            </h1>
            <p key={`p-${hero.id}`} className="transition-all duration-500">
              {hero.subtext}
            </p>
            <Link
              href={hero.url}
              className="inline-block bg-green-900 text-white px-4 py-2 w-fit"
            >
              {hero.buttonText}
            </Link>
          </div>
        </div>
      )) : ""}

      {/* ── Slider controls (only shown when multiple slides) ── */}
      {heroSlidee.length > 1 && (
        <>
          {/* Prev / Next arrows */}
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-green-900/70 text-white hover:bg-green-900 transition-colors text-lg"
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-green-900/70 text-white hover:bg-green-900 transition-colors text-lg"
          >
            ›
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {heroSlidee.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? 24 : 8,
                  height: 8,
                  background: i === current ? "#14532d" : "rgba(20,83,45,0.35)",
                  border: "none",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Herosection;

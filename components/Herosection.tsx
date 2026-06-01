"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useSiteContent } from "@/components/ContentProvider";
import type { HeroSlide } from "@/lib/types";

const FALLBACK_SLIDE: HeroSlide = {
  id: "fallback",
  image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&q=80",
  headline: "Nigerian Produce. Exported with Integrity.",
  subheadline:
    "We bridge the gap between Nigeria's finest farms and European markets.",
  ctaLabel: "View Our Products",
  ctaHref: "/shop",
};

function Herosection() {
  const { hero } = useSiteContent();

  // Build slides array — support both new slides[] and legacy single-slide fields
  const slides: HeroSlide[] =
    hero.slides && hero.slides.length > 0
      ? hero.slides.slice(0, 5)
      : [
        {
          id: "legacy",
          image: hero.image || FALLBACK_SLIDE.image,
          headline: hero.headline || FALLBACK_SLIDE.headline,
          subheadline: hero.subheadline || FALLBACK_SLIDE.subheadline,
          ctaLabel: hero.ctaLabel || FALLBACK_SLIDE.ctaLabel,
          ctaHref: hero.ctaHref || FALLBACK_SLIDE.ctaHref,
        },
      ];

  const [current, setCurrent] = useState(0);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    [slides.length]
  );
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
    [slides.length]
  );

  // Auto-advance every 6 s when there are multiple slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [slides.length, next]);

  const slide = slides[current];
  const imgSrc = slide.image || FALLBACK_SLIDE.image;

  return (
    <div className="relative overflow-hidden min-h-[90vh]">
      {/* ── Original two-column layout ── */}
      <div className="mx-auto flex justify-between items-center h-full">
        {/* Left — image */}
        <div className="w-[60%] relative h-full">
          <Image
            key={imgSrc}
            src={imgSrc}
            alt={slide.headline}
            width={800}
            height={600}
            className="w-full h-full object-cover transition-opacity duration-700"
            priority
          />
        </div>

        {/* Right — text */}
        <div className="w-[40%] p-24 space-y-6 flex flex-col justify-center h-full">
          <h1
            key={`h-${current}`}
            className="text-6xl font-bold text-green-900 transition-all duration-500"
          >
            {slide.headline}
          </h1>
          <p key={`p-${current}`} className="transition-all duration-500">
            {slide.subheadline}
          </p>
          <Link
            href={slide.ctaHref}
            className="inline-block bg-green-900 text-white px-4 py-2"
          >
            {slide.ctaLabel}
          </Link>
        </div>
      </div>

      {/* ── Slider controls (only shown when multiple slides) ── */}
      {slides.length > 1 && (
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
            {slides.map((_, i) => (
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

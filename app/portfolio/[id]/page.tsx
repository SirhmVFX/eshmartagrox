"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getPortfolioItem, PortfolioItem } from "@/lib/firestore";

export default function PortfolioDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [item, setItem] = useState<PortfolioItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        getPortfolioItem(id)
            .then((data) => setItem(data))
            .catch(() => setItem(null))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="w-[90%] mx-auto py-20 text-center text-gray-400 text-sm">
                Loading…
            </div>
        );
    }

    if (!item) {
        return (
            <div className="w-[90%] mx-auto py-20 text-center">
                <p className="text-gray-600 mb-4">Portfolio item not found.</p>
                <Link href="/portfolio" className="text-green-900 hover:underline text-sm">
                    ← Back to Portfolio
                </Link>
            </div>
        );
    }

    const gallery = item.galleryImages ?? [];

    return (
        <>
            {/* ── Hero cover image ── */}
            {item.image && (
                <div className="w-full h-64 sm:h-96 md:h-130 mt-16 md:mt-20 relative overflow-hidden">
                    <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute bottom-8 left-0 right-0 w-[90%] mx-auto">
                        <Link href="/portfolio" className="text-white/80 text-sm hover:text-white">
                            ← Portfolio
                        </Link>
                    </div>
                </div>
            )}

            <div className="w-[90%] mx-auto py-12 md:py-16 max-w-4xl">
                {/* Back link (no hero) */}
                {!item.image && (
                    <Link href="/portfolio" className="text-green-900 text-sm hover:underline block mb-8 mt-24">
                        ← Back to Portfolio
                    </Link>
                )}

                {/* Title + description */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-900 mb-4">
                    {item.title}
                </h1>
                {item.description && (
                    <p className="text-lg text-gray-600 border-l-4 border-green-900 pl-4 mb-10">
                        {item.description}
                    </p>
                )}

                {/* ── WYSIWYG content ── */}
                {item.content && (
                    <div
                        className="prose prose-lg max-w-none text-gray-700
                            prose-headings:text-green-900 prose-headings:font-bold
                            prose-a:text-green-700 prose-a:underline
                            prose-blockquote:border-green-900 prose-blockquote:italic
                            prose-img:w-full prose-img:object-cover mb-14"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                )}

                {/* ── Gallery ── */}
                {gallery.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-xl md:text-2xl font-bold text-green-900 mb-6">Gallery</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                            {gallery.map((url, i) => (
                                <button
                                    key={i}
                                    onClick={() => setLightbox(url)}
                                    className="relative aspect-square overflow-hidden group bg-gray-100"
                                >
                                    <Image
                                        src={url}
                                        alt={`${item.title} — image ${i + 1}`}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* External link */}
                {item.link && (
                    <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block border border-green-900 px-6 py-3 text-green-900 hover:bg-green-900 hover:text-white transition-colors font-medium text-sm"
                    >
                        View Project →
                    </a>
                )}

                {/* Back link (bottom) */}
                <div className="mt-12 pt-8 border-t border-gray-100">
                    <Link href="/portfolio" className="text-green-900 text-sm hover:underline">
                        ← Back to Portfolio
                    </Link>
                </div>
            </div>

            {/* ── Lightbox ── */}
            {lightbox && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        onClick={() => setLightbox(null)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none"
                        aria-label="Close"
                    >
                        ×
                    </button>
                    <div
                        className="relative w-full max-w-4xl max-h-[90vh] aspect-video"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={lightbox}
                            alt="Gallery image"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            )}
        </>
    );
}

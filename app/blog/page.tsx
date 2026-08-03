"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBlogPosts, BlogPost } from "@/lib/firestore";
import { Eye, MessageCircle, Heart } from "lucide-react";

const FALLBACK: BlogPost[] = [
  { id: "1", title: "Discover Eshmart Agrox's Premium Produce Offerings", excerpt: "Eshmart Agrox is redefining the way we think about fresh produce. With a commitment to quality and sustainability...", author: "Olushola Kofoworola", publishedAt: "2024-03-26", coverImage: "/assets/1.jpg", slug: "discover-eshmart", content: "", active: true, order: 1, tags: [], readingTime: "4 min read" },
  { id: "2", title: "Exporting Premium Okra and Ugu to Europe", excerpt: "The demand for fresh produce in Europe is on the rise, and among the most sought-after...", author: "Olushola Kofoworola", publishedAt: "2024-03-26", coverImage: "/assets/2.jpg", slug: "okra-ugu-europe", content: "", active: true, order: 2, tags: [], readingTime: "5 min read" },
  { id: "3", title: "Quality Checks in Nigerian Produce for Europe", excerpt: "The demand for high-quality agricultural produce in Europe is on the rise, and...", author: "Olushola Kofoworola", publishedAt: "2024-03-26", coverImage: "/assets/3.jpg", slug: "quality-checks", content: "", active: true, order: 3, tags: [], readingTime: "4 min read" },
  { id: "4", title: "Sustainable Farming Practices at Eshmart Agrox", excerpt: "Sustainability is at the core of everything we do. From soil enrichment to water management...", author: "Olushola Kofoworola", publishedAt: "2024-03-25", coverImage: "/assets/4.jpg", slug: "sustainable-farming", content: "", active: true, order: 4, tags: [], readingTime: "6 min read" },
  { id: "5", title: "The Export Journey: From Farm to European Shelf", excerpt: "Every batch of produce that leaves our farm goes through a rigorous multi-stage process...", author: "Olushola Kofoworola", publishedAt: "2024-03-25", coverImage: "/assets/6.jpg", slug: "export-journey", content: "", active: true, order: 5, tags: [], readingTime: "5 min read" },
  { id: "6", title: "Why Nigerian Ugu Leaves Are Taking Europe by Storm", excerpt: "Fluted pumpkin leaves, known locally as Ugu, are now appearing on restaurant menus across...", author: "Olushola Kofoworola", publishedAt: "2024-03-24", coverImage: "/assets/7.jpg", slug: "ugu-europe", content: "", active: true, order: 6, tags: [], readingTime: "3 min read" },
  { id: "7", title: "Cold Chain Logistics for Fresh Produce Export", excerpt: "Maintaining the cold chain is critical for preserving the quality of fresh Nigerian produce...", author: "Olushola Kofoworola", publishedAt: "2024-03-24", coverImage: "/assets/8.jpg", slug: "cold-chain", content: "", active: true, order: 7, tags: [], readingTime: "7 min read" },
  { id: "8", title: "Phytosanitary Standards: What Exporters Must Know", excerpt: "Exporting agricultural produce to Europe requires strict compliance with EU phytosanitary...", author: "Olushola Kofoworola", publishedAt: "2024-03-23", coverImage: "/assets/9.jpg", slug: "phytosanitary", content: "", active: true, order: 8, tags: [], readingTime: "6 min read" },
  { id: "9", title: "Building Relationships With European Wholesalers", excerpt: "Long-term success in produce export depends on trust, consistency, and communication...", author: "Olushola Kofoworola", publishedAt: "2024-03-22", coverImage: "/assets/10.jpg", slug: "wholesaler-relations", content: "", active: true, order: 9, tags: [], readingTime: "4 min read" },
  { id: "10", title: "How We Grade and Sort Okra for Premium Markets", excerpt: "Premium market buyers have exacting standards. Every pod we export is measured, weighed...", author: "Olushola Kofoworola", publishedAt: "2024-03-21", coverImage: "/assets/11.jpg", slug: "okra-grading", content: "", active: true, order: 10, tags: [], readingTime: "5 min read" },
];

const POSTS_PER_PAGE = 10;

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function authorInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function BlogCard({ post }: { post: BlogPost }) {
  const href = post.id ? `/blog/${post.id}` : "#";
  return (
    <article className="flex flex-col gap-3">
      {/* Cover image */}
      <Link href={href} className="block overflow-hidden aspect-4/3 bg-gray-100 relative">
        <Image
          src={post.coverImage || "/assets/1.jpg"}
          alt={post.title}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Author row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-green-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 uppercase">
            {authorInitials(post.author || "A")}
          </div>
          <span className="text-xs text-gray-600 font-medium truncate">{post.author}</span>
        </div>
        {/* Kebab placeholder (decorative) */}
        <button className="text-gray-400 hover:text-gray-600 shrink-0 leading-none px-1" aria-label="More options">⋮</button>
      </div>

      {/* Date · read time */}
      <p className="text-xs text-gray-400">
        {formatDate(post.publishedAt)}
        {post.readingTime && <> · {post.readingTime}</>}
      </p>

      {/* Title */}
      <Link href={href}>
        <h2 className="font-bold text-gray-900 leading-snug line-clamp-3 hover:text-green-900 transition-colors text-sm md:text-base">
          {post.title}
        </h2>
      </Link>

      {/* Excerpt */}
      <p className="text-xs md:text-sm text-gray-500 line-clamp-2 leading-relaxed">
        {post.excerpt}
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-gray-400 text-xs pt-1 border-t border-gray-100">
        <span className="flex items-center gap-1"><Eye size={12} /> 0</span>
        <span className="flex items-center gap-1"><MessageCircle size={12} /> 0</span>
        <span className="flex items-center gap-1 ml-auto text-red-400"><Heart size={12} /></span>
      </div>
    </article>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getBlogPosts()
      .then(data => setPosts(data.length > 0 ? data : FALLBACK))
      .catch(() => setPosts(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const displayed = posts.length > 0 ? posts : FALLBACK;
  const totalPages = Math.ceil(displayed.length / POSTS_PER_PAGE);
  const paginated = displayed.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <div className="w-[90%] mx-auto py-12 md:py-20">
      <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-green-900 mb-10 md:mb-16">
        Blog
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="aspect-4/3 bg-gray-200" />
              <div className="h-3 bg-gray-200 w-2/3" />
              <div className="h-4 bg-gray-200 w-full" />
              <div className="h-3 bg-gray-200 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
            {paginated.map((post, i) => (
              <BlogCard key={post.id ?? i} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 text-sm font-medium text-gray-600 hover:border-green-900 hover:text-green-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                const ellipsis = p === 2 && page > 3;
                const ellipsisEnd = p === totalPages - 1 && page < totalPages - 2;
                if (ellipsis || ellipsisEnd) return <span key={p} className="text-gray-400 px-1">…</span>;
                if (!show) return null;
                return (
                  <button
                    key={p}
                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`w-9 h-9 text-sm font-medium border transition-colors ${p === page ? "bg-green-900 text-white border-green-900" : "border-gray-200 text-gray-600 hover:border-green-900 hover:text-green-900"}`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-200 text-sm font-medium text-gray-600 hover:border-green-900 hover:text-green-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

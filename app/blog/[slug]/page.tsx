"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getBlogPost, getBlogPosts, BlogPost } from "@/lib/firestore";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    // slug could be a Firestore doc id OR a slug string — try both
    getBlogPost(slug)
      .then(async (data) => {
        if (data && data.active) { setPost(data); return; }
        // fallback: search all posts by slug field
        const all = await getBlogPosts();
        const found = all.find((p) => p.slug === slug);
        setPost(found ?? null);
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="w-[90%] max-w-2xl mx-auto pt-24 md:pt-32 pb-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Link href="/blog" className="text-green-900 hover:underline">← Back to blog</Link>
      </div>
    );
  }

  return (
    <article className="w-[90%] max-w-3xl mx-auto pt-20 md:pt-28 pb-16 md:pb-24">
      {/* Back link */}
      <Link href="/blog" className="text-green-900 hover:underline text-sm inline-flex items-center gap-1 mb-8 block">
        ← Back to blog
      </Link>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-green-900 leading-tight mb-4">
        {post.title}
      </h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-6">
        {/* Author avatar */}
        <div className="w-7 h-7 rounded-full bg-green-900 text-white text-[11px] font-bold flex items-center justify-center uppercase shrink-0">
          {(post.author ?? "A")[0]}
        </div>
        <span className="text-gray-600 font-medium">{post.author}</span>
        {post.publishedAt && (
          <>
            <span>·</span>
            <span>{new Date(post.publishedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</span>
          </>
        )}
        {post.readingTime && (
          <>
            <span>·</span>
            <span>{post.readingTime}</span>
          </>
        )}
      </div>

      {/* Cover image */}
      {post.coverImage && (
        <div className="relative w-full aspect-[16/9] overflow-hidden mb-8">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      {/* Excerpt */}
      {post.excerpt && (
        <p className="text-base sm:text-lg text-gray-600 border-l-4 border-green-900 pl-4 mb-8 leading-relaxed">
          {post.excerpt}
        </p>
      )}

      {/* Body */}
      {post.content ? (
        <div
          className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700
                        prose-headings:text-green-900 prose-headings:font-bold
                        prose-a:text-green-700 prose-a:underline
                        prose-blockquote:border-green-900 prose-blockquote:italic
                        prose-img:w-full prose-img:h-auto prose-img:object-cover
                        overflow-hidden"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      ) : (
        <p className="text-gray-400 italic">Full content coming soon.</p>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-100">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs bg-green-50 text-green-800 border border-green-200 px-3 py-1">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-gray-100">
        <Link href="/blog" className="text-green-900 hover:underline text-sm">
          ← Back to blog
        </Link>
      </div>
    </article>
  );
}

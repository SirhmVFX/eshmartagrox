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
    return <div className="w-[90%] mx-auto py-20 text-center text-gray-400">Loading…</div>;
  }

  if (!post) {
    return (
      <div className="w-[90%] mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <Link href="/blog" className="mt-4 inline-block text-green-900 hover:underline">← Back to blog</Link>
      </div>
    );
  }

  return (
    <article className="w-[90%] max-w-3xl mx-auto py-12 md:py-20">
      <Link href="/blog" className="text-green-900 hover:underline text-sm">← Back to blog</Link>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-900 mt-6 mb-4">{post.title}</h1>
      <p className="text-gray-500 text-sm md:text-base mt-2 mb-6">
        {post.author}
        {post.publishedAt && ` · ${new Date(post.publishedAt).toLocaleDateString()}`}
      </p>
      {post.coverImage && (
        <div className="relative h-64 md:h-80 w-full overflow-hidden mb-8">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
        </div>
      )}
      {post.excerpt && <p className="text-lg text-gray-600 border-l-4 border-green-900 pl-4 mb-8">{post.excerpt}</p>}
      {post.content ? (
        <div className="prose prose-sm md:prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: post.content }} />
      ) : (
        <p className="text-gray-400 italic">Full content coming soon.</p>
      )}
    </article>
  );
}

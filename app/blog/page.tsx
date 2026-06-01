"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "@/components/ContentProvider";

const BLOG_FALLBACKS = [
  "https://images.unsplash.com/photo-1598170845058-32b9d6a36963?w=800&q=80",
  "https://images.unsplash.com/photo-1464226189744-8e7eb0b9d880?w=800&q=80",
  "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80",
];

export default function BlogPage() {
  const { blog } = useSiteContent();
  const posts = blog.posts.filter((p) => p.isPublished);

  return (
    <div className="w-[90%] mx-auto py-20">
      <h1 className="text-4xl font-bold text-green-900">{blog.pageTitle}</h1>
      <p className="text-green-900 mt-2 mb-12">{blog.pageSubtitle}</p>
      {posts.length === 0 ? (
        <p className="text-gray-500">No blog posts yet. Check back soon.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => {
            const imgSrc = post.coverImage || BLOG_FALLBACKS[i % BLOG_FALLBACKS.length];
            return (
              <article key={post.id} className="rounded-lg border border-green-100 overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src={imgSrc}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <h2 className="text-xl font-bold text-green-900">{post.title}</h2>
                  <p className="text-sm text-gray-500">
                    {post.author}
                    {post.publishedAt &&
                      ` · ${new Date(post.publishedAt).toLocaleDateString()}`}
                  </p>
                  <p className="text-gray-600">{post.excerpt}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-green-900 font-medium hover:underline"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSiteContent } from "@/components/ContentProvider";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { blog } = useSiteContent();
  const post = blog.posts.find((p) => p.slug === slug && p.isPublished);

  if (!post) {
    return (
      <div className="w-[90%] mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <Link href="/blog" className="mt-4 inline-block text-green-900 hover:underline">
          ← Back to blog
        </Link>
      </div>
    );
  }

  return (
    <article className="w-[90%] max-w-3xl mx-auto py-12 md:py-20">
      <Link href="/blog" className="text-green-900 hover:underline text-sm">
        ← Back to blog
      </Link>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-900 mt-6 mb-4">{post.title}</h1>
      <p className="text-gray-500 text-sm md:text-base mt-2 mb-6">
        {post.author}
        {post.publishedAt && ` · ${new Date(post.publishedAt).toLocaleDateString()}`}
      </p>
      <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden mb-8">
        <Image
          src={post.coverImage || "https://images.unsplash.com/photo-1598170845058-32b9d6a36963?w=800&q=80"}
          alt={post.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="prose prose-sm md:prose-lg mt-8 whitespace-pre-wrap text-gray-700">{post.content}</div>
    </article>
  );
}

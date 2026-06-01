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
    <article className="w-[90%] max-w-3xl mx-auto py-20">
      <Link href="/blog" className="text-green-900 hover:underline text-sm">
        ← Back to blog
      </Link>
      <h1 className="text-4xl font-bold text-green-900 mt-6">{post.title}</h1>
      <p className="text-gray-500 mt-2">
        {post.author}
        {post.publishedAt && ` · ${new Date(post.publishedAt).toLocaleDateString()}`}
      </p>
      <div className="relative h-64 w-full mt-8 rounded-lg overflow-hidden">
        <Image
          src={post.coverImage || "https://images.unsplash.com/photo-1598170845058-32b9d6a36963?w=800&q=80"}
          alt={post.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="prose mt-8 whitespace-pre-wrap text-gray-700">{post.content}</div>
    </article>
  );
}

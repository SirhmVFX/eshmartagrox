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
  const blogs = [
    {
      id: 1,
      title: "How crops are maintained",
      excerpt:
        "Managing crops can be a lot of work so you need to pay attention and focus using the right profucts to grow them and motitoring them continuosly ",
      author: "Jane Smith",
      publishedAt: "2023-05-15",
      coverImage: "/assets/1.jpg",
      slug: "/managingcrops"
    },
    {
      id: 2,
      title: "The future of farming",
      excerpt:
        "The future of farming is looking bright with new technologies and sustainable practices that are helping farmers produce more food while protecting the environment.",
      author: "John Doe",
      publishedAt: "2023-06-20",
      coverImage: "/assets/2.jpg",
      slug: "/futureoffarming"
    },
    {
      id: 3,
      title: "Sustainable agriculture practices",
      excerpt:
        "Learn about sustainable agriculture practices that help protect the environment while producing healthy food for our communities.",
      author: "Emily Johnson",
      publishedAt: "2023-07-10",
      coverImage: "/assets/3.jpg",
      slug: "/sustainableagriculture"
    },
    {
      id: 4,
      title: "The importance of soil health",
      excerpt:
        "Healthy soil is the foundation of successful farming. Discover why soil health matters and how to maintain it for better crop yields.",
      author: "Michael Brown",
      publishedAt: "2023-08-05",
      coverImage: "/assets/4.jpg",
      slug: "/importanceofsoil"
    }
  ]

  return (
    <div className="w-[90%] mx-auto py-12 md:py-20">
      <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-green-900 mb-8 md:mb-12 lg:mb-20 text-center md:text-left">Blogs</h1>

      {blogs.length === 0 ? (
        <p className="text-gray-500 text-center">No blog posts yet. Check back soon.</p>
      ) : (
        <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((post, i) => {
            const imgSrc = post.coverImage || BLOG_FALLBACKS[i % BLOG_FALLBACKS.length];
            return (
              <article key={post.id} className="border border-green-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48 sm:h-64 w-full">
                  <Image
                    src={imgSrc}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 sm:p-6 space-y-3">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-green-900 line-clamp-2">{post.title}</h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {post.author}
                    {post.publishedAt &&
                      ` · ${new Date(post.publishedAt).toLocaleDateString()}`}
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 line-clamp-3">{post.excerpt}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-green-900 font-medium hover:underline text-sm sm:text-base"
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

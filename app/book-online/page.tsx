"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "@/components/ContentProvider";

const SERVICE_FALLBACKS = [
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&q=80",
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80",
  "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80",
];

export default function BookOnline() {
  const { services } = useSiteContent();
  const list = services.services.filter((s) => s.isPublished);

  return (
    <div className="w-[90%] mx-auto py-20">
      <h1 className="text-4xl font-bold text-green-900">{services.pageTitle}</h1>
      <p className="text-green-900 mt-2 mb-12">{services.pageSubtitle}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {list.map((item, i) => {
          const imgSrc = item.image || SERVICE_FALLBACKS[i % SERVICE_FALLBACKS.length];
          return (
            <div key={item.id}>
              <div className="relative h-48 w-full">
                <Image
                  src={imgSrc}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-8 border border-green-900/10 space-y-4">
                <h2 className="text-3xl font-bold">{item.title}</h2>
                <div className="w-full h-px bg-green-900/10" />
                <p>{item.duration}</p>
                <p className="font-semibold text-green-900">{item.price}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
                <Link
                  href={item.bookHref}
                  className="inline-block bg-green-900 text-white px-4 py-2"
                >
                  {item.bookLabel}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getExportCommodity, getExportCommodities, getExportHeroContent,
  ExportCommodity,
} from "@/lib/firestore";

export default function ExportCommodityPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ExportCommodity | null>(null);
  const [related, setRelated] = useState<ExportCommodity[]>([]);
  const [others, setOthers] = useState<ExportCommodity[]>([]);
  const [hidePrices, setHidePrices] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setActiveImg(0);
    Promise.all([
      getExportCommodity(id),
      getExportCommodities(),
      getExportHeroContent(),
    ])
      .then(([data, all, hero]) => {
        setItem(data);
        setHidePrices(!!hero?.hidePrices);
        if (!data) return;
        const relatedSet = new Set(data.relatedIds ?? []);
        const rest = all.filter(c => c.id && c.id !== data.id);
        const relatedList = [
          ...rest.filter(c => relatedSet.has(c.id!)),
          ...rest.filter(c => !relatedSet.has(c.id!) && c.category && c.category === data.category),
        ].slice(0, 8);
        const relatedIds = new Set(relatedList.map(c => c.id));
        setRelated(relatedList);
        setOthers(rest.filter(c => !relatedIds.has(c.id)).slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="w-[90%] mx-auto py-20 text-center text-gray-400">Loading…</div>;
  }

  if (!item) {
    return (
      <div className="w-[90%] mx-auto py-12 md:py-20 text-center">
        <h1 className="text-xl md:text-2xl font-bold">Commodity not found</h1>
        <Link href="/export" className="mt-4 inline-block text-green-900 hover:underline">← Back to export catalog</Link>
      </div>
    );
  }

  const images = [item.image, ...(item.galleryImages ?? [])].filter(Boolean) as string[];
  const gallery = images.length ? images : ["/assets/6.jpg"];

  return (
    <div className="w-[90%] mx-auto py-8 md:py-20">
      <Link href="/export" className="text-green-900 hover:underline text-sm mb-4 inline-block">
        ← Back to export catalog
      </Link>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-12">
        {/* Images — same structure as shop */}
        <div className="w-full lg:w-1/2 space-y-3">
          <div className="relative w-full h-80 lg:h-[450px] bg-gray-100 overflow-hidden">
            <Image src={gallery[activeImg] || gallery[0]} alt={item.name} fill className="object-cover" priority />
            <span className="absolute top-3 left-3 bg-green-900 text-white text-xs px-2 py-1 uppercase">
              {item.catalogType}
            </span>
            {item.certification && (
              <span className="absolute top-3 right-3 bg-orange-600 text-white text-xs px-2 py-1">
                {item.certification}
              </span>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {gallery.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImg(i)}
                  className={`relative w-16 h-16 border-2 overflow-hidden ${activeImg === i ? "border-green-900" : "border-gray-200"}`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info — same column rhythm as shop */}
        <div className="w-full lg:w-1/2 space-y-5">
          <div>
            <span className="text-green-600 text-sm font-medium">
              {item.category || "Export"}{item.catalogType ? ` · ${item.catalogType}` : ""}
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mt-1">{item.name}</h1>
          </div>

          {!hidePrices && (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-green-600">
                ${item.priceMin.toLocaleString()} – ${item.priceMax.toLocaleString()}
              </span>
              <span className="text-sm text-gray-400">/ MT FOB</span>
            </div>
          )}

          {item.spec && <p className="text-gray-600 text-sm md:text-base">{item.spec}</p>}
          {item.description && <p className="text-gray-600 text-sm md:text-base">{item.description}</p>}

          <div className="bg-[#FFFDF7] border border-gray-100 rounded-xl p-4 space-y-1.5 text-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Export details</p>
            {item.moq && (
              <div className="flex justify-between"><span className="text-gray-500">MOQ</span><span className="font-medium text-gray-800">{item.moq}</span></div>
            )}
            {item.certification && (
              <div className="flex justify-between"><span className="text-gray-500">Certification</span><span className="font-medium text-gray-800">{item.certification}</span></div>
            )}
            {item.category && (
              <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-medium text-gray-800">{item.category}</span></div>
            )}
            {(item.markets ?? []).length > 0 && (
              <div className="flex justify-between gap-4"><span className="text-gray-500 shrink-0">Markets</span><span className="font-medium text-gray-800 text-right">{item.markets!.join(", ")}</span></div>
            )}
            {(item.packaging ?? []).length > 0 && (
              <div className="flex justify-between gap-4"><span className="text-gray-500 shrink-0">Packaging</span><span className="font-medium text-gray-800 text-right">{item.packaging!.join(", ")}</span></div>
            )}
          </div>

          {(item.markets ?? []).length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Markets</p>
              <div className="flex flex-wrap gap-2">
                {item.markets!.map(m => (
                  <span key={m} className="px-3 py-1 border border-gray-300 text-sm text-gray-700">{m}</span>
                ))}
              </div>
            </div>
          )}

          {(item.packaging ?? []).length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Packaging</p>
              <div className="flex flex-wrap gap-2">
                {item.packaging!.map(p => (
                  <span key={p} className="px-3 py-1 border border-gray-300 text-sm text-gray-700">{p}</span>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/export#quote"
            className="inline-flex w-full sm:w-auto items-center justify-center bg-green-900 text-white px-6 py-3 hover:bg-green-800 transition-colors font-medium text-sm md:text-base"
          >
            Request a quote
          </Link>
        </div>
      </div>

      {item.detailsHtml && (
        <div
          className="mt-12 prose prose-sm sm:prose-base max-w-none text-gray-700
            prose-headings:text-green-900 prose-headings:font-bold
            prose-a:text-green-700 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: item.detailsHtml }}
        />
      )}

      {related.length > 0 && (
        <div className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Related Products</h2>
          <p className="text-sm text-gray-500 mb-6">More from this category</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.map(c => (
              <Link key={c.id} href={`/export/${c.id}`} className="border border-gray-200 group hover:border-green-900 transition-colors block">
                <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                  <Image
                    src={c.image || "/assets/6.jpg"}
                    alt={c.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-green-900">{c.name}</p>
                  {!hidePrices && (
                    <p className="text-green-700 font-bold text-sm">
                      ${c.priceMin.toLocaleString()} – ${c.priceMax.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 capitalize">
                    {c.catalogType}{c.category ? ` · ${c.category}` : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Other Products</h2>
          <p className="text-sm text-gray-500 mb-6">More commodities from the export catalog</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {others.map(c => (
              <Link key={c.id} href={`/export/${c.id}`} className="border border-gray-200 group hover:border-green-900 transition-colors block">
                <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                  <Image
                    src={c.image || "/assets/6.jpg"}
                    alt={c.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-green-900">{c.name}</p>
                  {!hidePrices && (
                    <p className="text-green-700 font-bold text-sm">
                      ${c.priceMin.toLocaleString()} – ${c.priceMax.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 capitalize">
                    {c.catalogType}{c.category ? ` · ${c.category}` : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ExportCommodity,
  ExportCategory,
  ExportCertification,
  ExportMarket,
  ExportPackaging,
  EXPORT_CATEGORIES,
  EXPORT_CERTIFICATIONS,
  EXPORT_MARKETS,
  EXPORT_PACKAGING,
} from "@/lib/firestore";

type ProductTypeFilter = "all" | "raw" | "processed";

interface ExportCatalogProps {
  commodities: ExportCommodity[];
  footnote?: string;
  compact?: boolean;
}

function FilterSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  allLabel = "All",
}: {
  label: string;
  options: readonly T[];
  value: T | "all";
  onChange: (v: T | "all") => void;
  allLabel?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T | "all")}
        className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-[#4ade80] appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.75rem center",
          paddingRight: "2rem",
        }}
      >
        <option value="all" className="bg-[#1a2e1f]">{allLabel}</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#1a2e1f]">
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ExportCatalog({ commodities, footnote, compact }: ExportCatalogProps) {
  const [productType, setProductType] = useState<ProductTypeFilter>("all");
  const [category, setCategory] = useState<ExportCategory | "all">("all");
  const [certification, setCertification] = useState<ExportCertification | "all">("all");
  const [market, setMarket] = useState<ExportMarket | "all">("all");
  const [packaging, setPackaging] = useState<ExportPackaging | "all">("all");

  const filtered = useMemo(() => {
    return commodities.filter((c) => {
      if (productType !== "all" && c.catalogType !== productType) return false;
      if (category !== "all" && c.category !== category) return false;
      if (certification !== "all" && c.certification !== certification) return false;
      if (market !== "all" && !(c.markets ?? []).includes(market)) return false;
      if (packaging !== "all" && !(c.packaging ?? []).includes(packaging)) return false;
      return true;
    });
  }, [commodities, productType, category, certification, market, packaging]);

  const hasActiveFilters =
    productType !== "all" ||
    category !== "all" ||
    certification !== "all" ||
    market !== "all" ||
    packaging !== "all";

  function clearFilters() {
    setProductType("all");
    setCategory("all");
    setCertification("all");
    setMarket("all");
    setPackaging("all");
  }

  return (
    <div className="bg-[#1a2e1f] rounded-2xl overflow-hidden border border-white/5">
      <div className={`${compact ? "px-5 py-3" : "px-6 py-4"} border-b border-white/10`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className={`font-bold text-[#4ade80] ${compact ? "text-sm" : "text-base"}`}>Full export catalog</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[11px] font-semibold text-[#4ade80] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <FilterSelect
            label="Product type"
            options={["raw", "processed"] as const}
            value={productType}
            onChange={setProductType}
            allLabel={`All (${commodities.length})`}
          />
          <FilterSelect label="Category" options={EXPORT_CATEGORIES} value={category} onChange={setCategory} />
          <FilterSelect label="Certification" options={EXPORT_CERTIFICATIONS} value={certification} onChange={setCertification} />
          <FilterSelect label="Market" options={EXPORT_MARKETS} value={market} onChange={setMarket} />
          <FilterSelect label="Packaging" options={EXPORT_PACKAGING} value={packaging} onChange={setPackaging} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className={`text-left ${compact ? "px-3" : "px-5"} py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 w-10`} />
              <th className={`text-left ${compact ? "px-5" : "px-5"} py-3 text-xs font-semibold uppercase tracking-wider text-gray-400`}>Commodity</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 hidden sm:table-cell">Grade / Spec</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 hidden lg:table-cell">Details</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Indicative Price (FOB)</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 hidden md:table-cell">MOQ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-500 text-sm">
                  No commodities match these filters.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id ?? c.name} className="hover:bg-white/5 transition-colors">
                  <td className={`${compact ? "px-3" : "px-3"} py-2.5`}>
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
                      <Image src={c.image || "/assets/6.jpg"} alt={c.name} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 capitalize">{c.catalogType}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-400 hidden sm:table-cell">{c.spec}</td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {c.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300">{c.category}</span>
                      )}
                      {c.certification && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4ade80]/15 text-[#4ade80]">{c.certification}</span>
                      )}
                      {(c.markets ?? []).slice(0, 2).map((m) => (
                        <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300">{m}</span>
                      ))}
                      {(c.packaging ?? []).slice(0, 1).map((p) => (
                        <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300">{p}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-[#4ade80]">
                    ${c.priceMin.toLocaleString()} – ${c.priceMax.toLocaleString()} / MT
                  </td>
                  <td className="px-5 py-3 text-gray-400 hidden md:table-cell">{c.moq}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {footnote && (
        <div className={`${compact ? "px-5 py-2.5" : "px-6 py-3"} border-t border-white/10`}>
          <p className="text-xs text-gray-500">{footnote}</p>
        </div>
      )}
    </div>
  );
}

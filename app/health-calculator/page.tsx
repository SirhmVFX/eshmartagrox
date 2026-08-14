"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getHealthMetrics, getHealthCalculatorPage,
  DEFAULT_HEALTH_METRICS, DEFAULT_HEALTH_PAGE,
  scoreHealthMetric, overallHealthStatus,
} from "@/lib/firestore";
import type { HealthMetric, HealthCalculatorPage as HealthCalculatorContent, HealthStatus } from "@/lib/firestore";

function TrafficLight({ status, size = "lg" }: { status: HealthStatus | null; size?: "lg" | "sm" }) {
  const large = size === "lg";
  const lamp = large ? "w-16 h-16" : "w-5 h-5";
  const wrap = large
    ? "w-[88px] py-3 px-2.5 gap-2.5 rounded-[44px]"
    : "w-7 py-1 px-0.5 gap-1 rounded-full";

  const lamps: { id: HealthStatus; on: string; off: string; glow: string }[] = [
    { id: "bad", on: "bg-red-500", off: "bg-red-950", glow: "shadow-[0_0_22px_#ef4444,inset_0_-6px_10px_rgba(0,0,0,0.35)]" },
    { id: "fair", on: "bg-yellow-400", off: "bg-yellow-950", glow: "shadow-[0_0_22px_#facc15,inset_0_-6px_10px_rgba(0,0,0,0.25)]" },
    { id: "good", on: "bg-green-500", off: "bg-green-950", glow: "shadow-[0_0_22px_#22c55e,inset_0_-6px_10px_rgba(0,0,0,0.35)]" },
  ];

  return (
    <div
      className={`${wrap} bg-[#111] border border-black/40 flex flex-col items-center justify-center`}
      style={{ boxShadow: "inset 0 2px 4px rgba(255,255,255,0.08), 0 8px 20px rgba(0,0,0,0.35)" }}
    >
      {lamps.map(l => {
        const on = status === l.id;
        return (
          <div
            key={l.id}
            className={`${lamp} rounded-full relative overflow-hidden transition-all duration-300 ${
              on ? `${l.on} ${l.glow}` : l.off
            }`}
          >
            {/* glass highlight so the colour reads as a lamp, even when dim */}
            <span className={`absolute top-1 left-1.5 w-1/3 h-1/3 rounded-full ${on ? "bg-white/50" : "bg-white/15"}`} />
          </div>
        );
      })}
    </div>
  );
}

function statusColor(s: HealthStatus) {
  return s === "good" ? "text-green-600" : s === "fair" ? "text-amber-500" : "text-red-600";
}

function statusBg(s: HealthStatus) {
  return s === "good" ? "bg-green-50 border-green-200" : s === "fair" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
}

export default function HealthCalculator() {
  const [metrics, setMetrics] = useState<HealthMetric[]>(DEFAULT_HEALTH_METRICS);
  const [page, setPage] = useState<HealthCalculatorContent>(DEFAULT_HEALTH_PAGE);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getHealthMetrics().then(m => { if (m.length) setMetrics(m); }).catch(() => {});
    getHealthCalculatorPage().then(p => { if (p) setPage(p); }).catch(() => {});
  }, []);

  const heightCm = parseFloat(values.height || "");
  const weightKg = parseFloat(values.weight || "");
  const bmi = useMemo(() => {
    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
    const m = heightCm / 100;
    return weightKg / (m * m);
  }, [heightCm, weightKg]);

  const results = useMemo(() => {
    return metrics
      .filter(m => m.scored)
      .map(m => {
        const raw = m.kind === "derived_bmi" ? bmi : parseFloat(values[m.key] || "");
        if (raw == null || Number.isNaN(raw)) return null;
        return { metric: m, value: raw, status: scoreHealthMetric(m, raw) };
      })
      .filter((r): r is { metric: HealthMetric; value: number; status: HealthStatus } => r !== null);
  }, [metrics, values, bmi]);

  const overall = results.length ? overallHealthStatus(results.map(r => r.status), page) : null;

  const overallLabel =
    overall === "good" ? page.goodLabel :
    overall === "fair" ? page.fairLabel :
    overall === "bad" ? page.badLabel : "Enter your readings to see your status";

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputMetrics = metrics.filter(m => m.kind !== "derived_bmi");
  const derivedMetrics = metrics.filter(m => m.kind === "derived_bmi");

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      <div className="bg-[#FFFDF7] border-b border-gray-200 py-10 text-center">
        <h1 className="text-4xl sm:text-5xl text-gray-900 mb-3">{page.pageTitle}</h1>
        <p className="text-gray-500 max-w-lg mx-auto text-sm px-4">{page.pageSubtitle}</p>
      </div>

      <div className="container-max py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <form onSubmit={handleCalculate} className="lg:col-span-3 space-y-6">
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-4">1. Enter your health readings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inputMetrics.map(m => (
                  <div key={m.key} className="bg-white border border-gray-200 rounded-xl p-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1">
                      <span>{m.icon}</span> {m.label}
                    </label>
                    {m.helpText && <p className="text-xs text-gray-400 mb-2">{m.helpText}</p>}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={values[m.key] ?? ""}
                        onChange={e => setValues(v => ({ ...v, [m.key]: e.target.value }))}
                        placeholder={m.placeholder}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#14532d]"
                      />
                      <span className="text-xs text-gray-500 shrink-0 w-16">{m.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {derivedMetrics.length > 0 && (
              <section>
                <h2 className="text-base font-bold text-gray-900 mb-4">2. Calculated automatically</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {derivedMetrics.map(m => (
                    <div key={m.key} className="bg-white border border-gray-200 rounded-xl p-4">
                      <p className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1">
                        <span>{m.icon}</span> {m.label}
                      </p>
                      {m.helpText && <p className="text-xs text-gray-400 mb-2">{m.helpText}</p>}
                      <p className="text-2xl font-bold text-gray-900">
                        {bmi != null ? bmi.toFixed(1) : "—"}
                        <span className="text-xs font-normal text-gray-400 ml-2">{m.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-xs text-yellow-800">
              <strong>Disclaimer:</strong> {page.disclaimer}
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-[#14532d] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-green-800 transition-colors"
            >
              Calculate health status
            </button>
          </form>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="rounded-2xl p-6 bg-white border border-gray-200">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Health Status</p>
                <div className="flex items-center gap-5">
                  <TrafficLight status={submitted ? overall : null} />
                  <div>
                    <p className={`text-xl font-bold leading-snug ${
                      submitted && overall
                        ? overall === "good" ? "text-green-700" : overall === "fair" ? "text-amber-600" : "text-red-600"
                        : "text-gray-900"
                    }`}>
                      {submitted && overall ? overallLabel : "Awaiting readings"}
                    </p>
                    {submitted && overall && (
                      <p className="text-sm text-gray-500 mt-1">
                        {results.length} of {metrics.filter(m => m.scored).length} scored metrics
                      </p>
                    )}
                    {!submitted && (
                      <p className="text-xs text-gray-400 mt-2">Red · Yellow · Green lamps light up after you calculate.</p>
                    )}
                  </div>
                </div>
              </div>

              {submitted && results.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
                  <p className="font-bold text-gray-900 text-sm">Reading breakdown</p>
                  {results.map(r => (
                    <div key={r.metric.key} className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 ${statusBg(r.status)}`}>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{r.metric.icon} {r.metric.label}</p>
                        <p className="text-xs text-gray-500">
                          {r.value.toFixed(1)} {r.metric.unit}
                          {" · "}green {r.metric.greenMin}–{r.metric.greenMax}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <TrafficLight status={r.status} size="sm" />
                        <span className={`text-xs font-bold ${statusColor(r.status)}`}>
                          {r.status === "good" ? "Good" : r.status === "fair" ? "Fair" : "Poor"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {submitted && results.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-6 text-center">
                  <p className="text-sm text-gray-600">Add at least one reading above to see your traffic-light result.</p>
                </div>
              )}

              {!submitted && (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-6 text-center">
                  <p className="text-3xl mb-2">🚦</p>
                  <p className="text-sm font-medium text-gray-700 mb-1">Traffic-light health check</p>
                  <p className="text-xs text-gray-400">Green = good · Yellow = fairly good · Red = very bad</p>
                </div>
              )}

              {page.ctaLabel && page.ctaHref && (
                <Link
                  href={page.ctaHref}
                  className="w-full bg-[#f97316] text-white py-3 rounded-full text-sm font-bold flex items-center justify-center hover:bg-orange-600 transition-colors"
                >
                  {page.ctaLabel}
                </Link>
              )}
              <Link
                href="/calculator"
                className="w-full border border-gray-200 text-gray-700 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center hover:border-gray-400 transition-colors"
              >
                Open nutrition calculator
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

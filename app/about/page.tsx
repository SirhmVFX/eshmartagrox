import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getSiteSettings, getAboutPageContent } from "@/lib/firestore";

export const metadata: Metadata = {
  title: "About Us | Eshmart Agrox",
  description: "Learn about Eshmart Agrox — Nigeria's trusted source for healthy produce, senior wellness packs, and premium commodity exports.",
};

export default async function AboutPage() {
  const [about, settings] = await Promise.all([
    getAboutPageContent().catch(() => null),
    getSiteSettings().catch(() => null),
  ]);

  const siteName = settings?.siteName ?? "Eshmart Agrox";
  const email = settings?.contactEmail ?? "";
  const phone = settings?.contactPhone ?? "";
  const address = settings?.address ?? "";

  if (!about) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
        <p className="text-gray-400 text-sm">Loading page content…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDF7]">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative bg-green-900 text-white py-24 sm:py-32 overflow-hidden">
        {about.heroBgImage ? (
          <div className="absolute inset-0 opacity-20">
            <Image src={about.heroBgImage} alt="" fill className="object-cover" priority />
          </div>
        ) : (
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-400 to-green-900" />
        )}
        <div className="container-max relative z-10 text-center">
          {about.heroLabel && (
            <p className="text-green-300 text-xs font-bold uppercase tracking-widest mb-3">{about.heroLabel}</p>
          )}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 max-w-3xl mx-auto leading-tight">
            {about.heroHeading}
          </h1>
          {about.heroSubtext && (
            <p className="text-white/70 text-lg max-w-xl mx-auto">{about.heroSubtext}</p>
          )}
        </div>
      </section>

      {/* ── Who We Are ───────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{about.whoHeading}</h2>
              {about.whoParagraph1 && <p className="text-gray-600 leading-relaxed mb-4">{about.whoParagraph1}</p>}
              {about.whoParagraph2 && <p className="text-gray-600 leading-relaxed mb-4">{about.whoParagraph2}</p>}
              {about.whoParagraph3 && <p className="text-gray-600 leading-relaxed">{about.whoParagraph3}</p>}
            </div>

            {/* Stats grid */}
            {about.stats && about.stats.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {about.stats.map((stat, i) => (
                  <div key={i} className={`rounded-2xl p-6 flex flex-col gap-2 ${stat.color}`}>
                    <span className="text-4xl font-bold">{stat.value}</span>
                    <p className="text-sm font-medium opacity-80">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Our Values ───────────────────────────────────────── */}
      {about.values && about.values.length > 0 && (
        <section className="py-16 bg-white border-y border-gray-100">
          <div className="container-max">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{about.valuesHeading}</h2>
              {about.valuesSubtext && <p className="text-gray-500 max-w-xl mx-auto">{about.valuesSubtext}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {about.values.map((v, i) => (
                <div key={i} className="bg-[#FFFDF7] border border-gray-100 rounded-2xl p-6 text-center">
                  <div className="text-4xl mb-3">{v.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── What We Do ───────────────────────────────────────── */}
      {about.services && about.services.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="container-max">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{about.servicesHeading}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {about.services.map((item, i) => (
                <Link key={i} href={item.href ?? "#"}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-green-200 hover:shadow-sm transition-all group">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-green-800">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Contact CTA ──────────────────────────────────────── */}
      <section className="py-16 bg-green-900 text-white">
        <div className="container-max text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{about.ctaHeading}</h2>
          {about.ctaSubtext && (
            <p className="text-white/70 mb-8 max-w-lg mx-auto">{about.ctaSubtext}</p>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {email && (
              <a href={`mailto:${email}`}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-full text-sm font-medium transition-colors">
                ✉️ {email}
              </a>
            )}
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-full text-sm font-medium transition-colors">
                📞 {phone}
              </a>
            )}
            {address && (
              <span className="flex items-center gap-2 text-white/60 text-sm">📍 {address}</span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold text-sm transition-colors">
              Send Us a Message
            </Link>
            <Link href="/shop"
              className="bg-white text-green-900 hover:bg-gray-100 px-8 py-3 rounded-full font-bold text-sm transition-colors">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import {
  getTeamMembers,
  getSiteSettings,
  TeamMember,
  SiteSettings,
} from "@/lib/firestore";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TeamMember | null>(null);

  useEffect(() => {
    Promise.all([getTeamMembers(), getSiteSettings()])
      .then(([team, s]) => {
        setMembers(team);
        setSettings(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  const label = settings?.teamPageLabel || "The Team";
  const title =
    settings?.teamPageTitle || "Meet the people behind Eshmart Agrox";
  const subtitle =
    settings?.teamPageSubtitle ||
    "Focused on your unique needs, our team delivers solutions that blend deep industry knowledge and cutting-edge strategies to ensure lasting growth.";

  return (
    <main className="min-h-screen bg-[#f4f4f4]">
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container-max">
          {label && (
            <span className="inline-flex items-center border border-gray-400 rounded-full px-4 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700 mb-6">
              {label}
            </span>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start mb-12 lg:mb-16">
            <h1 className="lg:col-span-7 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.15] tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="lg:col-span-5 text-gray-500 text-sm sm:text-base leading-relaxed lg:pt-1">
                {subtitle}
              </p>
            )}
          </div>

          {loading ? (
            <p className="text-center text-gray-400 py-20">Loading team…</p>
          ) : members.length === 0 ? (
            <p className="text-center text-gray-500 py-20">
              Team members will appear here once they are added in admin.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {members.map((m) => (
                <button
                  key={m.id ?? m.name}
                  type="button"
                  onClick={() => setSelected(m)}
                  className="group relative text-left aspect-3/4 rounded-3xl overflow-hidden bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                >
                  {m.image ? (
                    <Image
                      src={m.image}
                      alt={m.name}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-5xl font-bold text-gray-500">
                      {initials(m.name)}
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 pt-20 pb-5 px-4 bg-linear-to-t from-black/75 via-black/35 to-transparent text-center">
                    <p className="text-white font-bold text-base sm:text-lg leading-tight">
                      {m.name}
                    </p>
                    {m.role && (
                      <p className="text-white/80 text-sm mt-1">{m.role}</p>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-sm font-medium tracking-wide">
                      click to see details
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="team-modal-name"
        >
          <div
            className="relative w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 text-gray-800 flex items-center justify-center hover:bg-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative aspect-3/4 md:aspect-auto md:min-h-[420px] bg-gray-100">
                {selected.image ? (
                  <Image
                    src={selected.image}
                    alt={selected.name}
                    fill
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-gray-300">
                    {initials(selected.name)}
                  </div>
                )}
              </div>
              <div className="p-6 sm:p-8 flex flex-col justify-center">
                <p
                  id="team-modal-name"
                  className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight"
                >
                  {selected.name}
                </p>
                {selected.role && (
                  <p className="text-gray-500 mt-1 mb-5">{selected.role}</p>
                )}
                {selected.bio ? (
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    {selected.bio}
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm italic">
                    No bio added yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getTestimonials, getTeamMembers, Testimonial, TeamMember } from "@/lib/firestore";

const STATIC_TESTIMONIALS: Testimonial[] = [
    { name: "James Okonkwo", location: "London, UK", text: "Eshmart Agrox delivered the freshest Okra I have seen outside Nigeria. Consistently export-grade.", rating: 5, isVisible: true },
    { name: "Amara Nwosu", location: "Hamburg, Germany", text: "Reliable supplier with excellent communication. Our Ugu leaves arrive flash-chilled and full of flavour.", rating: 5, isVisible: true },
    { name: "David Mensah", location: "Toronto, Canada", text: "We have been sourcing through Eshmart for two years. Quality never drops. Highly recommended.", rating: 5, isVisible: true },
];

const STATIC_TEAM: TeamMember[] = [
    { name: "Chukwuemeka Obi", role: "Founder & CEO", bio: "10+ years in Nigerian agro-export with deep expertise in EU compliance.", image: "/assets/1.jpg", order: 1, isVisible: true },
    { name: "Adaeze Nwofor", role: "Head of Quality Assurance", bio: "Ensures every batch meets international phytosanitary standards before shipment.", image: "/assets/2.jpg", order: 2, isVisible: true },
    { name: "Segun Adeyemi", role: "Export Logistics Manager", bio: "Coordinates cold-chain logistics from farm gate to destination port.", image: "/assets/3.jpg", order: 3, isVisible: true },
];

export default function TestimonialsSection() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [team, setTeam] = useState<TeamMember[]>([]);

    useEffect(() => {
        getTestimonials()
            .then(d => setTestimonials(d.length > 0 ? d : STATIC_TESTIMONIALS))
            .catch(() => setTestimonials(STATIC_TESTIMONIALS));
        getTeamMembers()
            .then(d => setTeam(d.length > 0 ? d : STATIC_TEAM))
            .catch(() => setTeam(STATIC_TEAM));
    }, []);

    return (
        <>
            {/* ── TESTIMONIALS ── */}
            <section className="py-12 md:py-20 bg-[#F4F7ED]">
                <div className="w-[90%] mx-auto">
                    <h2 className="text-2xl md:text-4xl font-bold text-green-900 mb-10">What Our Buyers Say</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {testimonials.slice(0, 3).map((t, i) => (
                            <div key={t.id ?? i} className="bg-white p-6 md:p-8 space-y-4">
                                {/* Stars */}
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, s) => (
                                        <span key={s} className={s < t.rating ? "text-yellow-400" : "text-gray-200"}>★</span>
                                    ))}
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                                    {t.imgSrc && (
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                                            <Image src={t.imgSrc} alt={t.name} fill className="object-cover" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-green-900 text-sm">{t.name}</p>
                                        <p className="text-xs text-gray-500">{t.location}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TEAM ── */}
            {team.length > 0 && (
                <section className="py-12 md:py-20">
                    <div className="w-[90%] mx-auto">
                        <h2 className="text-2xl md:text-4xl font-bold text-green-900 mb-10">Our Team</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                            {team.map((member, i) => (
                                <div key={member.id ?? i} className="space-y-4">
                                    <div className="relative w-full h-64 overflow-hidden">
                                        <Image src={member.image || "/assets/1.jpg"} alt={member.name} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-green-900 text-lg">{member.name}</h3>
                                        <p className="text-sm text-green-700 font-medium">{member.role}</p>
                                        <p className="text-sm text-gray-600 mt-1">{member.bio}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}

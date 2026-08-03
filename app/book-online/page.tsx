"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getServices, Service } from "@/lib/firestore";

const FALLBACK: Service[] = [
  { title: "Farm Tour", duration: "60 minutes", price: "$120", description: "A walk around our certified export-grade farm, seeing firsthand how our produce is grown and harvested.", bookHref: "/contact", bookLabel: "Book Now", image: "/assets/1.jpg", order: 1, active: true },
  { title: "Order Planning", duration: "90 minutes", price: "$150", description: "Sit with our export team to plan your order quantities, shipping timelines, and packaging specifications.", bookHref: "/contact", bookLabel: "Book Now", image: "/assets/2.jpg", order: 2, active: true },
  { title: "Produce Consultation", duration: "75 minutes", price: "$140", description: "In-depth consultation on produce selection, seasonality, quality grades, and compliance requirements for your target market.", bookHref: "/contact", bookLabel: "Book Now", image: "/assets/3.jpg", order: 3, active: true },
];

export default function BookOnline() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then((data) => setServices(data.length > 0 ? data : FALLBACK))
      .catch(() => setServices(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const displayed = services.length > 0 ? services : FALLBACK;

  return (
    <div className="w-[90%] mx-auto py-12 md:py-20">
      <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-green-900 mb-8 md:mb-16">Book Online</h1>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-20">Loading services…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {displayed.map((item, i) => (
            <div key={item.id ?? i}>
              <div className="relative h-64 sm:h-80 md:h-100 w-full overflow-hidden">
                <Image src={item.image || "/assets/1.jpg"} alt={item.title} fill className="object-cover" />
              </div>
              <div className="p-4 sm:p-6 md:p-8 border border-green-900/10 space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold">{item.title}</h2>
                <div className="w-full h-px bg-green-900/10" />
                <p>{item.duration}</p>
                <p className="font-semibold text-green-900">{item.price}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
                <Link href={item.bookHref || "/contact"} className="inline-block bg-green-900 text-white px-4 py-2 text-sm md:text-base">
                  {item.bookLabel || "Book Now"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

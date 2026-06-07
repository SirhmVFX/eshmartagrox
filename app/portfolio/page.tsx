"use client";

import Image from "next/image";
import { useSiteContent } from "@/components/ContentProvider";



function Portfolio() {

  const portfolio = [
    {
      id: "01",
      title: "Ugu - The Nigerian Superfood",
      desc: "Featuring our high-quality Ugu leaves, carefully harvested and prepared for export. This project details our commitment to delivering nutritious and fresh Nigerian vegetables to consumers across Europe.",
      image: "/assets/11.jpg"
    },
    {
      id: "01",
      title: "Buyer Inquiry Portal",
      desc: "Facilitating seamless transactions with our international buyers. This project showcases the easy-to-use inquiry form designed for potential clients to request quotes and discuss their specific needs for Nigerian produce.",
      image: "/assets/12.jpg"
    },
    {
      id: "01",
      title: "Cultivation Excellence",
      desc: "An in-depth look at Eshmart Agrox's farming practices. This project emphasizes sustainable cultivation, advanced farming techniques, and the environment that nurtures our premium produce before export.",
      image: "/assets/13.jpg"
    },
    {
      id: "01",
      title: "Rigorous Quality Assurance",
      desc: "Detailing Eshmart's multi-stage quality control processes. From farm to export, this project demonstrates our dedication to meeting stringent international standards for freshness, safety, and quality of all produce.",
      image: "/assets/14.jpg"
    },
    {
      id: "01",
      title: "Our Produce Range",
      desc: "An overview of the various types of premium Nigerian produce Eshmart Agrox offers for export. This project provides a glimpse into the diversity and quality of our agricultural offerings tailored for European demand.",
      image: "/assets/15.jpg"
    },
    {
      id: "01",
      title: "Premium Okra Export",
      desc: "Showcasing Eshmart's top-grade Okra, ready for export to European markets. Highlights the meticulous cultivation process, stringent quality checks, and the exceptional freshness of our produce, ensuring buyers receive only the best.",
      image: "/assets/10.jpg"
    }
  ]

  return (
    <div className="w-[90%] mx-auto py-12 md:py-20">
      <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-green-900 mb-8 md:mb-16">Portfolio</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {portfolio.map((item, i) => {
          const imgSrc = item.image;
          return (
            <div key={`${item.id}-${i}`} className="space-y-4">
              <div className="relative h-72 sm:h-100 md:h-125 w-full">
                <Image
                  src={imgSrc}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-green-900">{item.title}</h2>
              <p className="text-sm md:text-base text-gray-600">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Portfolio;

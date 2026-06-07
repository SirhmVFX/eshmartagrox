"use client";

import Link from "next/link";
import { useSiteContent } from "@/components/ContentProvider";
import Image from "next/image";

function Footer() {


  return (
    <footer className="py-8 md:py-20 mt-auto">
      <div className="w-[90%] mx-auto">
        <div className="w-full bg-green-900 h-px" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-8 md:mt-12">
          <div>
            <Image src="/assets/eshmartlogo.png" alt="Eshmart Agrox Logo" width={150} height={150} className="object-contain w-32 h-32 md:w-full md:h-auto" />
            <p className="text-sm md:text-base">Premium Nigerian produce for international markets.</p>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold mb-2">Lagos Office</h1>
            <p className="text-sm md:text-base">20b Kingsley Emu Street, Lekki Phase 1 Lagos</p>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold mb-2">Inquiries</h1>
            <p className="text-sm md:text-base">T: +234 800 ESHMART</p>
            <p className="text-sm md:text-base">E: export@eshmartagrox.com</p>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold mb-2">Social Media</h1>
            <p className="text-sm md:text-base">© 2026 Eshmart Agrox. All Rights Reserved. RC 1234567</p>
          </div>
        </div>
        <div className="mt-8 md:mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-sm md:text-base text-gray-500">
          <p></p>
          <div className="flex gap-4">
          </div>
          <p>

          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

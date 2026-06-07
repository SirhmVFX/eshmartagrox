"use client";

import Link from "next/link";
import { useSiteContent } from "@/components/ContentProvider";
import Image from "next/image";

function Footer() {


  return (
    <footer className="py-20 mt-auto">
      <div className="w-[90%] mx-auto">
        <div className="w-full bg-green-900 h-px" />
        <div className="grid grid-cols-4 gap-8 mt-12">
          <div>
            <Image src="/assets/eshmartlogo.png" alt="Eshmart Agrox Logo" width={150} height={150} className="object-contain" />
            <p>Premium Nigerian produce for international markets.</p>
          </div>
          <div>
            <h1>Lagos Office</h1>
            <p>20b Kingsley Emu Street, Lekki Phase 1 Lagos</p>
          </div>
          <div>
            <h1>Inquiries</h1>
            <p>T: +234 800 ESHMART</p>
            <p>E: export@eshmartagrox.com</p>
            <p></p>
          </div>
          <div>
            <h1>Social Media </h1>

            <p>© 2026 Eshmart Agrox. All Rights Reserved. RC 1234567</p>
          </div>
        </div>
        <div className="mt-12 flex justify-between items-center text-sm text-gray-500">
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

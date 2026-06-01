"use client";

import Link from "next/link";
import { useSiteContent } from "@/components/ContentProvider";

function Footer() {
  const { footer, settings } = useSiteContent();

  return (
    <footer className="py-20 mt-auto">
      <div className="w-[90%] mx-auto">
        <div className="w-full bg-green-900 h-px" />
        <div className="grid grid-cols-4 gap-8 mt-12">
          {footer.columns.map((col) => (
            <div key={col.id}>
              <h3 className="font-bold text-green-900 mb-4">{col.title}</h3>
              <ul className="space-y-2 text-sm">
                {col.links.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-gray-600 hover:text-green-900">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-between items-center text-sm text-gray-500">
          <p>{footer.copyright}</p>
          <div className="flex gap-4">
            {footer.socialLinks.map((s) => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-900"
              >
                {s.platform}
              </a>
            ))}
          </div>
          <p>
            {settings.contactEmail} · {settings.contactPhone}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

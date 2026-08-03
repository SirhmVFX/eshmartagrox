import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Serif_Text } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ContentProvider } from "@/components/ContentProvider";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { CurrencyProvider } from "@/lib/currency";
import type { SiteContent } from "@/lib/types";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const dmSerifText = DM_Serif_Text({ variable: "--font-dm-serif-text", subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: "Eshmart Agrox | Premium Nigerian Produce Export",
  description: "Premium grade Okra and Ugu exported from Nigeria to European markets.",
};

// Minimal content required by ContentProvider — components now self-fetch from Firebase
const shellContent: SiteContent = {
  version: 0,
  updatedAt: "",
  settings: {
    siteName: "Eshmart Agrox",
    tagline: "Nigerian Produce. Exported with Integrity.",
    title: "Eshmart Agrox | Premium Nigerian Produce Export",
    description: "Premium grade Okra and Ugu exported from Nigeria.",
    logoUrl: "",
    faviconUrl: "/favicon.ico",
    currency: "NGN",
    currencySymbol: "₦",
    contactEmail: "exports@eshmartagrox.com",
    contactPhone: "+234 800 000 0000",
    address: "Lagos, Nigeria",
    showSearch: true,
    showCart: true,
    showUser: true,
  },
  navigation: [
    { id: "1", label: "Home", href: "/", order: 1, isVisible: true },
    { id: "2", label: "Portfolio", href: "/portfolio", order: 2, isVisible: true },
    { id: "3", label: "Book Online", href: "/book-online", order: 3, isVisible: true },
    { id: "4", label: "Shop", href: "/shop", order: 4, isVisible: true },
    { id: "5", label: "Blog", href: "/blog", order: 5, isVisible: true },
    { id: "6", label: "Track My Order", href: "/track-my-order", order: 6, isVisible: true },
  ],
  hero: { image: "", headline: "", subheadline: "", ctaLabel: "", ctaHref: "", slides: [] },
  homeFeatures: { sectionTitle: "", sectionSubtitle: "", cards: [] },
  homeQuality: { sectionTitle: "", mainImage: "", secondaryImage: "", blocks: [] },
  callToAction: { title: "", description: "", contactImage: "", secondaryTitle: "", secondaryDescription: "" },
  footer: { copyright: "", socialLinks: [], columns: [] },
  shop: { bannerImage: "", bannerTitle: "Our Shop", sortOptions: [], filters: { productTypes: [], priceOptions: [], lengthOptions: [], quantityOptions: [], sizeOptions: [], weightOptions: [], browseOptions: [] }, products: [] },
  portfolio: { pageTitle: "Portfolio", pageSubtitle: "", items: [] },
  services: { pageTitle: "Book Online", pageSubtitle: "", services: [] },
  blog: { pageTitle: "Blog", pageSubtitle: "", posts: [] },
  trackOrder: { pageTitle: "Track My Order", pageDescription: "", orders: [] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${dmSerifText.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CartProvider>
            <CurrencyProvider>
              <ContentProvider content={shellContent}>
                <Header />
                {children}
                <Footer />
              </ContentProvider>
            </CurrencyProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

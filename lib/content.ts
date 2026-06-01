import type { SiteContent } from "./types";
import { getAdminDb } from "./firebase-admin";

const fallbackContent: SiteContent = {
  version: 0,
  updatedAt: "",
  settings: {
    siteName: "Eshmart Agrox",
    tagline: "Nigerian Produce. Exported with Integrity.",
    title: "Eshmart Agrox | Premium Nigerian Produce Export",
    description: "Premium grade Okra and Ugu exported from Nigeria.",
    logoUrl: "/hero.png",
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
    {
      id: "6",
      label: "Track My Order",
      href: "/track-my-order",
      order: 6,
      isVisible: true,
    },
  ],
  hero: {
    image: "/hero.png",
    headline: "Nigerian Produce. Exported with Integrity.",
    subheadline:
      "We bridge the gap between Nigeria's finest farms and European markets.",
    ctaLabel: "View Our Products",
    ctaHref: "/shop",
    slides: [
      {
        id: "slide-1",
        image: "/hero.png",
        headline: "Nigerian Produce. Exported with Integrity.",
        subheadline: "We bridge the gap between Nigeria's finest farms and European markets.",
        ctaLabel: "View Our Products",
        ctaHref: "/shop",
      },
    ],
  },
  homeFeatures: {
    sectionTitle: "Our Produce",
    sectionSubtitle: "Premium Nigerian harvests for international markets.",
    cards: [],
  },
  homeQuality: {
    sectionTitle: "Quality Systems",
    mainImage: "/hero.png",
    secondaryImage: "/hero.png",
    blocks: [],
  },
  callToAction: {
    title: "Start Your Export Inquiry",
    description: "Contact our export experts.",
    contactImage: "/images/contact.png",
    secondaryTitle: "From soil to shelf",
    secondaryDescription: "",
  },
  footer: { copyright: "© 2026 Eshmart Agrox", socialLinks: [], columns: [] },
  shop: {
    bannerImage: "/shop.jpg",
    bannerTitle: "Our Shop",
    sortOptions: [],
    filters: {
      productTypes: [],
      priceOptions: [],
      lengthOptions: [],
      quantityOptions: [],
      sizeOptions: [],
      weightOptions: [],
      browseOptions: [],
    },
    products: [],
  },
  portfolio: { pageTitle: "Portfolio", pageSubtitle: "", items: [] },
  services: { pageTitle: "Our Services", pageSubtitle: "", services: [] },
  blog: { pageTitle: "Blog", pageSubtitle: "", posts: [] },
  trackOrder: { pageTitle: "Track My Order", pageDescription: "", orders: [] },
};

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const snap = await getAdminDb().collection("config").doc("siteContent").get();
    if (snap.exists) {
      return snap.data() as SiteContent;
    }
  } catch {
    // Firestore unavailable at build time or missing credentials
  }

  const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL;
  if (cmsUrl) {
    try {
      const res = await fetch(`${cmsUrl}/api/content`, { next: { revalidate: 30 } });
      if (res.ok) return (await res.json()) as SiteContent;
    } catch {
      // CMS API unavailable
    }
  }

  return fallbackContent;
}

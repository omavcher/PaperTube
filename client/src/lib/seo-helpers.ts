import type { Metadata } from "next";
import { REGIONAL_SEO_DATA, SUBJECT_SEO_DATA, PageSeoConfig } from "@/config/seo-data";
import { getHreflangs } from "./hreflang";
import { reviews } from "@/data/reviews";

const VALID_REGIONS = ["us", "uk", "ca", "au"];

export function getLocalizedSeo(pageKey: string, region: string): PageSeoConfig {
  const normRegion = (region || "global").toLowerCase();
  const regionConfig = REGIONAL_SEO_DATA[normRegion];
  if (regionConfig && regionConfig[pageKey]) {
    return regionConfig[pageKey];
  }
  
  // Fall back to US if region not explicitly defined, or check if pageKey is a subject
  if (pageKey in SUBJECT_SEO_DATA) {
    return SUBJECT_SEO_DATA[pageKey];
  }

  // Final fallback to global/US youtube-to-notes
  return REGIONAL_SEO_DATA.us["youtube-to-notes"];
}

export function generateMetadataForPage(pageKey: string, region?: string): Metadata {
  const normRegion = region || "global";
  const seoConfig = getLocalizedSeo(pageKey, normRegion);
  const domain = "https://paperxify.com";

  // Determine path for hreflangs
  let pathname = "";
  if (pageKey === "home") {
    pathname = region && VALID_REGIONS.includes(region) ? `/${region}` : "/";
  } else if (pageKey === "youtube-to-notes") {
    pathname = region && VALID_REGIONS.includes(region) ? `/${region}/youtube-to-notes` : "/youtube-to-notes";
  } else {
    // Programmatic subject pages (global only, self-canonical)
    pathname = `/youtube-notes-for-${pageKey}`;
  }

  const hreflangs = getHreflangs(pathname);
  const canonicalUrl = hreflangs.find((h) => h.rel === "canonical")?.href || `${domain}${pathname}`;

  // Build Next.js alternates format
  const languages: Record<string, string> = {};
  
  // Only add regional alternate languages for home and youtube-to-notes pages
  if (pageKey === "home" || pageKey === "youtube-to-notes") {
    hreflangs.forEach((h) => {
      if (h.rel === "alternate" && h.hrefLang) {
        languages[h.hrefLang] = h.href;
      }
    });
  }

  const isSubjectPage = pageKey in SUBJECT_SEO_DATA;
  const imageAlt = isSubjectPage
    ? `YouTube to ${pageKey.charAt(0).toUpperCase() + pageKey.slice(1)} Notes AI Converter`
    : "YouTube to Notes AI Converter";

  return {
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
    alternates: {
      canonical: canonicalUrl,
      ...(Object.keys(languages).length > 0 ? { languages } : {}),
    },
    openGraph: {
      title: seoConfig.title,
      description: seoConfig.description,
      url: canonicalUrl,
      siteName: "Paperxify",
      type: "website",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seoConfig.title,
      description: seoConfig.description,
      images: ["/og-image.jpg"],
    },
  };
}

export function generateJsonLdForPage(pageKey: string, region: string) {
  const seoConfig = getLocalizedSeo(pageKey, region);
  const normRegion = region || "global";
  
  let pageUrl = "https://paperxify.com";
  if (pageKey === "youtube-to-notes") {
    pageUrl += VALID_REGIONS.includes(normRegion) ? `/${normRegion}/youtube-to-notes` : "/youtube-to-notes";
  } else if (pageKey in SUBJECT_SEO_DATA) {
    pageUrl += `/youtube-notes-for-${pageKey}`;
  } else {
    pageUrl += VALID_REGIONS.includes(normRegion) ? `/${normRegion}` : "";
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}/#webapp`,
        name: `Paperxify ${seoConfig.h2Accent || "YouTube to Notes AI"}`,
        url: pageUrl,
        operatingSystem: "All",
        applicationCategory: "EducationalApplication",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description: seoConfig.description,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: seoConfig.ratingCount || "7200",
        },
        review: reviews.slice(0, 5).map((r) => ({
          "@type": "Review",
          author: {
            "@type": "Person",
            name: r.name,
          },
          datePublished: r.datePublished,
          reviewBody: r.quote,
          reviewRating: {
            "@type": "Rating",
            bestRating: "5",
            ratingValue: r.ratingValue,
            worstRating: "1",
          },
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: seoConfig.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };
}

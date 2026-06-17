import type { Metadata } from "next";
import {
  REGIONAL_SEO_DATA,
  SUBJECT_SEO_DATA,
  BASE_SEO_DATA,
  AI_STUDY_TOOL_CONFIG,
  AI_WRITER_TOOL_CONFIG,
  AI_DIAGRAM_FORMAT_CONFIG,
  PageSeoConfig,
} from "@/config/seo-data";
import { getHreflangs } from "./hreflang";
import { reviews } from "@/data/reviews";

const VALID_REGIONS = ["us", "uk", "ca", "au"];

function localizeSeoConfig(
  config: PageSeoConfig,
  region: string,
  pageKey: string,
  subKey?: string
): PageSeoConfig {
  const normRegion = region.toLowerCase();

  const regionLabels: Record<string, string> = {
    us: "US",
    uk: "UK",
    ca: "Canada",
    au: "AU",
  };
  const label = regionLabels[normRegion] || "";

  const descAppends: Record<string, string> = {
    us: " Trusted by college and high school students across the US preparing for AP Exams, SAT/ACT, and university finals.",
    uk: " Trusted by students across the UK preparing for GCSEs, A-Levels, and university exams.",
    ca: " Trusted by students across Canada preparing for Provincial Exams, OSSLT, and university finals.",
    au: " Trusted by students across Australia preparing for ATAR, HSC, VCE, and university exams.",
  };

  const h1Regions: Record<string, string> = {
    us: "for US Students",
    uk: "for UK Students",
    ca: "for Canadian Students",
    au: "for Australian Students",
  };

  const introAppends: Record<string, string> = {
    us: " Optimized for American high school and college curriculums, including AP, SAT, and ACT prep.",
    uk: " Aligned with UK exam boards (AQA, OCR, Edexcel) for GCSE, A-Level, and university specifications.",
    ca: " Tailored for Canadian provincial curriculums, OSSLT preparation, and major university standards.",
    au: " Built for Australian secondary school standards (ATAR, HSC, VCE, QCE) and university courses.",
  };

  // Localize Title
  let localizedTitle = config.title;
  if (label) {
    const pipeIndex = localizedTitle.indexOf("|");
    if (pipeIndex !== -1) {
      localizedTitle =
        localizedTitle.substring(0, pipeIndex).trim() +
        " " +
        label +
        " |" +
        localizedTitle.substring(pipeIndex + 1);
    }
  }

  // Localize Description
  const localizedDescription = config.description + (descAppends[normRegion] || "");

  // Localize H1
  let localizedH1 = config.h1;
  const h1Suffix = h1Regions[normRegion];
  if (h1Suffix) {
    const pipeIndex = localizedH1.indexOf("|");
    if (pipeIndex !== -1) {
      localizedH1 =
        localizedH1.substring(0, pipeIndex).trim() +
        " " +
        h1Suffix +
        " |" +
        localizedH1.substring(pipeIndex + 1);
    } else {
      localizedH1 = localizedH1 + " " + h1Suffix;
    }
  }

  // Localize Intro
  const localizedIntro = config.intro + (introAppends[normRegion] || "");

  // Localize FAQs
  const localizedFaqs = config.faqs.map((faq) => {
    let question = faq.question;
    let answer = faq.answer;

    const replaceText = (text: string) => {
      let t = text;
      if (normRegion === "us") {
        t = t.replace(/globally|worldwide/gi, "in the US").replace(/students/gi, "US students");
      } else if (normRegion === "uk") {
        t = t.replace(/globally|worldwide/gi, "in the UK").replace(/students/gi, "UK students");
      } else if (normRegion === "ca") {
        t = t.replace(/globally|worldwide/gi, "in Canada").replace(/students/gi, "Canadian students");
      } else if (normRegion === "au") {
        t = t.replace(/globally|worldwide/gi, "in Australia").replace(/students/gi, "Australian students");
      }
      return t;
    };

    return {
      question: replaceText(question),
      answer: replaceText(answer),
    };
  });

  return {
    ...config,
    title: localizedTitle,
    description: localizedDescription,
    h1: localizedH1,
    intro: localizedIntro,
    faqs: localizedFaqs,
  };
}

export function getLocalizedSeo(
  pageKey: string,
  region: string,
  subKey?: string
): PageSeoConfig {
  const normRegion = (region || "global").toLowerCase();

  // 1. Check if it's home or youtube-to-notes in REGIONAL_SEO_DATA
  if ((pageKey === "home" || pageKey === "youtube-to-notes") && normRegion !== "global") {
    const regionConfig = REGIONAL_SEO_DATA[normRegion];
    if (regionConfig && regionConfig[pageKey]) {
      return regionConfig[pageKey];
    }
  }

  // 2. Determine the base configuration
  let baseConfig: PageSeoConfig | undefined;

  if (pageKey === "ai-study") {
    baseConfig = subKey
      ? (AI_STUDY_TOOL_CONFIG[subKey] as unknown as PageSeoConfig)
      : BASE_SEO_DATA["ai-study"];
  } else if (pageKey === "ai-writer") {
    baseConfig = subKey
      ? (AI_WRITER_TOOL_CONFIG[subKey] as unknown as PageSeoConfig)
      : BASE_SEO_DATA["ai-writer"];
  } else if (pageKey === "ai-diagram") {
    baseConfig = subKey
      ? (AI_DIAGRAM_FORMAT_CONFIG[subKey] as unknown as PageSeoConfig)
      : BASE_SEO_DATA["ai-diagram"];
  } else if (pageKey === "presentation-generator") {
    baseConfig = BASE_SEO_DATA["presentation-generator"];
  } else if (pageKey === "home" || pageKey === "youtube-to-notes") {
    baseConfig = BASE_SEO_DATA[pageKey];
  } else if (pageKey in SUBJECT_SEO_DATA) {
    baseConfig = SUBJECT_SEO_DATA[pageKey];
  }

  // Fallback if not found
  if (!baseConfig) {
    baseConfig = BASE_SEO_DATA["youtube-to-notes"];
  }

  // 3. Localize if a valid region is requested and it's not home/youtube-to-notes or subject
  if (
    VALID_REGIONS.includes(normRegion) &&
    pageKey !== "home" &&
    pageKey !== "youtube-to-notes" &&
    !(pageKey in SUBJECT_SEO_DATA)
  ) {
    return localizeSeoConfig(baseConfig, normRegion, pageKey, subKey);
  }

  return baseConfig;
}

export function generateMetadataForPage(
  pageKey: string,
  region?: string,
  subKey?: string
): Metadata {
  const normRegion = region || "global";
  const seoConfig = getLocalizedSeo(pageKey, normRegion, subKey);
  const domain = "https://paperxify.com";

  // Determine path for hreflangs
  let pathname = "";
  const regSegment = VALID_REGIONS.includes(normRegion) ? normRegion : "";

  if (pageKey === "home") {
    pathname = regSegment ? `/${regSegment}` : "/";
  } else if (pageKey === "youtube-to-notes") {
    pathname = regSegment ? `/${regSegment}/youtube-to-notes` : "/youtube-to-notes";
  } else if (pageKey === "presentation-generator") {
    pathname = regSegment ? `/${regSegment}/presentation-generator` : "/presentation-generator";
  } else if (pageKey === "ai-diagram") {
    pathname = subKey
      ? (regSegment ? `/${regSegment}/ai-diagram/${subKey}` : `/ai-diagram/${subKey}`)
      : (regSegment ? `/${regSegment}/ai-diagram` : "/ai-diagram");
  } else if (pageKey === "ai-writer") {
    pathname = subKey
      ? (regSegment ? `/${regSegment}/ai-writer/${subKey}` : `/ai-writer/${subKey}`)
      : (regSegment ? `/${regSegment}/ai-writer` : "/ai-writer");
  } else if (pageKey === "ai-study") {
    pathname = subKey
      ? (regSegment ? `/${regSegment}/ai-study/${subKey}` : `/ai-study/${subKey}`)
      : (regSegment ? `/${regSegment}/ai-study` : "/ai-study");
  } else {
    // Programmatic subject pages (global only, self-canonical)
    pathname = `/youtube-notes-for-${pageKey}`;
  }

  const hreflangs = getHreflangs(pathname);
  const canonicalUrl =
    hreflangs.find((h) => h.rel === "canonical")?.href || `${domain}${pathname}`;

  // Build Next.js alternates format
  const languages: Record<string, string> = {};

  // Alternate pages are allowed for all standard landing pages (except subject pages)
  if (!(pageKey in SUBJECT_SEO_DATA)) {
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
    title: {
      absolute: seoConfig.title,
    },
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

export function generateJsonLdForPage(
  pageKey: string,
  region: string,
  subKey?: string
) {
  const normRegion = region || "global";
  const seoConfig = getLocalizedSeo(pageKey, normRegion, subKey);

  let pathname = "";
  const regSegment = VALID_REGIONS.includes(normRegion) ? normRegion : "";

  if (pageKey === "home") {
    pathname = regSegment ? `/${regSegment}` : "";
  } else if (pageKey === "youtube-to-notes") {
    pathname = regSegment ? `/${regSegment}/youtube-to-notes` : "/youtube-to-notes";
  } else if (pageKey === "presentation-generator") {
    pathname = regSegment ? `/${regSegment}/presentation-generator` : "/presentation-generator";
  } else if (pageKey === "ai-diagram") {
    pathname = subKey
      ? (regSegment ? `/${regSegment}/ai-diagram/${subKey}` : `/ai-diagram/${subKey}`)
      : (regSegment ? `/${regSegment}/ai-diagram` : "/ai-diagram");
  } else if (pageKey === "ai-writer") {
    pathname = subKey
      ? (regSegment ? `/${regSegment}/ai-writer/${subKey}` : `/ai-writer/${subKey}`)
      : (regSegment ? `/${regSegment}/ai-writer` : "/ai-writer");
  } else if (pageKey === "ai-study") {
    pathname = subKey
      ? (regSegment ? `/${regSegment}/ai-study/${subKey}` : `/ai-study/${subKey}`)
      : (regSegment ? `/${regSegment}/ai-study` : "/ai-study");
  } else if (pageKey in SUBJECT_SEO_DATA) {
    pathname = `/youtube-notes-for-${pageKey}`;
  }

  const pageUrl = `https://paperxify.com${pathname}`;

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

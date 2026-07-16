import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";
import "katex/dist/katex.min.css";
import Script from "next/script";
import { headers } from "next/headers";
import { getHreflangs } from "@/lib/hreflang";
import { generateOrganizationSchema } from "@/lib/schema-generators";
import { SchemaMarkup } from "@/components/SchemaMarkup";

// Separate viewport export (Next.js 14+ standard)
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";

  const hreflangs = getHreflangs(pathname);
  const canonicalObj = hreflangs.find(h => h.rel === 'canonical');
  const alternatesObj = hreflangs.filter(h => h.rel === 'alternate');

  const languages: Record<string, string> = {};
  alternatesObj.forEach(h => {
    if (h.hrefLang) {
      languages[h.hrefLang] = h.href;
    }
  });

  return {
    metadataBase: new URL("https://paperxify.com"), 
    
    title: {
      default: "Paperxify | YouTube to Notes AI & AI YouTube Note Taker",
      template: "Paperxify | %s", 
    },
    
    description:
      "Paperxify is the ultimate YouTube to notes AI. Generate study notes, transcripts, and flashcards from YouTube videos instantly. The best free AI YouTube summarizer and NoteGPT alternative for students.",
    
    keywords: [
      // PRIMARY TARGET KEYWORDS (high-priority missing variants added)
      "ai notes maker",           // #1 missing — high commercial intent
      "yt to ai notes",           // #2 missing — exact match query
      "ai notes making",          // #3 missing — process-based query
      "ai pdf generator",         // #4 missing — output-type query
      "youtube ai notes generator", // #5 missing — tool-type query
      "ai note maker from youtube",
      "ai pdf notes generator",
      "make notes with ai from youtube",
      "youtube to ai study notes",
      "ai notes generator free",
      "convert yt video to notes ai",
      "ai notes from youtube video",
      "best ai notes maker for students",
      "ai pdf from youtube",

      // Primary / Core (Priority 1 & 2)
      "youtube to notes", "youtube video to notes", "youtube summarizer", "youtube video summarizer",
      "youtube to notes ai", "ai youtube note taker", "youtube video note taker", "ai notes from youtube",
      "youtube notes generator", "ai youtube notes", "youtube transcript to notes", "turn youtube into notes",
      "youtube summarizer ai", "ai video note taker", "video to notes ai", "youtube transcript generator",
      "yt link to notes", "video to text ai", "youtube link to notes", "convert youtube to notes ai",
      "study notes from youtube", "ai note taker youtube",

      // Long-Tail & Use-Case
      "how to convert youtube video to notes using ai", "free ai tool to take notes from youtube",
      "youtube to notes ai free no signup", "best ai to summarize youtube videos for students",
      "generate notes from youtube lecture ai", "ai youtube notes maker with timestamps",
      "summarize youtube video into bullet points ai", "youtube to study notes for exam prep",
      "paste youtube link get notes instantly", "ai that reads youtube videos and takes notes",
      "turn youtube into study guide ai", "ai learning assistant video",

      // Competitor Alternatives
      "notegpt alternative", "mindgrasp alternative", "sites like mindgrasp for free",
      "turbo ai notes alternative", "swiftnotes alternative free", "better than notegpt",
      "notegpt vs mindgrasp vs paperxify", "studyfetch alternative free",

      // Geo-Targeted
      "youtube ai notes free tool", "best ai youtube summarizer",
      "youtube to notes ai for students", "lecture summarizer ai",

      "Paperxify"
    ],
    
    authors: [{ name: "Om Avcher", url: "https://paperxify.com/about" }],
    creator: "Om Avcher",
    publisher: "Paperxify",
    category: "Education & Productivity",
    applicationName: "Paperxify",
    
    openGraph: {
      type: "website",
      locale: "en-US",
      url: "https://paperxify.com" + pathname,
      title: "Paperxify | AI Notes Maker & YT Link to Notes Converter",
      description:
        "Paste a YT link to notes instantly. Best NoteGPT alternative for generating YouTube notes, study guides, and PDFs.",
      siteName: "Paperxify",
      images: [
        {
          url: "/og-image.jpg", 
          width: 1200,
          height: 630,
          alt: "Paperxify - AI Notes Maker",
        },
      ],
    },
    
    twitter: {
      card: "summary_large_image",
      title: "Paperxify | AI Notes Maker & YT Link to Notes Converter",
      description:
        "Transform any YouTube video into beautiful PDF notes instantly. Let AI summarize and extract concepts for you.",
      images: ["/og-image.jpg"],
      creator: "@omAvcher",
    },
    
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    
    alternates: {
      canonical: canonicalObj ? canonicalObj.href : "https://paperxify.com" + pathname,
      languages,
    }
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://paperxify.com/#website",
        "url": "https://paperxify.com",
        "name": "Paperxify",
        "description": "Convert YouTube Videos to Notes & PDF instantly.",
        "publisher": {
          "@id": "https://paperxify.com/#organization"
        },
        "potentialAction": [{
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://paperxify.com/explore?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }]
      },
      {
        "@type": "Organization",
        "@id": "https://paperxify.com/#organization",
        "name": "Paperxify",
        "url": "https://paperxify.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://paperxify.com/logo.png",
          "width": 512,
          "height": 512
        }
      },
      {
        "@type": "ItemList",
        "name": "Site Navigation",
        "itemListElement": [
          { "@type": "SiteNavigationElement", "position": 1, "name": "Pricing", "url": "https://paperxify.com/pricing" },
          { "@type": "SiteNavigationElement", "position": 2, "name": "About", "url": "https://paperxify.com/about" },
          { "@type": "SiteNavigationElement", "position": 3, "name": "Contact", "url": "https://paperxify.com/contact" }
        ]
      }
    ]
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SchemaMarkup schema={generateOrganizationSchema()} />
      </head>
      <body className="antialiased bg-black text-white selection:bg-red-900/50">
        {/* Google Analytics / Tag Manager (G-VK6RMJ2KVV & AW-363591459) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VK6RMJ2KVV"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-VK6RMJ2KVV');
            gtag('config', 'AW-363591459');
          `}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
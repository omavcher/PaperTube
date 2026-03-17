import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import Script from "next/script";

// next/font pre-optimizes the font at build time:
// - Self-hosted from Next.js CDN (no external network request)
// - Font CSS is inlined → zero render-blocking
// - Only loads used weights
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
});


// Separate viewport export (Next.js 14+ standard)
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://paperxify.com"), 
  
  title: {
    default: "Paperxify | YouTube Video to Notes Converter & PDF Extractor",
    template: "Paperxify | %s", 
  },
  
  description:
    "Convert YouTube videos to structured notes instantly. Paperxify is the best free AI tool for students, developers, and researchers. Try it now!",
  
  keywords: [
    "YouTube to PDF",
    "YouTube to notes",
    "YouTube video link to notes converter",
    "convert youtube video to notes",
    "youtube transcript to notes",
    "AI note taker",
    "video summarizer",
    "AI study guide",
    "student tools",
    "video to text converter",
    "Paperxify",
    "best youtube notes ai"
  ],
  
  authors: [{ name: "Om Avcher", url: "https://paperxify.com/about" }],
  creator: "Om Avcher",
  publisher: "Paperxify",
  category: "Education & Productivity",
  applicationName: "Paperxify",
  
  openGraph: {
    type: "website",
    locale: "en-IN",
    url: "https://paperxify.com",
    title: "Paperxify | Best YouTube Video to Notes Converter AI",
    description:
      "Paste a YouTube video link and instantly convert it into structured study notes and PDFs using advanced AI.",
    siteName: "Paperxify",
    images: [
      {
        url: "/og-image.jpg", 
        width: 1200,
        height: 630,
        alt: "Paperxify - YouTube to Notes AI Converter",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Paperxify | Best YouTube Video to Notes AI",
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
    canonical: "https://paperxify.com",
    languages: {
      'en-IN': 'https://paperxify.com',
    },
  }
};

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
          { "@type": "SiteNavigationElement", "position": 1, "name": "Explore", "url": "https://paperxify.com/explore" },
          { "@type": "SiteNavigationElement", "position": 2, "name": "Pricing", "url": "https://paperxify.com/pricing" },
          { "@type": "SiteNavigationElement", "position": 3, "name": "About", "url": "https://paperxify.com/about" },
          { "@type": "SiteNavigationElement", "position": 4, "name": "Contact", "url": "https://paperxify.com/contact" }
        ]
      }
    ]
  };

  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="google-adsense-account" content="ca-pub-8343501385468147"></meta>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8343501385468147"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className="antialiased bg-black text-white selection:bg-red-900/50 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";
import Script from "next/script";

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
    default: "Paperxify | YouTube to Notes AI & AI YouTube Note Taker",
    template: "Paperxify | %s", 
  },
  
  description:
    "Paperxify is the ultimate YouTube to notes AI. Generate study notes, transcripts, and flashcards from YouTube videos instantly. The best free AI YouTube summarizer and NoteGPT alternative for students.",
  
  keywords: [
    // Primary / Core (Priority 1 & 2)
    "youtube to notes", "youtube video to notes", "youtube summarizer", "youtube video summarizer", 
    "youtube to notes ai", "ai youtube note taker", "youtube video note taker", "ai notes from youtube", 
    "youtube notes generator", "ai youtube notes", "youtube transcript to notes", "turn youtube into notes", 
    "youtube summarizer ai", "ai video note taker", "video to notes ai", "youtube transcript generator",
    "yt link to notes", "ai notes maker", "video to text ai", "youtube link to notes", "convert youtube to notes ai",
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
    "notegpt vs mindgrasp vs paperxify",
    
    // Geo-Targeted
    "youtube ai notes india free tool", "best ai youtube summarizer in india", 
    "youtube to notes ai for indian students", "upsc lecture summarizer ai",
    
    "Paperxify"
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
    <html lang="en" className="dark">
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
          strategy="afterInteractive"
        />
        {/* Google Analytics / Tag Manager (AW-363591459) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-363591459"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'AW-363591459');
          `}
        </Script>
      </head>
      <body className="antialiased bg-black text-white selection:bg-red-900/50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
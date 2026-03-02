import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

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
    default: "Paperxify | Best YouTube Video to Notes Converter AI",
    template: "%s | Paperxify - YouTube to Notes Converter", 
  },
  
  description:
    "Convert any YouTube video link to PDF notes instantly using Paperxify AI. Stop pausing and typing—let our advanced AI extract intelligence, summarize concepts, and generate structured study guides, assignments, and transcripts.",
  
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
  
  authors: [{ name: "Om Awchar", url: "https://paperxify.com/about" }],
  creator: "Om Awchar",
  publisher: "Paperxify",
  category: "Education & Productivity",
  applicationName: "Paperxify",
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://paperxify.com",
    title: "Paperxify | Best YouTube Video to Notes Converter AI",
    description:
      "Paste a YouTube video link and instantly convert it into structured study notes, flashcards, and PDFs using advanced AI.",
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
    creator: "@omawchar",
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
      'en-US': 'https://paperxify.com',
    },
  },
  
  verification: {
    google: "yoursiteverification", // Can be replaced later with actual Google site verification code
  },
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
      </head>
      <body className="antialiased bg-black text-white selection:bg-red-900/50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
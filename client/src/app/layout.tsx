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
  // BASE URL: Change this to your actual production domain
  metadataBase: new URL("https://yt2pdf.in"), 
  
  title: {
    default: "PaperTube | Turn YouTube Videos into Beautiful Notes",
    // This makes child pages automatically format as: "Pricing | PaperTube"
    template: "%s | PaperTube", 
  },
  
  description:
    "Stop pausing and typing. Paste a YouTube link and let PaperTube's AI extract intelligence, summarize concepts, and generate structured study guides and PDFs instantly.",
  
  keywords: [
    "YouTube to PDF",
    "YouTube to notes",
    "AI note taker",
    "video summarizer",
    "AI study guide",
    "student tools",
    "video to text",
    "PaperTube",
    "study tracker"
  ],
  
  authors: [{ name: "Om Awchar" }],
  creator: "Om Awchar",
  publisher: "PaperTube",
  
  // Open Graph (How your site looks when shared on WhatsApp, LinkedIn, Discord, etc.)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yt2pdf.in",
    title: "PaperTube | AI YouTube Note Generator",
    description:
      "Transform raw YouTube signals into high-fidelity, structured study notes. Generate PDFs and study guides instantly.",
    siteName: "PaperTube",
    images: [
      {
        url: "/og-image.jpg", // You need to put an image named og-image.jpg in your public folder!
        width: 1200,
        height: 630,
        alt: "PaperTube - YouTube to Notes AI",
      },
    ],
  },
  
  // Twitter Cards (How your site looks when shared on X/Twitter)
  twitter: {
    card: "summary_large_image",
    title: "PaperTube | Turn YouTube into Notes",
    description:
      "Paste a link and let AI extract intelligence to generate structured study guides instantly.",
    images: ["/og-image.jpg"],
    creator: "@omawchar", // Change to your actual Twitter handle if you have one
  },
  
  // Instruct search engines to index your site
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Canonical URL prevents duplicate content penalties from Google
  alternates: {
    canonical: "https://yt2pdf.in",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-black text-white selection:bg-red-900/50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
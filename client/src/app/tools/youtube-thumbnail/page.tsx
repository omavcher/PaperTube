// app/tools/youtube-thumbnail/page.tsx
import YouTubeThumbnailDownloaderClient from "@/components/tools/YouTubeThumbnailDownloaderClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "YouTube Thumbnail Downloader | Paperxify",
  description: "Download high-quality YouTube thumbnails instantly. Grab HD, HQ, and 4K thumbnails from any YouTube video URL for free.",
  keywords: ["youtube thumbnail downloader", "download youtube thumbnail", "yt thumbnail grabber", "save youtube thumbnail HD"],
  alternates: {
    canonical: "https://paperxify.com/tools/youtube-thumbnail",
  },
  openGraph: {
    title: "YouTube Thumbnail Downloader | Paperxify",
    description: "Download high-quality YouTube thumbnails instantly. Grab HD, HQ, and 4K thumbnails from any YouTube video URL for free.",
    type: "website",
    url: "https://paperxify.com/tools/youtube-thumbnail",
    siteName: "Paperxify",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Thumbnail Downloader",
    description: "Download high-quality YouTube thumbnails instantly. Grab HD, HQ, and 4K thumbnails from any YouTube video URL for free.",
  }
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "YouTube Thumbnail Downloader - Paperxify",
    "url": "https://paperxify.com/tools/youtube-thumbnail",
    "description": "Download high-quality YouTube thumbnails instantly. Grab HD, HQ, and 4K thumbnails from any YouTube video URL for free.",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I download a YouTube thumbnail?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Paste the YouTube video URL into the input field, and we will instantly extract all available thumbnail resolutions for you to download."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get HD and 4K thumbnails?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we fetch the maximum resolution (MaxRes) available for the video."
        }
      },
      {
        "@type": "Question",
        "name": "Is it legal to download thumbnails?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Thumbnails are copyrighted by their creators. You should only use them for fair use, inspiration, or personal reference."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <YouTubeThumbnailDownloaderClient />
    </>
  );
}

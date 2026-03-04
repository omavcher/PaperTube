import InstagramDownloaderClient from "@/components/tools/InstagramDownloaderClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instagram Reels & Video Downloader | Save IG Videos Free",
  description: "Download Instagram Reels, videos, and posts for free. Save videos in HD quality. Fast, simple, no login required.",
  keywords: ["instagram reels downloader", "instagram video download", "ig reel saver", "download instagram post", "save instagram video"],
  openGraph: {
    title: "Instagram Video Downloader | Paperxify",
    description: "Download Instagram Reels and videos in multiple qualities — free, fast, no sign-up required.",
    type: "website",
  }
};

export default function Page() {
  return <InstagramDownloaderClient />;
}

import YouTubeDownloaderClient from "@/components/tools/YouTubeDownloaderClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "YouTube Video Downloader | Download MP4 Free",
  description: "Download YouTube videos and audio for free. Choose from multiple quality options including 360p, 720p and more. Fast, simple, no registration needed.",
  keywords: ["youtube downloader", "download youtube video", "youtube to mp4", "youtube video download", "yt downloader free"],
  openGraph: {
    title: "YouTube Video Downloader | Paperxify",
    description: "Download YouTube videos in multiple qualities — free, fast, no sign-up required.",
    type: "website",
  }
};

export default function Page() {
  return <YouTubeDownloaderClient />;
}

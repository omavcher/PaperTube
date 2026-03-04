import YouTubeThumbnailDownloaderClient from "@/components/tools/YouTubeThumbnailDownloaderClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "YouTube Thumbnail Downloader | High Quality Images",
  description: "Download high-quality YouTube thumbnails instantly. Retrieve Full HD and Standard versions directly from any video link.",
  keywords: ["youtube thumbnail downloader", "yt thumbnail extract", "youtube picture download", "hd thumb download", "thumbnail grabber", "youtube thumbnail saver"],
  openGraph: {
    title: "YouTube Thumbnail Downloader | Paperxify",
    description: "Download high-resolution thumbnails exactly as they appear on YouTube videos in seconds.",
    type: "website",
  }
};

export default function Page() {
  return <YouTubeThumbnailDownloaderClient />;
}

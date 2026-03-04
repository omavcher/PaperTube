"use client";

import { useState, useCallback } from "react";
import {
  Download, ArrowLeft, RefreshCw, Zap,
  Film, Music, ShieldCheck, AlertTriangle, Loader2, Heart, MessageCircle, Instagram
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import CorePromo from "@/components/CorePromo";

// ── Types ───────────────────────────────────────────────────
interface MediaResource {
  format: string;
  quality: string;
  download_url: string;
  preview_url?: string;
}

interface RawResource {
  resource_id: string;
  quality: string;
  format: string;
  type: "video" | "audio";
  size: number;
  download_mode: string;
  download_url: string;
}

interface MediaItem {
  media_id: string;
  type: "video" | "image";
  resources: MediaResource[];
}

interface VideoData {
  title: string;
  thumbnail: string;
  duration: number;
  resources: RawResource[];
  media: MediaItem[];
  like_count: number;
  comment_count: number;
}

// ── Helpers ──────────────────────────────────────────────────
function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function InstagramDownloaderClient() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  useToolAnalytics("ig-downloader", "Instagram Downloader", "Engineering Tools");

  const handleFetch = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) { toast.error("Please paste an Instagram link."); return; }
    if (!trimmed.includes("instagram.com")) { toast.error("That doesn't look like an Instagram link."); return; }

    setLoading(true);
    setVideoData(null);

    try {
      const res = await fetch("/api/yt-dl", {   // reuse the same proxy endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: trimmed }),
      });

      const json = await res.json();
      if (!res.ok || json.status !== 1) {
        toast.error("Could not load this post. Make sure it's a public Instagram link.");
        return;
      }

      setVideoData(json.data);
      toast.success("Post found!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleDownload = async (downloadUrl: string, quality: string, format: string, index: number) => {
    const key = `${index}-${quality}`;
    setDownloadingKey(key);

    try {
      const safeName = videoData?.title.replace(/[^a-z0-9]/gi, "_").substring(0, 50) ?? "instagram";
      const filename = `${safeName}_${quality || "video"}.${format}`;
      const proxyUrl = `/api/yt-dl/download?url=${encodeURIComponent(downloadUrl)}&filename=${encodeURIComponent(filename)}`;

      const link = document.createElement("a");
      link.href = proxyUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Download started — check your Downloads folder!`);
    } catch {
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloadingKey(null);
    }
  };

  // Build a unified list of downloadable items
  // Priority: data.media[].resources (richer quality list), fallback: data.resources
  const buildDownloadList = (data: VideoData) => {
    const items: { downloadUrl: string; quality: string; format: string; type: "video" | "audio" | "image"; mediaIndex: number; resourceIndex: number; }[] = [];

    if (data.media && data.media.length > 0) {
      data.media.forEach((m, mi) => {
        m.resources.forEach((r, ri) => {
          if (r.download_url) {
            items.push({ downloadUrl: r.download_url, quality: r.quality, format: r.format, type: m.type, mediaIndex: mi, resourceIndex: ri });
          }
        });
      });
    }

    // If media was empty, fall back to raw resources
    if (items.length === 0) {
      data.resources.forEach((r, ri) => {
        if (r.download_url) {
          items.push({ downloadUrl: r.download_url, quality: r.quality || r.type.toUpperCase(), format: r.format, type: r.type, mediaIndex: 0, resourceIndex: ri });
        }
      });
    }

    return items;
  };

  const downloadList = videoData ? buildDownloadList(videoData) : [];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 flex flex-col font-sans">

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Instagram className="text-purple-400 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">IG Downloader</span>
        </div>
        <Link href="/tools">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <main className="flex-1 pt-6 md:pt-32 pb-32 md:pb-24 px-4 container mx-auto max-w-4xl relative z-10">

        {/* Header */}
        <div className="mb-10 text-center md:text-left space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-purple-400 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
          >
            <ShieldCheck className="h-3 w-3" /> Reels & Video Downloader
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
            Instagram <span className="text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-pink-600">Downloader</span>
          </h1>
          <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest max-w-2xl">
            Paste any Instagram reel, video, or post link and download it in multiple qualities.
          </p>
        </div>

        {/* Input Card */}
        <Card className="bg-neutral-900/40 border-white/10 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl mb-8">
          <CardHeader className="pb-2 px-6 pt-6 border-b border-white/5">
            <CardTitle className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Instagram className="h-4 w-4" /> Instagram Link
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-700 to-pink-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
              <div className="relative bg-[#050505] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <Instagram className="text-purple-400 h-6 w-6 ml-1 shrink-0" />
                <input
                  type="text"
                  placeholder="https://www.instagram.com/reel/... or /p/..."
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); if (!e.target.value) setVideoData(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                  className="bg-transparent border-none focus:ring-0 text-white placeholder:text-neutral-700 font-medium text-sm w-full outline-none"
                />
                {url && (
                  <Button size="icon" variant="ghost" onClick={() => { setUrl(""); setVideoData(null); }} className="text-neutral-500 hover:text-white shrink-0 h-8 w-8">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <Button
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black uppercase italic tracking-wider rounded-xl text-sm shadow-xl active:scale-[0.98] transition-all"
              onClick={handleFetch}
              disabled={loading}
            >
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching...</>
                : <><Zap className="mr-2 h-4 w-4 fill-white" /> Get Download Links</>
              }
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <AnimatePresence>
          {videoData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Post Info Card */}
              <Card className="bg-neutral-900/40 border-white/10 rounded-2xl overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="relative shrink-0 w-full sm:w-32 aspect-[9/16] sm:aspect-square rounded-xl overflow-hidden bg-neutral-900">
                    <img
                      src={videoData.thumbnail}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  {/* Info */}
                  <div className="flex flex-col justify-center gap-3 min-w-0 flex-1">
                    <p className="text-white font-bold text-sm leading-snug line-clamp-3">{videoData.title}</p>
                    <div className="flex items-center gap-4 text-neutral-500 text-xs font-mono flex-wrap">
                      {videoData.like_count > 0 && (
                        <span className="flex items-center gap-1.5">
                          <Heart size={11} className="text-pink-500" />
                          <span className="text-pink-400">{formatCount(videoData.like_count)}</span>
                        </span>
                      )}
                      {videoData.comment_count > 0 && (
                        <span className="flex items-center gap-1.5">
                          <MessageCircle size={11} className="text-purple-400" />
                          <span className="text-purple-400">{formatCount(videoData.comment_count)}</span>
                        </span>
                      )}
                      <span className="text-emerald-400">{downloadList.length} formats available</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Download Options */}
              {downloadList.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-neutral-900/30 border border-white/5">
                  <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                  <p className="text-white font-bold text-sm mb-1">No downloads available</p>
                  <p className="text-neutral-500 text-xs">This post may be private or restricted. Try a public Instagram link.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">Available Qualities</p>
                  {downloadList.map((item, i) => {
                    const key = `${item.mediaIndex}-${item.quality}-${i}`;
                    const isDownloading = downloadingKey === key;
                    const itemKey = `${i}-${item.quality}`;
                    const isVideo = item.type === "video" || item.format.includes("mp4");

                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/40 border border-white/5 hover:border-purple-500/20 hover:bg-neutral-900/60 transition-all group"
                      >
                        {/* Icon */}
                        <div className={cn(
                          "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border",
                          isVideo
                            ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                            : "bg-pink-500/10 border-pink-500/20 text-pink-400"
                        )}>
                          {isVideo ? <Film size={16} /> : <Music size={16} />}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm">
                            {item.quality || (isVideo ? "Video" : "Audio")}
                          </p>
                          <p className="text-neutral-500 text-xs font-mono mt-0.5 uppercase">
                            {item.format}
                          </p>
                        </div>

                        {/* Download Button */}
                        <Button
                          onClick={() => handleDownload(item.downloadUrl, item.quality || "video", item.format, i)}
                          disabled={!!downloadingKey}
                          className={cn(
                            "shrink-0 h-9 px-4 rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2 transition-all",
                            isDownloading
                              ? "bg-white/10 text-white"
                              : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md active:scale-95"
                          )}
                        >
                          {isDownloading
                            ? <><Loader2 size={13} className="animate-spin" /> Saving...</>
                            : <><Download size={13} /> Download</>
                          }
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 flex items-start gap-3">
                <AlertTriangle className="text-yellow-500 shrink-0 h-4 w-4 mt-0.5" />
                <p className="text-yellow-500/80 text-[10px] leading-relaxed font-medium">
                  Only download content you have permission to use. Respect creator rights and Instagram's Terms of Service. This tool is for personal use only.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Core Promo */}
        <div className="mt-20 mb-10">
          <CorePromo />
        </div>
      </main>
    </div>
  );
}

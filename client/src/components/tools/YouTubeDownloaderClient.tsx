"use client";

import { useState, useCallback } from "react";
import {
  Download, Youtube, ArrowLeft, RefreshCw, Zap,
  Film, Music, Clock, ShieldCheck, AlertTriangle, Loader2, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import CorePromo from "@/components/CorePromo";

interface Resource {
  resource_id: string;
  quality: string;
  format: string;
  type: "video" | "audio";
  size: number;
  download_mode: string;
  download_url: string;
}

interface VideoData {
  title: string;
  thumbnail: string;
  duration: number;
  resources: Resource[];
}

function formatSize(bytes: number): string {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + " GB";
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  return (bytes / 1024).toFixed(0) + " KB";
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function YouTubeDownloaderClient() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"video" | "audio">("video");

  useToolAnalytics("yt-downloader", "YT Downloader", "Engineering Tools");

  const handleFetch = useCallback(async () => {
    if (!url.trim()) {
      toast.error("Please paste a YouTube link.");
      return;
    }
    if (!url.includes("youtu")) {
      toast.error("That doesn't look like a YouTube link.");
      return;
    }

    setLoading(true);
    setVideoData(null);

    try {
      const res = await fetch("/api/yt-dl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: url }),
      });

      const json = await res.json();

      if (!res.ok || json.status !== 1) {
        toast.error("Could not load this video. Try a different link.");
        return;
      }

      setVideoData(json.data);
      toast.success("Video found!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleDownload = async (resource: Resource) => {
    if (!resource.download_url) {
      toast.error("No direct download available for this quality.");
      return;
    }

    setDownloadingId(resource.resource_id);

    try {
      const ext = resource.format.toLowerCase();
      const safeName = videoData?.title.replace(/[^a-z0-9]/gi, "_").substring(0, 50) ?? "video";
      const filename = `${safeName}_${resource.quality}.${ext}`;

      // Use our server-side proxy so the browser receives Content-Disposition: attachment
      // This forces a file save instead of opening/playing in tab (CORS + header issue solved)
      const proxyUrl = `/api/yt-dl/download?url=${encodeURIComponent(resource.download_url)}&filename=${encodeURIComponent(filename)}`;

      const link = document.createElement("a");
      link.href = proxyUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloading ${resource.quality} — check your Downloads folder!`);
    } catch {
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };


  // Only show resources that have a real download_url
  const availableResources = videoData?.resources.filter(
    (r) => r.download_url && r.download_url.length > 0
  ) ?? [];

  const videoResources = availableResources.filter((r) => r.type === "video");
  const audioResources = availableResources.filter((r) => r.type === "audio");

  const displayedResources = activeTab === "video" ? videoResources : audioResources;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/30 flex flex-col font-sans">

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Youtube className="text-red-500 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">YT Downloader</span>
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
            className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
          >
            <ShieldCheck className="h-3 w-3" /> Free Video Downloader
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
            YouTube <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-700">Downloader</span>
          </h1>
          <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest max-w-2xl">
            Paste any YouTube link and download the video or audio in multiple qualities.
          </p>
        </div>

        {/* Input Card */}
        <Card className="bg-neutral-900/40 border-white/10 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl mb-8">
          <CardHeader className="pb-2 px-6 pt-6 border-b border-white/5">
            <CardTitle className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Youtube className="h-4 w-4" /> YouTube Link
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-700 to-red-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
              <div className="relative bg-[#050505] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <Youtube className="text-red-500 h-6 w-6 ml-1 shrink-0" />
                <input
                  type="text"
                  placeholder="https://youtube.com/watch?v=... or youtu.be/..."
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (!e.target.value) setVideoData(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                  className="bg-transparent border-none focus:ring-0 text-white placeholder:text-neutral-700 font-medium text-sm w-full outline-none"
                />
                {url && (
                  <Button
                    size="icon" variant="ghost"
                    onClick={() => { setUrl(""); setVideoData(null); }}
                    className="text-neutral-500 hover:text-white shrink-0 h-8 w-8"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <Button
              className="w-full h-14 bg-white text-black hover:bg-neutral-200 font-black uppercase italic tracking-wider rounded-xl text-sm shadow-xl active:scale-[0.98] transition-transform"
              onClick={handleFetch}
              disabled={loading}
            >
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching...</>
                : <><Zap className="mr-2 h-4 w-4 fill-black" /> Get Download Links</>
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
              {/* Video Info */}
              <Card className="bg-neutral-900/40 border-white/10 rounded-2xl overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-4 p-4">
                  <div className="relative shrink-0 w-full sm:w-40 aspect-video rounded-xl overflow-hidden bg-neutral-900">
                    <img
                      src={videoData.thumbnail}
                      alt={videoData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-2 min-w-0">
                    <h2 className="text-white font-bold text-sm leading-snug line-clamp-2">{videoData.title}</h2>
                    <div className="flex items-center gap-3 text-neutral-500 text-xs font-mono">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {formatDuration(videoData.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-emerald-500" />
                        <span className="text-emerald-500">{availableResources.length} formats available</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tab Switcher */}
              <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                {(["video", "audio"] as const).map((tab) => {
                  const count = tab === "video" ? videoResources.length : audioResources.length;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all",
                        activeTab === tab
                          ? "bg-white text-black shadow-md"
                          : "text-neutral-500 hover:text-white"
                      )}
                    >
                      {tab === "video" ? <Film size={13} /> : <Music size={13} />}
                      {tab} <span className={cn("rounded-full px-1.5 py-0.5 text-[9px]", activeTab === tab ? "bg-black/10" : "bg-white/10")}>{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Download Cards */}
              {displayedResources.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-neutral-900/30 border border-white/5">
                  <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                  <p className="text-white font-bold text-sm mb-1">No direct downloads available</p>
                  <p className="text-neutral-500 text-xs">This video's {activeTab} streams are not directly accessible. Try the other tab.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {displayedResources.map((resource) => {
                    const isDownloading = downloadingId === resource.resource_id;
                    const isVideo = resource.type === "video";
                    return (
                      <motion.div
                        key={resource.resource_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/40 border border-white/5 hover:border-white/10 hover:bg-neutral-900/60 transition-all group"
                      >
                        {/* Icon */}
                        <div className={cn(
                          "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border",
                          isVideo
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        )}>
                          {isVideo ? <Film size={16} /> : <Music size={16} />}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm">{resource.quality}</p>
                          <p className="text-neutral-500 text-xs font-mono mt-0.5">
                            {resource.format} • {formatSize(resource.size)}
                          </p>
                        </div>

                        {/* Download Button */}
                        <Button
                          onClick={() => handleDownload(resource)}
                          disabled={isDownloading || !!downloadingId}
                          className={cn(
                            "shrink-0 h-9 px-4 rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2 transition-all",
                            isDownloading
                              ? "bg-white/10 text-white"
                              : "bg-white text-black hover:bg-neutral-200 shadow-md active:scale-95"
                          )}
                        >
                          {isDownloading
                            ? <><Loader2 size={13} className="animate-spin" /> Downloading...</>
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
                  Only download videos you have permission to use. Respect copyright and YouTube's Terms of Service. This tool is for personal, educational use only.
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

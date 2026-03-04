"use client";

import { useState, useCallback } from "react";
import { 
  Download, Image as ImageIcon, Link2, 
  Youtube, AlertTriangle, ShieldCheck, ArrowLeft, RefreshCw, Zap
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import CorePromo from "@/components/CorePromo";

interface ThumbnailQuality {
  id: string;
  label: string;
  url: string;
  quality: string;
}

export default function YouTubeThumbnailDownloaderClient() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  
  useToolAnalytics("yt-thumbnail", "YouTube Thumbnail", "Engineering Tools");

  const extractVideoId = (inputUrl: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = inputUrl.match(regex);
    return match ? match[1] : null;
  };

  const handleExtract = useCallback(() => {
    if (!url.trim()) {
      toast.error("Please enter a YouTube link.");
      return;
    }
    const id = extractVideoId(url);
    if (!id) {
      toast.error("Invalid YouTube link. Please check and try again.");
      setVideoId(null);
      return;
    }
    setVideoId(id);
    toast.success("Thumbnail Found");
  }, [url]);

  const downloadThumbnail = async (thumbnailUrl: string, qualityLabel: string) => {
    try {
      // Need to fetch properly avoiding direct CORS blocks if possible, but for client side a simple anchor works if same-origin.
      // Better approach for cross-origin images:
      const response = await fetch(thumbnailUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `yt-thumbnail-${videoId}-${qualityLabel}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success(`${qualityLabel} image downloaded`);
    } catch (error) {
       // If direct fetch fails due to CORS, fallback to opening in new tab
       window.open(thumbnailUrl, '_blank');
       toast.error("Could not download directly. The image has been opened in a new tab for you to save.");
    }
  };

  const getThumbnails = (id: string): ThumbnailQuality[] => [
    { id: "maxres", label: "Maximum Resolution", quality: "1080p (HD)", url: `https://img.youtube.com/vi/${id}/maxresdefault.jpg` },
    { id: "sd", label: "Standard Definition", quality: "720p", url: `https://img.youtube.com/vi/${id}/sddefault.jpg` },
    { id: "hq", label: "High Quality", quality: "480p", url: `https://img.youtube.com/vi/${id}/hqdefault.jpg` },
    { id: "mq", label: "Medium Quality", quality: "360p", url: `https://img.youtube.com/vi/${id}/mqdefault.jpg` },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/30 flex flex-col font-sans">
      
      {/* --- Mobile Header --- */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Youtube className="text-red-500 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">THUMB DOWNLOADER</span>
        </div>
        <Link href="/tools">
           <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
      </div>

      <main className="flex-1 pt-6 md:pt-32 pb-32 md:pb-24 px-4 container mx-auto max-w-7xl relative z-10">
        
        {/* Tool Intro */}
        <div className="mb-10 text-center md:text-left space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            <ShieldCheck className="h-3 w-3" /> HIGH QUALITY IMAGE DOWNLOAD
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
            YT Thumbnail <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-700">Downloader</span>
          </h1>
          <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest max-w-2xl">
            Download high-quality thumbnails directly from any YouTube video link.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* --- LEFT: Extractor Core --- */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-neutral-900/40 border-white/10 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl">
              <CardHeader className="pb-2 px-6 pt-6 border-b border-white/5">
                  <div className="flex justify-between items-center">
                     <CardTitle className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Link2 className="h-4 w-4" /> YouTube Link
                     </CardTitle>
                  </div>
              </CardHeader>
              <CardContent className="space-y-8 p-6">
                
                {/* Input Area */}
                <div className="space-y-4">
                   <div className="relative group">
                     <div className="absolute -inset-0.5 bg-gradient-to-r from-red-700 to-red-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
                     <div className="relative bg-[#050505] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                       <Youtube className="text-red-500 h-6 w-6 ml-2" />
                       <input 
                          type="text" 
                          placeholder="https://youtube.com/watch?v=..." 
                          value={url}
                          onChange={(e) => {
                             setUrl(e.target.value);
                             if (e.target.value === "") setVideoId(null);
                          }}
                          className="bg-transparent border-none focus:ring-0 text-white placeholder:text-neutral-700 font-medium text-sm w-full outline-none"
                       />
                       {url && (
                          <Button size="icon" variant="ghost" onClick={() => {setUrl(""); setVideoId(null);}} className="text-neutral-500 hover:text-white shrink-0 h-8 w-8">
                             <RefreshCw className="h-4 w-4" />
                          </Button>
                       )}
                     </div>
                   </div>

                   <Button className="w-full h-14 bg-white text-black hover:bg-neutral-200 font-black uppercase italic tracking-wider rounded-xl text-sm shadow-xl active:scale-[0.98] transition-transform" onClick={handleExtract}>
                      <Zap className="mr-2 h-4 w-4 fill-black" /> Get Thumbnails
                   </Button>
                </div>

              </CardContent>
            </Card>

            {/* Thumbnails Display */}
            {videoId && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {getThumbnails(videoId).map((thumb) => (
                     <Card key={thumb.id} className="bg-neutral-900/40 border-white/10 overflow-hidden rounded-2xl">
                        <div className="flex flex-col md:flex-row">
                           <div className="md:w-1/2 p-4 flex items-center justify-center bg-black/50 border-b md:border-b-0 md:border-r border-white/5">
                              <img 
                                src={thumb.url} 
                                alt={thumb.label} 
                                className="w-full rounded-xl shadow-lg border border-white/5 object-cover"
                                onError={(e) => {
                                   (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1280x720/000000/333333?text=UNAVAILABLE';
                                }}
                              />
                           </div>
                           <div className="md:w-1/2 p-6 flex flex-col justify-center space-y-4">
                              <div>
                                 <h3 className="font-black uppercase tracking-widest text-white text-sm">{thumb.label}</h3>
                                 <p className="text-xs text-neutral-500 font-mono mt-1">{thumb.quality}</p>
                              </div>
                              <Button onClick={() => downloadThumbnail(thumb.url, thumb.id)} className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold uppercase text-[10px] tracking-widest gap-2">
                                 <Download size={14} /> Download Image
                              </Button>
                           </div>
                        </div>
                     </Card>
                  ))}
               </div>
            )}
          </div>

          {/* --- RIGHT: Info & Guidance --- */}
          <div className="lg:col-span-5 space-y-6">
             
             {/* Education */}
             <div className="grid gap-4">
                <div className="p-5 rounded-2xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm shadow-lg">
                   <div className="flex items-center gap-3 mb-2">
                      <ImageIcon className="text-blue-500 h-4 w-4" />
                      <h4 className="text-[10px] font-black uppercase text-white tracking-widest">Image Quality</h4>
                   </div>
                   <p className="text-[10px] text-neutral-500 leading-relaxed font-medium">
                      Full HD (1080p) depends on the original video upload. If a creator didn't upload a high-quality thumbnail, we'll try to find the next best version like 720p or 480p.
                   </p>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm shadow-lg">
                   <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="text-yellow-500 h-4 w-4" />
                      <h4 className="text-[10px] font-black uppercase text-white tracking-widest">Important Note</h4>
                   </div>
                   <p className="text-[10px] text-neutral-500 leading-relaxed font-medium">
                      Some videos might not have a maximum resolution thumbnail available. If the top image doesn't load, try downloading the Standard Definition version instead.
                   </p>
                </div>
             </div>
          </div>

        </div>

        {/* --- CORE PROMO --- */}
        <div className="mt-20 mb-10">
           <CorePromo />
        </div>

      </main>
    </div>
  );
}

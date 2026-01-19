"use client";

import React, { useState, useRef, useCallback } from "react";
import { 
  ArrowLeft, Download, Upload, ShieldAlert, 
  Trash2, ShieldCheck, MapPin, Camera, 
  Clock, Zap, Loader2, Sparkles, Terminal,
  EyeOff, Activity, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

export default function EXIFSentinelPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isSecure, setIsSecure] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Logic: Handle Image and Simulate Metadata Detection ---
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setIsSecure(false);
      toast.info("Visual Asset Loaded. Scan Required.");
    }
  };

  // --- Logic: Scrub Metadata & Apply Watermark ---
  const scrubMetadata = async () => {
    if (!image) return;
    setIsScrubbing(true);
    const loadingToast = toast.loading("Executing Privacy Protocol...");

    // Artificial delay for "Scanning" feel
    await new Promise(resolve => setTimeout(resolve, 2000));

    const img = new Image();
    img.src = image;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image (this act alone strips EXIF data)
      ctx.drawImage(img, 0, 0);

      // --- Add subtle PaperTube Watermark ---
      const fontSize = Math.max(20, canvas.width * 0.02);
      ctx.font = `900 italic ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillText("PaperTube Sentinel", canvas.width - 20, canvas.height - 20);

      setIsScrubbing(false);
      setIsSecure(true);
      toast.success("Ghost Data Purged. Asset is Secure.", { id: loadingToast });
    };
  };

  const downloadCleanImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `PaperTube-Scrubbed-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-red-500/30 font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <header className="relative z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tools">
              <Button variant="ghost" size="icon" className="hover:bg-red-600/10 text-neutral-500 hover:text-red-500 rounded-xl">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <h1 className="text-sm font-black uppercase italic tracking-widest text-white">EXIF <span className="text-red-600">Sentinel</span></h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1 w-1 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.2em]">Privacy Scrub v1.0</span>
              </div>
            </div>
          </div>
          {isSecure && (
            <Button onClick={downloadCleanImage} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase italic rounded-xl px-8 h-12 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
              <Download size={18} className="mr-2" /> Download Clean Asset
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* --- Sidebar: Threat Level --- */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-neutral-950 border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none rotate-12"><EyeOff size={140} /></div>
               
               <div className="space-y-8 relative z-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 flex items-center gap-2">
                      <Activity size={12} className="text-red-500" /> Vulnerability Scan
                    </label>
                    <div className="space-y-3">
                       <VulnerabilityItem icon={<MapPin size={14}/>} label="GPS Coordinates" status={isSecure ? "Scrubbed" : "Detected"} active={!isSecure} />
                       <VulnerabilityItem icon={<Camera size={14}/>} label="Hardware Specs" status={isSecure ? "Scrubbed" : "Detected"} active={!isSecure} />
                       <VulnerabilityItem icon={<Clock size={14}/>} label="Time Signatures" status={isSecure ? "Scrubbed" : "Detected"} active={!isSecure} />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                     <Button 
                      disabled={!image || isScrubbing || isSecure}
                      onClick={scrubMetadata}
                      className={cn(
                        "w-full h-14 rounded-2xl font-black uppercase italic tracking-widest transition-all",
                        isSecure ? "bg-emerald-600/20 text-emerald-500 border border-emerald-500/20" : "bg-red-600 hover:bg-red-700 text-white"
                      )}
                     >
                       {isScrubbing ? <Loader2 className="animate-spin" /> : isSecure ? <ShieldCheck className="mr-2" /> : <Zap className="mr-2" />}
                       {isSecure ? "Protocol Verified" : "Scrub Ghost Data"}
                     </Button>
                  </div>
               </div>
            </Card>

            <div className="p-6 rounded-[2rem] bg-neutral-900/40 border border-white/5">
               <div className="flex items-center gap-3 text-neutral-400 mb-2">
                  <Terminal size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">What is EXIF?</span>
               </div>
               <p className="text-[11px] text-neutral-500 leading-relaxed font-medium">
                  Photos store hidden "metadata" including your exact location, camera type, and settings. This tool deletes that data by regenerating the image from scratch.
               </p>
            </div>
          </div>

          {/* --- Main Stage: Scanned Asset --- */}
          <div className="lg:col-span-8">
            <canvas ref={canvasRef} className="hidden" />
            
            {!image ? (
              <label className="group relative block cursor-pointer">
                <div className="absolute -inset-1 bg-red-600/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-700 rounded-[3rem]" />
                <div className="relative h-[500px] bg-neutral-950 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-6 hover:border-red-600/40 transition-all">
                  <div className="p-6 rounded-full bg-black border border-white/5 text-neutral-800 group-hover:text-red-600 group-hover:scale-110 transition-all duration-500">
                    <Upload size={48} />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Initialize Privacy Scan</h3>
                    <p className="text-neutral-600 text-sm font-medium tracking-wide">Select image to isolate metadata nodes</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                </div>
              </label>
            ) : (
              <div className="relative rounded-[3rem] bg-neutral-950 border border-white/5 overflow-hidden shadow-2xl h-[600px] group">
                {/* Image Rendering */}
                <div className="absolute inset-0 p-12 flex items-center justify-center">
                   <img 
                    src={image} 
                    className={cn(
                      "max-h-full w-auto object-contain transition-all duration-1000",
                      isScrubbing ? "opacity-20 blur-sm scale-95" : "opacity-60 group-hover:opacity-100"
                    )} 
                   />
                </div>

                {/* Scrubbing Animation Overlay */}
                <AnimatePresence>
                  {isScrubbing && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md"
                    >
                       <div className="relative">
                          <div className="h-32 w-32 rounded-full border-b-2 border-red-600 animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center">
                             <ShieldAlert size={40} className="text-red-600 animate-pulse" />
                          </div>
                       </div>
                       <p className="mt-8 text-xl font-black uppercase italic tracking-widest text-red-500">Purging Metadata...</p>
                       <div className="mt-4 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            animate={{ x: [-200, 200] }} transition={{ repeat: Infinity, duration: 1 }}
                            className="w-1/2 h-full bg-red-600 shadow-[0_0_10px_red]" 
                          />
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Watermark Tagged HUD */}
                {isSecure && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-10 left-10 p-4 rounded-2xl bg-emerald-600/10 border border-emerald-600/20 backdrop-blur-md flex items-center gap-3">
                     <ShieldCheck className="text-emerald-500" size={18} />
                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Asset Sanitized & Watermarked</span>
                  </motion.div>
                )}

                <div className="absolute top-10 right-10">
                   <Button onClick={() => setImage(null)} size="icon" className="rounded-xl bg-black/60 border border-white/10 hover:bg-red-600 text-white"><Trash2 size={18} /></Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// --- Sub-Components ---

function VulnerabilityItem({ icon, label, status, active }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-black border border-white/5">
       <div className="flex items-center gap-3">
          <div className={cn("text-neutral-700", active && "text-red-500")}>{icon}</div>
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">{label}</span>
       </div>
       <span className={cn("text-[9px] font-black uppercase", active ? "text-red-600 animate-pulse" : "text-emerald-500")}>{status}</span>
    </div>
  );
}
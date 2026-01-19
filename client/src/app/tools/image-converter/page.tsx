"use client";

import React, { useState, useRef } from "react";
import { 
  ArrowLeft, Download, Upload, Trash2, 
  ShieldCheck, Activity, Cpu, 
  Image as ImageIcon, Loader2, Settings, 
  ArrowRightLeft, FileType, Scale, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

type SupportedFormat = "image/png" | "image/jpeg" | "image/webp";

interface SourceFileInfo {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

export default function ImageConverterPage() {
  const [sourceInfo, setSourceInfo] = useState<SourceFileInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetFormat, setTargetFormat] = useState<SupportedFormat>("image/png");
  const [quality, setQuality] = useState<number>([90]); // 0-100 scale for UI
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Logic: Handle Upload and Get Dimensions ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid input waveform. Image files only.");
      return;
    }

    const loadingToast = toast.loading("Analyzing Image Structure...");
    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setSourceInfo({
        file,
        previewUrl,
        width: img.width,
        height: img.height,
      });
      toast.dismiss(loadingToast);
      toast.success("Asset Loaded Successfully");
    };
    img.src = previewUrl;
  };

  // --- Logic: Convert, Watermark, and Download ---
  const processAndDownload = async () => {
    if (!sourceInfo || !canvasRef.current) return;
    setIsProcessing(true);
    const loadingToast = toast.loading("Transmuting Format & Applying Branding...");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = sourceInfo.previewUrl;

    await new Promise((resolve) => (img.onload = resolve));

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw Original Image
    canvas.width = sourceInfo.width;
    canvas.height = sourceInfo.height;
    
    // Fill background white if target is JPG (to handle PNG transparency)
    if (targetFormat === "image/jpeg") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);

    // 2. Add PaperTube Watermark
    const fontSize = Math.max(24, canvas.width * 0.03); // Dynamic scaling
    ctx.font = `900 italic ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = "right";
    
    // Watermark Shadow/Outline for readability
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = fontSize / 8;
    ctx.strokeText("PaperTube", canvas.width - (fontSize), canvas.height - (fontSize));

    // Watermark Fill
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillText("Paper", canvas.width - (fontSize * 2.5), canvas.height - (fontSize));
    ctx.fillStyle = "rgba(220, 38, 38, 0.9)"; // Red-600
    ctx.fillText("Tube", canvas.width - (fontSize), canvas.height - (fontSize));

    // 3. Export
    // Quality needs to be 0.0 - 1.0 for canvas API
    const exportQuality = quality[0] / 100;
    const dataUrl = canvas.toDataURL(targetFormat, exportQuality);

    const extensionMap = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
    const originalName = sourceInfo.file.name.substring(0, sourceInfo.file.name.lastIndexOf('.'));
    
    const link = document.createElement("a");
    link.download = `PaperTube-${originalName}.${extensionMap[targetFormat]}`;
    link.href = dataUrl;
    link.click();

    toast.success("Artifact Transmuted Successfully", { id: loadingToast });
    setIsProcessing(false);
  };

  const resetForge = () => {
    if (sourceInfo?.previewUrl) URL.revokeObjectURL(sourceInfo.previewUrl);
    setSourceInfo(null);
    toast.info("Containment Chamber Cleared");
  };

  const formatLabels = {
    "image/png": { label: "PNG", desc: "Lossless. Best for graphics." },
    "image/jpeg": { label: "JPG", desc: "Compressed. Best for photos." },
    "image/webp": { label: "WEBP", desc: "Modern. Efficient web format." },
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-orange-500/30 font-sans">
      {/* Background Ambience (Orange/Red theme) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-600/10 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tools">
              <Button variant="ghost" size="icon" className="hover:bg-orange-600/10 text-neutral-500 hover:text-orange-500 rounded-xl">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <h1 className="text-sm font-black uppercase italic tracking-widest">Polyform Converter</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1 w-1 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.2em]">Local Transmutation Engine</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* --- Sidebar: Control Deck --- */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <Card className="bg-neutral-950 border-white/5 rounded-[2.5rem] p-8 shadow-2xl sticky top-24">
              <div className="space-y-8">
                 {/* Target Format Selector */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 flex items-center gap-2">
                    <FileType size={12} className="text-orange-500" /> Target Output Format
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {(Object.keys(formatLabels) as SupportedFormat[]).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setTargetFormat(fmt)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all text-left group",
                          targetFormat === fmt ? "bg-orange-600/10 border-orange-500 text-white" : "bg-black border-white/5 text-neutral-500 hover:border-white/20"
                        )}
                      >
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest">{formatLabels[fmt].label}</p>
                          <p className="text-[10px] text-neutral-600 group-hover:text-neutral-400 transition-colors">{formatLabels[fmt].desc}</p>
                        </div>
                        {targetFormat === fmt && <Zap size={14} className="text-orange-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                 {/* Quality Slider (Only for lossy formats) */}
                 {targetFormat !== 'image/png' && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 flex items-center gap-2">
                        <Scale size={12} className="text-orange-500" /> Compression Level
                      </label>
                      <span className="text-[10px] font-mono text-orange-500">{quality[0]}%</span>
                    </div>
                    <input 
                      type="range" min="10" max="100" step="5" value={quality[0]}
                      onChange={(e) => setQuality([parseInt(e.target.value)])}
                      className="w-full h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex justify-between text-[8px] font-black text-neutral-700 uppercase tracking-widest">
                      <span>Smaller File</span><span>Better Quality</span>
                    </div>
                  </motion.div>
                 )}

                {/* Privacy Badge */}
                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center gap-4 p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
                     <ShieldCheck className="text-orange-500 shrink-0" size={20} />
                     <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">
                        Zero-Knowledge Processing. Images are converted locally within your browser memory.
                     </p>
                  </div>
                </div>

                {sourceInfo && (
                  <Button onClick={resetForge} variant="ghost" className="w-full text-neutral-500 hover:text-red-500 uppercase font-black text-[10px] tracking-[0.3em]">
                    <Trash2 size={14} className="mr-2" /> Eject Source Input
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* --- Main Stage: Containment Chamber --- */}
          <div className="lg:col-span-8 space-y-8 order-1 lg:order-2">
            {/* Hidden Canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />

            <AnimatePresence mode="wait">
            {!sourceInfo ? (
              <motion.label 
                key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="group relative block cursor-pointer h-[500px]"
              >
                <div className="absolute -inset-1 bg-orange-600/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-700 rounded-[3rem]" />
                <div className="relative h-full bg-neutral-950 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-6 group-hover:border-orange-600/40 transition-all">
                  <div className="p-6 rounded-full bg-black border border-white/5 text-neutral-700 group-hover:text-orange-500 group-hover:scale-110 transition-all duration-500 shadow-xl">
                    <ArrowRightLeft size={48} />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Load Input Artifact</h3>
                    <p className="text-neutral-600 text-sm font-medium tracking-wide">Supports PNG, JPG, BMP, WEBP</p>
                  </div>
                  <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/bmp" onChange={handleImageUpload} />
                </div>
              </motion.label>
            ) : (
              <motion.div key="preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                
                {/* Image Preview HUD */}
                <div className="relative rounded-[2rem] bg-[#080808] border border-white/5 overflow-hidden group shadow-2xl min-h-[400px] flex items-center justify-center p-8">
                  {/* Transparency Checkboard */}
                  <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:10px_10px]" />
                  
                  {/* The Image */}
                  <img 
                    src={sourceInfo.previewUrl} 
                    alt="Source" 
                    className="max-h-[400px] w-auto h-auto object-contain relative z-10 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
                    style={{ maxWidth: '100%' }}
                  />

                   {/* Metadata Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-md border-t border-white/5 flex justify-between items-center z-20">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Source Info</p>
                       <p className="text-xs font-bold text-white truncate max-w-[200px]">{sourceInfo.file.name}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Dimensions</p>
                       <p className="text-xs font-mono text-orange-500">{sourceInfo.width} x {sourceInfo.height}px</p>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                 <div className="p-6 rounded-[2rem] bg-orange-600/5 border border-orange-600/20 flex flex-col md:flex-row items-center justify-between gap-6">
                     <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-black border border-white/5 text-orange-500 animate-pulse"><Cpu size={24} /></div>
                        <div>
                           <h4 className="font-black uppercase italic tracking-widest text-lg">Ready to Transmute</h4>
                           <p className="text-neutral-500 text-xs font-medium uppercase tracking-tighter">
                              Targeting: {formatLabels[targetFormat].label} {targetFormat !== 'image/png' && `@ ${quality[0]}%`}
                           </p>
                        </div>
                     </div>
                     <Button onClick={processAndDownload} disabled={isProcessing} size="lg" className="h-14 px-8 bg-white text-black font-black uppercase italic rounded-2xl hover:bg-orange-600 hover:text-white transition-all shadow-xl">
                        {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2 h-5 w-5" />}
                        Convert & Download
                     </Button>
                  </div>

              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
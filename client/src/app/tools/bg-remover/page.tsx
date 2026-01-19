"use client";

import React, { useState, useRef } from "react";
import { 
  ArrowLeft, Download, Upload, Trash2, 
  ShieldCheck, Activity, Zap, ArrowRight,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import removeBackground from "@imgly/background-removal";
import Link from "next/link";
import Image from "next/image"; // Added missing Next.js Image import
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

export default function BackgroundRemoverPage() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Logic: Neural Background Removal ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSourceImage(url);
      setProcessedImage(null);
      processImage(file);
    }
  };

  const processImage = async (imageSource: File | string) => {
    setIsProcessing(true);
    setProgress(0);
    const loadingToast = toast.loading("Initializing Neural Engine...");

    try {
      const blob = await removeBackground(imageSource, {
        // FIX: Added explicit types to parameters to satisfy TypeScript
        progress: (step: string, current: number, total: number) => {
          const p = Math.round((current / total) * 100);
          setProgress(p);
        }
      });

      const url = URL.createObjectURL(blob);
      setProcessedImage(url);
      toast.success("Extraction Complete", { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error("Neural Link Severed. Try a smaller image.", { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Logic: Download with PaperTube Watermark ---
  const downloadWithBranding = async () => {
    if (!processedImage) return;

    const img = new window.Image(); // Use window.Image to distinguish from Next.js Image component
    img.src = processedImage;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original processed image
      ctx.drawImage(img, 0, 0);

      // --- Add PaperTube Watermark ---
      const fontSize = Math.max(20, canvas.width * 0.03);
      ctx.font = `900 ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = "right";
      
      const text = "PaperTube AI";
      const metrics = ctx.measureText(text);
      
      // Background for text visibility
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(
        canvas.width - metrics.width - 40, 
        canvas.height - fontSize - 40, 
        metrics.width + 20, 
        fontSize + 20
      );

      // The actual watermark
      ctx.fillStyle = "#dc2626"; // Red Part (Tube)
      ctx.fillText("Tube", canvas.width - 20, canvas.height - 30);
      
      ctx.fillStyle = "#ffffff"; // White Part (Paper)
      ctx.fillText("Paper", canvas.width - ctx.measureText("Tube").width - 25, canvas.height - 30);

      const link = document.createElement("a");
      link.download = `PaperTube-bg-removed.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  const resetForge = () => {
    setSourceImage(null);
    setProcessedImage(null);
    setProgress(0);
    toast.info("Containment Chamber Cleared");
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-red-500/30 font-sans">
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
              <h1 className="text-sm font-black uppercase italic tracking-widest">Neural BG Extractor</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1 w-1 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.2em]">Edge Detection v5.0</span>
              </div>
            </div>
          </div>
          {processedImage && (
            <Button onClick={downloadWithBranding} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase italic rounded-xl px-8 h-12 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
              <Download size={18} className="mr-2" /> Download PNG
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-neutral-950 border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 flex items-center gap-2">
                    <Activity size={12} className="text-red-600" /> System Status
                  </label>
                  <div className="p-4 bg-black rounded-2xl border border-white/5 space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-neutral-500">Neural Load</span>
                        <span className="text-[10px] font-mono text-red-500">{isProcessing ? "HIGH" : "IDLE"}</span>
                     </div>
                     <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ width: isProcessing ? "100%" : "0%" }}
                          className="h-full bg-red-600" 
                        />
                     </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600">Local Processing</label>
                  <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                     <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
                     <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">
                        Images are processed in your browser. Data never leaves this terminal.
                     </p>
                  </div>
                </div>

                {sourceImage && (
                  <Button onClick={resetForge} variant="ghost" className="w-full text-neutral-500 hover:text-red-500 uppercase font-black text-[10px] tracking-[0.3em]">
                    <Trash2 size={14} className="mr-2" /> Wipe Buffer
                  </Button>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            {!sourceImage ? (
              <label className="group relative block cursor-pointer">
                <div className="absolute -inset-1 bg-red-600/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-700 rounded-[3rem]" />
                <div className="relative h-[500px] bg-neutral-950 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-6 group-hover:border-red-600/40 transition-all">
                  <div className="p-6 rounded-full bg-black border border-white/5 text-neutral-700 group-hover:text-red-500 group-hover:scale-110 transition-all duration-500">
                    <Upload size={48} />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Initialize Image Scan</h3>
                    <p className="text-neutral-600 text-sm font-medium tracking-wide">Drag & Drop or Click to select raw asset</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
              </label>
            ) : (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6 h-[400px]">
                  <div className="relative rounded-[2rem] bg-neutral-950 border border-white/5 overflow-hidden group">
                    <Image src={sourceImage} alt="Source" fill className="object-contain p-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                    <Badge className="absolute top-4 left-4 bg-black/80 border-white/10 text-[8px] uppercase font-black">Original Asset</Badge>
                  </div>

                  <div className="relative rounded-[2rem] bg-[#080808] border border-white/5 overflow-hidden group shadow-inner">
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:10px_10px]" />
                    
                    <AnimatePresence mode="wait">
                      {isProcessing ? (
                        <motion.div 
                          key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20 bg-black/60 backdrop-blur-sm"
                        >
                          <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                          <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Extracting Subject</p>
                            <p className="text-2xl font-black italic mt-1">{progress}%</p>
                          </div>
                        </motion.div>
                      ) : processedImage ? (
                        <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full w-full">
                          <Image src={processedImage} alt="Result" fill className="object-contain p-4 z-10" />
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                    <Badge className="absolute top-4 left-4 bg-red-600 border-none text-[8px] uppercase font-black shadow-lg">Neural Output</Badge>
                  </div>
                </div>

                {!isProcessing && processedImage && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-[2.5rem] bg-red-600/5 border border-red-600/20 flex flex-col md:flex-row items-center justify-between gap-6">
                     <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-black border border-white/5 text-red-500"><Zap size={24} /></div>
                        <div>
                           <h4 className="font-black uppercase italic tracking-widest text-lg">Subject Isolated</h4>
                           <p className="text-neutral-500 text-xs font-medium uppercase tracking-tighter">Alpha Channel Generated • PNG Metadata Locked</p>
                        </div>
                     </div>
                     <Button onClick={downloadWithBranding} size="lg" className="h-14 px-10 bg-white text-black font-black uppercase italic rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                        Download Artifact <ArrowRight className="ml-2 h-5 w-5" />
                     </Button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
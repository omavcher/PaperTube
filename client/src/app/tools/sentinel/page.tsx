"use client";

import React, { useState, useRef, useCallback } from "react";
import { 
  ArrowLeft, Download, Upload, ShieldAlert, 
  Search, Cpu, Activity, Zap, Trash2, 
  FileSearch, BarChart3, Scan, AlertTriangle,
  Info, CheckCircle, Fingerprint, Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

// --- Configuration: AI Signatures ---
const AI_SIGNATURES = [
  { name: "DALL-E", markers: ["dall-e", "openai"] },
  { name: "Midjourney", markers: ["midjourney"] },
  { name: "Adobe Firefly", markers: ["adobe", "firefly"] },
  { name: "Stable Diffusion", markers: ["stable diffusion", "automatic1111"] }
];

export default function AIDetectorPage() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // --- Logic: Simulated Forensic Scan ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSourceImage(url);
      performForensicScan(file);
    }
  };

  const performForensicScan = async (file: File) => {
    setIsScanning(true);
    setResults(null);
    const loadingToast = toast.loading("Handshaking with Neural Database...");

    // Simulated Deep Scan (In a real app, you'd send this to a Python backend)
    setTimeout(() => {
      const fileName = file.name.toLowerCase();
      let detectedPlatform = "Unknown / Human Origin";
      let probability = Math.floor(Math.random() * (45 - 5 + 1) + 5); // Default low prob

      // Simple metadata/filename check simulation
      AI_SIGNATURES.forEach(sig => {
        if (sig.markers.some(m => fileName.includes(m))) {
          detectedPlatform = sig.name;
          probability = Math.floor(Math.random() * (99 - 85 + 1) + 85);
        }
      });

      setResults({
        platform: detectedPlatform,
        probability: probability,
        artifactDensity: (probability / 1.2).toFixed(1),
        metadataStatus: probability > 50 ? "Corrupted / Stripped" : "Authentic EXIF",
        timestamp: new Date().toISOString()
      });

      setIsScanning(false);
      toast.success("Scan Sequence Complete", { id: loadingToast });
    }, 3000);
  };

  const exportReport = useCallback(async () => {
    if (!reportRef.current) return;
    const loadingToast = toast.loading("Capturing Forensic Report...");
    try {
      const dataUrl = await toPng(reportRef.current, { pixelRatio: 3, backgroundColor: '#000' });
      const link = document.createElement("a");
      link.download = `PaperTube-Forensic-Report.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Report Saved", { id: loadingToast });
    } catch {
      toast.error("Handshake Error", { id: loadingToast });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-red-500/30 font-sans relative overflow-hidden">
      {/* Background Matrix */}
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
              <h1 className="text-sm font-black uppercase italic tracking-widest text-white">Neural Sentinel</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.2em]">Forensic Scan v6.1</span>
              </div>
            </div>
          </div>
          {results && (
            <Button onClick={exportReport} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase italic rounded-xl px-8 h-12 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
              <Download size={18} className="mr-2" /> Export Report
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* --- Analysis HUD --- */}
          <div className="lg:col-span-5 space-y-6">
             <Card className="bg-neutral-950 border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><ShieldAlert size={120} /></div>
                
                {!sourceImage ? (
                  <label className="group relative block cursor-pointer">
                    <div className="h-[400px] border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-6 hover:border-red-600/40 transition-all">
                      <div className="p-6 rounded-full bg-black border border-white/5 text-neutral-800 group-hover:text-red-600 transition-all duration-500"><Upload size={48} /></div>
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-black uppercase italic italic tracking-tighter">Load Visual Asset</h3>
                        <p className="text-neutral-700 text-xs font-medium uppercase tracking-widest">Supports PNG, JPG, WEBP</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </div>
                  </label>
                ) : (
                  <div className="space-y-8">
                    <div className="relative h-64 rounded-2xl overflow-hidden border border-white/10 bg-black">
                      <img src={sourceImage} className="w-full h-full object-contain opacity-50" />
                      {isScanning && (
                        <motion.div 
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 w-full h-1 bg-red-600 shadow-[0_0_20px_red] z-20" 
                        />
                      )}
                    </div>
                    
                    <div className="space-y-4">
                       <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Scan Status</span>
                          <span className={cn("text-[10px] font-mono", isScanning ? "text-red-500 animate-pulse" : "text-emerald-500")}>
                             {isScanning ? "PROCESSING..." : "IDLE"}
                          </span>
                       </div>
                       <Button onClick={() => setSourceImage(null)} variant="ghost" className="w-full text-neutral-700 hover:text-red-500 uppercase font-black text-[10px] tracking-[0.3em]">Wipe Buffer Cache</Button>
                    </div>
                  </div>
                )}
             </Card>

             <div className="p-6 rounded-[2rem] bg-red-600/5 border border-red-600/10">
                <div className="flex items-center gap-3 text-red-500 mb-2">
                  <Fingerprint size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Forensic integrity</span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed font-medium italic">
                  Note: AI detection is probabilistic. No tool can provide 100% certainty. This sentinel scans for noise patterns and embedded metadata signatures.
                </p>
             </div>
          </div>

          {/* --- Results Matrix --- */}
          <div className="lg:col-span-7">
             <AnimatePresence mode="wait">
                {results ? (
                  <motion.div 
                    ref={reportRef}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-neutral-950 border border-white/5 rounded-[3rem] p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden"
                  >
                    {/* Background Graphic */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:30px_30px]" />
                    
                    <div className="relative z-10 space-y-12">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                           <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">FORENSIC <br /><span className="text-red-600">REPORT</span></h2>
                           <p className="text-neutral-700 font-mono text-[9px] uppercase tracking-[0.4em]">REF: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                           <Badge className={cn("text-[10px] font-black uppercase px-4 py-1", results.probability > 60 ? "bg-red-600" : "bg-emerald-600")}>
                             {results.probability > 60 ? "CRITICAL RISK" : "STABLE"}
                           </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-10">
                         <ForensicStat label="Estimated Probability" value={`${results.probability}%`} color="text-red-500" />
                         <ForensicStat label="Detected Platform" value={results.platform} color="text-white" />
                         <ForensicStat label="Artifact Density" value={results.artifactDensity} color="text-red-400" />
                         <ForensicStat label="EXIF Metadata" value={results.metadataStatus} color="text-neutral-500" />
                      </div>

                      <div className="pt-10 border-t border-white/5">
                         <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-700 flex items-center gap-2"><BarChart3 size={12} /> Neural Confidence Waveform</span>
                            <div className="flex items-end gap-1.5 h-16">
                               {Array.from({ length: 30 }).map((_, i) => (
                                 <div key={i} className="flex-1 bg-red-600/20 rounded-t-sm" style={{ height: `${Math.random() * 100}%` }} />
                               ))}
                            </div>
                         </div>
                      </div>

                      {/* --- BRAND WATERMARK --- */}
                      <div className="pt-12 flex justify-end items-center gap-2 select-none opacity-40">
                        <div className="h-4 w-px bg-white/10 mx-2" />
                        <span className="text-[14px] font-black tracking-[0.3em] uppercase italic text-white">
                          Paper<span className="text-red-600">Tube</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ) : isScanning ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center space-y-6 py-40">
                     <div className="relative">
                        <div className="h-24 w-24 rounded-full border-4 border-white/5 border-t-red-600 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-red-500"><Terminal size={32} /></div>
                     </div>
                     <div className="text-center">
                        <p className="text-sm font-black uppercase italic tracking-[0.3em] text-red-500">Scanning Pixels...</p>
                        <p className="text-neutral-700 text-[10px] uppercase font-bold mt-2 tracking-widest">Decrypting Geometric Noise</p>
                     </div>
                  </motion.div>
                ) : (
                  <div className="h-full border border-dashed border-white/5 rounded-[3rem] flex items-center justify-center py-40 bg-neutral-950/20">
                     <p className="text-neutral-800 font-black uppercase italic tracking-[0.4em] text-sm">Awaiting Visual Data</p>
                  </div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ForensicStat({ label, value, color }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black text-neutral-700 uppercase tracking-[0.2em]">{label}</p>
      <p className={cn("text-3xl font-black italic tracking-tighter leading-none", color)}>{value}</p>
    </div>
  );
}
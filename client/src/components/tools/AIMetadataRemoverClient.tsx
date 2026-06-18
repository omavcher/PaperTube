"use client";

import React, { useState, useRef, useCallback } from "react";
import { 
  ArrowLeft, Download, Upload, Trash2, 
  ShieldCheck, Cpu, Activity, AlertTriangle,
  Info, CheckCircle, Fingerprint, RefreshCw,
  Sparkles, ShieldAlert, Lock, Eye, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";
import CorePromo from "../CorePromo";

// --- Binary Parsing and Stripping Helpers ---

function stripAIMetadataFromPNG(arrayBuffer: ArrayBuffer): { buffer: ArrayBuffer; log: string[] } {
  const log: string[] = [];
  const view = new DataView(arrayBuffer);
  const bytes = new Uint8Array(arrayBuffer);

  if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4E || bytes[3] !== 0x47) {
    log.push("Invalid PNG signature");
    return { buffer: arrayBuffer, log };
  }

  const chunks: { offset: number; length: number; type: string; keep: boolean }[] = [];
  let offset = 8;

  while (offset < arrayBuffer.byteLength) {
    if (offset + 8 > arrayBuffer.byteLength) break;
    const length = view.getUint32(offset);
    const typeBytes = bytes.slice(offset + 4, offset + 8);
    const type = String.fromCharCode(...typeBytes);

    let keep = true;

    if (type === "caPt") {
      keep = false;
      log.push("Stripped Content Authenticity Credentials (caPt chunk)");
    } else if (type === "tEXt" || type === "zTXt" || type === "iTXt") {
      const dataStart = offset + 8;
      let keyword = "";
      for (let i = 0; i < Math.min(80, length); i++) {
        const charCode = bytes[dataStart + i];
        if (charCode === 0) break;
        keyword += String.fromCharCode(charCode);
      }

      const kwLower = keyword.toLowerCase();
      if (
        kwLower.includes("parameter") ||
        kwLower.includes("prompt") ||
        kwLower.includes("workflow") ||
        kwLower.includes("comfyui") ||
        (kwLower.includes("software") && (kwLower.includes("stable") || kwLower.includes("midjourney") || kwLower.includes("dall") || kwLower.includes("gemini") || kwLower.includes("chatgpt"))) ||
        (kwLower.includes("description") && (kwLower.includes("sd-metadata") || kwLower.includes("prompt")))
      ) {
        keep = false;
        log.push(`Stripped AI metadata key: "${keyword}" (${type} chunk)`);
      }
    }

    chunks.push({ offset, length: length + 12, type, keep });
    offset += length + 12;
  }

  let totalLength = 8;
  for (const chunk of chunks) {
    if (chunk.keep) totalLength += chunk.length;
  }

  const newBuffer = new ArrayBuffer(totalLength);
  const newBytes = new Uint8Array(newBuffer);
  newBytes.set(bytes.slice(0, 8), 0);

  let writeOffset = 8;
  for (const chunk of chunks) {
    if (chunk.keep) {
      newBytes.set(bytes.slice(chunk.offset, chunk.offset + chunk.length), writeOffset);
      writeOffset += chunk.length;
    }
  }

  return { buffer: newBuffer, log };
}

function stripAIMetadataFromJPEG(arrayBuffer: ArrayBuffer): { buffer: ArrayBuffer; log: string[] } {
  const log: string[] = [];
  const view = new DataView(arrayBuffer);
  const bytes = new Uint8Array(arrayBuffer);

  if (bytes[0] !== 0xFF || bytes[1] !== 0xD8) {
    log.push("Invalid JPEG signature");
    return { buffer: arrayBuffer, log };
  }

  const segments: { offset: number; length: number; marker: number; keep: boolean }[] = [];
  let offset = 2;

  while (offset < arrayBuffer.byteLength) {
    if (offset + 1 >= arrayBuffer.byteLength) break;
    
    if (bytes[offset] !== 0xFF) {
      offset++;
      continue;
    }

    const marker = bytes[offset + 1];
    if (marker === 0x00 || marker === 0xFF) {
      offset += 2;
      continue;
    }

    if (marker === 0xD9) {
      segments.push({ offset, length: 2, marker, keep: true });
      break;
    }

    if (marker === 0xDA) {
      segments.push({ offset, length: arrayBuffer.byteLength - offset, marker, keep: true });
      break;
    }

    if (offset + 3 >= arrayBuffer.byteLength) break;
    const length = view.getUint16(offset + 2);

    let keep = true;

    if (marker === 0xEB) {
      // APP11 - C2PA content provenance
      keep = false;
      log.push("Stripped C2PA Content Credentials (APP11 segment)");
    } else if (marker === 0xFE) {
      // COM - comment containing prompts
      keep = false;
      log.push("Stripped Text Comments (COM segment)");
    } else if (marker === 0xE1) {
      // APP1 - EXIF/XMP
      const dataStart = offset + 4;
      const xmpHeader = "http://ns.adobe.com/xap/1.0/";
      let isXMP = true;
      for (let i = 0; i < xmpHeader.length; i++) {
        if (bytes[dataStart + i] !== xmpHeader.charCodeAt(i)) {
          isXMP = false;
          break;
        }
      }

      if (isXMP) {
        let xmpString = "";
        const maxRead = Math.min(length - 2, 20000);
        for (let i = xmpHeader.length + 1; i < maxRead; i++) {
          xmpString += String.fromCharCode(bytes[dataStart + i]);
        }
        
        const xmpLower = xmpString.toLowerCase();
        if (
          xmpLower.includes("stable") ||
          xmpLower.includes("midjourney") ||
          xmpLower.includes("dall") ||
          xmpLower.includes("comfyui") ||
          xmpLower.includes("prompt") ||
          xmpLower.includes("parameter") ||
          xmpLower.includes("creator") ||
          xmpLower.includes("jumbf")
        ) {
          keep = false;
          log.push("Stripped AI-specific XMP metadata (APP1 segment)");
        }
      }
    }

    segments.push({ offset, length: length + 2, marker, keep });
    offset += length + 2;
  }

  let totalLength = 2;
  for (const segment of segments) {
    if (segment.keep) totalLength += segment.length;
  }

  const newBuffer = new ArrayBuffer(totalLength);
  const newBytes = new Uint8Array(newBuffer);
  newBytes.set(bytes.slice(0, 2), 0);

  let writeOffset = 2;
  for (const segment of segments) {
    if (segment.keep) {
      newBytes.set(bytes.slice(segment.offset, segment.offset + segment.length), writeOffset);
      writeOffset += segment.length;
    }
  }

  return { buffer: newBuffer, log };
}

function stripAIMetadataFromWEBP(arrayBuffer: ArrayBuffer): { buffer: ArrayBuffer; log: string[] } {
  const log: string[] = [];
  const view = new DataView(arrayBuffer);
  const bytes = new Uint8Array(arrayBuffer);

  if (
    bytes[0] !== 0x52 || bytes[1] !== 0x49 || bytes[2] !== 0x46 || bytes[3] !== 0x46 ||
    bytes[8] !== 0x57 || bytes[9] !== 0x45 || bytes[10] !== 0x42 || bytes[11] !== 0x50
  ) {
    log.push("Invalid WebP signature");
    return { buffer: arrayBuffer, log };
  }

  const chunks: { offset: number; length: number; tag: string; keep: boolean }[] = [];
  let offset = 12;

  while (offset < arrayBuffer.byteLength) {
    if (offset + 8 > arrayBuffer.byteLength) break;
    const tagBytes = bytes.slice(offset, offset + 4);
    const tag = String.fromCharCode(...tagBytes);
    const size = view.getUint32(offset + 4, true);

    let keep = true;
    const paddedSize = size + (size % 2);
    const chunkLength = 8 + paddedSize;

    if (tag === "XMP ") {
      const dataStart = offset + 8;
      let xmpString = "";
      const maxRead = Math.min(size, 20000);
      for (let i = 0; i < maxRead; i++) {
        xmpString += String.fromCharCode(bytes[dataStart + i]);
      }
      
      const xmpLower = xmpString.toLowerCase();
      if (
        xmpLower.includes("stable") ||
        xmpLower.includes("midjourney") ||
        xmpLower.includes("dall") ||
        xmpLower.includes("comfyui") ||
        xmpLower.includes("prompt") ||
        xmpLower.includes("parameter")
      ) {
        keep = false;
        log.push("Stripped AI-specific XMP metadata chunk from WebP");
      }
    }

    chunks.push({ offset, length: chunkLength, tag, keep });
    offset += chunkLength;
  }

  let totalLength = 12;
  for (const chunk of chunks) {
    if (chunk.keep) totalLength += chunk.length;
  }

  const newBuffer = new ArrayBuffer(totalLength);
  const newBytes = new Uint8Array(newBuffer);
  newBytes.set(bytes.slice(0, 12), 0);
  const newView = new DataView(newBuffer);
  newView.setUint32(4, totalLength - 8, true);

  let writeOffset = 12;
  for (const chunk of chunks) {
    if (chunk.keep) {
      newBytes.set(bytes.slice(chunk.offset, chunk.offset + chunk.length), writeOffset);
      writeOffset += chunk.length;
    }
  }

  return { buffer: newBuffer, log };
}

// --- Component Definition ---

type Mode = "ai-only" | "all";

interface ImageState {
  file: File;
  previewUrl: string;
  originalSize: number;
  width: number;
  height: number;
}

export default function AIMetadataRemoverClient() {
  const [imageState, setImageState] = useState<ImageState | null>(null);
  const [mode, setMode] = useState<Mode>("ai-only");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{
    cleanedBlob: Blob;
    cleanedSize: number;
    log: string[];
    downloadName: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useToolAnalytics("ai-metadata-remover", "AI METADATA REMOVER", "Engineering Tools");

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Format mismatch. Please upload an image file.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageState({
        file,
        previewUrl,
        originalSize: file.size,
        width: img.width,
        height: img.height
      });
      setResults(null);
    };
    img.src = previewUrl;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const processImage = async () => {
    if (!imageState) return;
    setIsProcessing(true);
    const loadingToast = toast.loading("Executing metadata purge sequence...");

    // Add brief artificial delay to show scanning visualizer
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      if (mode === "all") {
        // Redraw on canvas to completely wipe all headers
        const canvas = canvasRef.current || document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not initialize canvas context");

        const img = new Image();
        img.src = imageState.previewUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        canvas.width = imageState.width;
        canvas.height = imageState.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) {
            toast.error("Wipe failed. Fallback error.");
            setIsProcessing(false);
            return;
          }
          
          const cleanName = `Paperxify-clean-${imageState.file.name}`;
          setResults({
            cleanedBlob: blob,
            cleanedSize: blob.size,
            log: [
              "Initialized canvas pixel copy routine",
              "Disallowed transfer of EXIF structures",
              "Disallowed transfer of IPTC structures",
              "Disallowed transfer of XMP structures",
              "Disallowed transfer of C2PA digital signatures",
              "Successfully exported clean pixel raster"
            ],
            downloadName: cleanName
          });
          toast.success("All metadata wiped successfully", { id: loadingToast });
          setIsProcessing(false);
        }, imageState.file.type, 0.95);

      } else {
        // AI-Only Mode: Parse raw bytes to strip only AI headers
        const arrayBuffer = await imageState.file.arrayBuffer();
        let strippedBuffer: ArrayBuffer;
        let stripLog: string[] = [];

        if (imageState.file.type === "image/png") {
          const res = stripAIMetadataFromPNG(arrayBuffer);
          strippedBuffer = res.buffer;
          stripLog = res.log;
        } else if (imageState.file.type === "image/jpeg" || imageState.file.type === "image/jpg") {
          const res = stripAIMetadataFromJPEG(arrayBuffer);
          strippedBuffer = res.buffer;
          stripLog = res.log;
        } else if (imageState.file.type === "image/webp") {
          const res = stripAIMetadataFromWEBP(arrayBuffer);
          strippedBuffer = res.buffer;
          stripLog = res.log;
        } else {
          // Fallback to Canvas strip for unsupported file types
          toast.warning("Byte parsing not supported for this type. Falling back to canvas purge.");
          const canvas = canvasRef.current || document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Could not initialize canvas context");
          const img = new Image();
          img.src = imageState.previewUrl;
          await new Promise((resolve) => (img.onload = resolve));
          canvas.width = imageState.width;
          canvas.height = imageState.height;
          ctx.drawImage(img, 0, 0);
          const blobPromise = new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, imageState.file.type, 0.95));
          const blob = await blobPromise;
          if (!blob) throw new Error("Canvas export failed");
          strippedBuffer = await blob.arrayBuffer();
          stripLog = ["Fallback: Wiped all metadata structures via canvas export."];
        }

        if (stripLog.length === 0) {
          stripLog.push("No active AI metadata signatures detected in the source containers. File is already clean or contains standard EXIF data only.");
        }

        const cleanBlob = new Blob([strippedBuffer], { type: imageState.file.type });
        const cleanName = `Paperxify-ai-stripped-${imageState.file.name}`;

        setResults({
          cleanedBlob: cleanBlob,
          cleanedSize: cleanBlob.size,
          log: stripLog,
          downloadName: cleanName
        });
        toast.success("AI signatures stripped successfully", { id: loadingToast });
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Stripping sequence interrupted.", { id: loadingToast });
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!results) return;
    const url = URL.createObjectURL(results.cleanedBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = results.downloadName;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Scrubbed image downloaded.");
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const reset = () => {
    if (imageState?.previewUrl) URL.revokeObjectURL(imageState.previewUrl);
    setImageState(null);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600/30 font-sans relative overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Desktop Header */}
      <header className="hidden md:flex relative z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl px-6 py-4 items-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Link href="/tools">
              <Button variant="ghost" size="icon" className="hover:bg-red-600/10 text-neutral-500 hover:text-red-500 rounded-xl">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <h1 className="text-sm font-black uppercase italic tracking-widest text-white">AI Metadata Remover</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.2em]">Exif & C2PA Scrubber v2.5</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Sparkles className="text-red-500 h-5 w-5" />
          <span className="font-black italic tracking-tighter text-white uppercase">METADATA REMOVER</span>
        </div>
        <Link href="/tools">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 md:py-12 relative z-10 w-full">
        {/* Title Section */}
        <div className="text-center space-y-4 mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest">
            <Sparkles size={12} className="animate-spin" /> Bypass LinkedIn AI Label
          </div>
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tight uppercase leading-tight">
            🧹 LinkedIn C Tag Remover
          </h2>
          <p className="text-neutral-400 font-medium text-sm md:text-base max-w-2xl mx-auto">
            Hide the Cr Tag from AI Images on LinkedIn. Easily perform complete AI info from img removal client-side (including C2PA content credentials, prompts, and tool parameters) while keeping camera EXIF intact.
          </p>
        </div>

        {/* Main Interface Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Interactive Panel */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-neutral-950 border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <Cpu size={120} />
              </div>

              {!imageState ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="h-[320px] border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-red-600/40 cursor-pointer transition-all"
                >
                  <div className="p-5 rounded-full bg-black border border-white/5 text-neutral-600 group-hover:text-red-500 transition-all duration-300">
                    <Upload size={36} />
                  </div>
                  <div className="text-center space-y-2 px-4">
                    <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">Drop your image here</h3>
                    <p className="text-neutral-600 text-xs font-medium uppercase tracking-widest">or click to upload</p>
                    <p className="text-[10px] text-neutral-700 italic">Supports PNG, JPG, JPEG, WEBP</p>
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Selected File Card */}
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black h-48 flex items-center justify-center">
                    <img src={imageState.previewUrl} className="max-h-full max-w-full object-contain" alt="Source Preview" />
                    {isProcessing && (
                      <motion.div 
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-0 w-full h-1.5 bg-red-500 shadow-[0_0_15px_#ef4444] z-20" 
                      />
                    )}
                  </div>

                  {/* Mode Selector */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 pl-1 block">Removal Mode</label>
                    <div className="grid grid-cols-1 gap-2">
                      <button 
                        onClick={() => setMode("ai-only")}
                        className={cn(
                          "p-4 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3 relative overflow-hidden group",
                          mode === "ai-only" ? "bg-red-500/10 border-red-500 text-white" : "bg-black border-white/5 text-neutral-400 hover:border-white/20"
                        )}
                      >
                        <div className="p-2 bg-neutral-900 border border-white/10 rounded-xl mt-0.5 text-red-500">
                          🎯
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider">Remove Only AI Metadata (Recommended)</p>
                          <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">
                            Strips AI-related tags (C2PA, generation parameters, AI tool signatures) while preserving camera EXIF, GPS, copyright, and other important metadata.
                          </p>
                        </div>
                      </button>

                      <button 
                        onClick={() => setMode("all")}
                        className={cn(
                          "p-4 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3 relative overflow-hidden group",
                          mode === "all" ? "bg-red-500/10 border-red-500 text-white" : "bg-black border-white/5 text-neutral-400 hover:border-white/20"
                        )}
                      >
                        <div className="p-2 bg-neutral-900 border border-white/10 rounded-xl mt-0.5 text-red-500">
                          🗑️
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider">Remove All Metadata</p>
                          <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">
                            Removes ALL metadata including EXIF, GPS, timestamps, camera settings, and copyright information. Results in a completely clean file.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-col gap-2">
                    <Button 
                      onClick={processImage} 
                      disabled={isProcessing}
                      className="w-full h-12 bg-white hover:bg-neutral-200 text-black font-black uppercase italic rounded-xl flex items-center justify-center gap-2 tracking-widest text-xs transition-all active:scale-[0.99]"
                    >
                      {isProcessing ? <RefreshCw className="animate-spin mr-2 h-4 w-4" /> : <Activity size={14} />}
                      Purge Metadata
                    </Button>
                    
                    <Button onClick={reset} variant="ghost" className="w-full text-neutral-500 hover:text-red-500 font-bold uppercase text-[9px] tracking-widest">
                      <Trash2 size={12} className="mr-1" /> Remove Image
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Privacy Lock Alert */}
            <div className="p-5 rounded-[2rem] bg-red-950/20 border border-red-500/10 flex items-start gap-4">
              <Lock size={20} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Local Processing Node</h4>
                <p className="text-[11px] text-neutral-500 leading-relaxed font-medium">
                  We respect your privacy. No files are ever sent to our servers. All metadata cleaning operations are performed in your browser client.
                </p>
              </div>
            </div>
          </div>

          {/* Results Stage */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {results ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-neutral-950 border border-white/5 rounded-[3rem] p-6 md:p-8 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:30px_30px]" />
                  <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white">
                          SCRUB <span className="text-red-500">REPORT</span>
                        </h2>
                        <p className="text-neutral-500 font-mono text-[8px] uppercase tracking-widest">ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                      </div>
                      <Badge className="text-[9px] font-black uppercase px-3 py-1 bg-emerald-600 text-white rounded-lg flex items-center gap-1">
                        <CheckCircle size={10} /> Purged
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-black/60 rounded-2xl border border-white/5">
                      <div>
                        <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest block">Original Size</span>
                        <span className="text-lg font-black text-white font-mono">{formatSize(imageState!.originalSize)}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest block">Cleaned Size</span>
                        <span className="text-lg font-black text-emerald-500 font-mono">{formatSize(results.cleanedSize)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-2">
                        <Activity size={10} className="text-red-500" /> Logged Operations
                      </span>
                      <div className="bg-[#050505] border border-white/5 rounded-2xl p-4 h-[160px] overflow-y-auto space-y-2 font-mono text-[10px] text-neutral-400">
                        {results.log.map((entry, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-red-500">{`>`}</span>
                            <span>{entry}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={triggerDownload} 
                      className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(220,38,38,0.2)] text-sm transition-all"
                    >
                      <Download size={16} /> Download Scrubbed Image
                    </Button>
                  </div>
                </motion.div>
              ) : isProcessing ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="h-[400px] border border-white/5 bg-neutral-950/40 rounded-[3rem] flex flex-col items-center justify-center space-y-6"
                >
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full border-4 border-white/5 border-t-red-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-red-500">
                      <Cpu size={24} className="animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-black uppercase italic tracking-[0.2em] text-red-500">Scrubbing Binary Buffers...</p>
                    <p className="text-neutral-600 text-[10px] uppercase font-bold tracking-widest">Wiping C2PA Authenticity Marks</p>
                  </div>
                </motion.div>
              ) : (
                <div className="h-[400px] border border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center bg-neutral-950/20 text-center px-4">
                  <Fingerprint size={48} className="text-neutral-800 mb-4" />
                  <p className="text-neutral-700 font-black uppercase italic tracking-[0.3em] text-sm">Awaiting Visual Data</p>
                  <p className="text-neutral-800 text-[10px] uppercase font-bold tracking-widest mt-1">Upload an image to start cleaning</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- Educational Content Sections --- */}
        <div className="mt-24 space-y-16 max-w-4xl mx-auto">
          {/* Target Section: LinkedIn AI CR Tag Removal */}
          <Card className="p-8 rounded-[2.5rem] bg-gradient-to-r from-red-950/20 via-neutral-950 to-neutral-950 border border-red-500/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                🚀
              </div>
              <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white">
                Hide the Cr Tag from AI Images on LinkedIn (LinkedIn C Tag Remover)
              </h3>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Many creators generating images with AI notice something frustrating when posting on LinkedIn: the <strong>AI Cr tag</strong> (Content Credentials) is automatically attached to their visual assets. Even when your design looks perfect and your post idea is strong, the auto-applied AI label changes how the content is perceived.
            </p>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Our <strong>LinkedIn C Tag Remover</strong> is designed specifically to help creators hide the Cr tag from AI images on LinkedIn. By stripping the cryptographic C2PA markers and JUMBF manifests embedded by tools like Midjourney, ChatGPT, or DALL-E, you can publish your graphics cleanly and professionally.
            </p>
          </Card>

          {/* Perfect For Section */}
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                🎯 Complete AI Info from Img Removal
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                This tool is optimized for creators seeking reliable <strong>ai info from img removal</strong> configurations to strip metadata:
              </p>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">▪</span>
                  <span><strong>Strip AI Generation Data:</strong> Safely perform ai info from img removal for visual content created with ChatGPT, Gemini, Midjourney, DALL-E, Stable Diffusion, or ComfyUI.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">▪</span>
                  <span><strong>LinkedIn C Tag Scrubber:</strong> Strip the hidden C2PA signatures to hide the Cr tag from AI images on LinkedIn.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">▪</span>
                  <span><strong>Hide prompts and parameters:</strong> Discard generation parameters, custom templates, prompts, model checkpoints, and random seeds.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">▪</span>
                  <span><strong>Retain EXIF camera markers:</strong> Keep original camera details, shutter speed, ISO, and copyright notices if you post-edited actual photos with generative AI.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-[2rem] bg-neutral-950 border border-white/5 space-y-4">
              <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                🔒 Complete Privacy Protection?
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                If you want to remove ALL metadata including GPS, camera serial numbers, and timestamps from regular camera photos, our <strong>Remove All Metadata</strong> mode will strip everything, resulting in a completely sterile file containing only visual pixels.
              </p>
            </div>
          </div>

          {/* What Gets Removed Section */}
          <div className="space-y-6 pt-8 border-t border-white/5">
            <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white text-center">
              What Gets Removed?
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-neutral-950 border border-white/5 space-y-4">
                <h4 className="text-sm font-black uppercase tracking-wider text-red-500 flex items-center gap-2">
                  🎯 AI-Only Mode Removes:
                </h4>
                <ul className="space-y-2 text-xs text-neutral-400">
                  <li className="flex justify-between"><strong>C2PA/JUMBF:</strong> <span>Content credentials</span></li>
                  <li className="flex justify-between"><strong>AI Parameters:</strong> <span>Prompts, seeds, CFG scales</span></li>
                  <li className="flex justify-between"><strong>AI Signatures:</strong> <span>Midjourney / DALL-E signatures</span></li>
                  <li className="flex justify-between"><strong>CBOR Claims:</strong> <span>Digital source declarations</span></li>
                </ul>

                <h4 className="text-sm font-black uppercase tracking-wider text-emerald-500 flex items-center gap-2 pt-2">
                  ✅ AI-Only Mode Preserves:
                </h4>
                <ul className="space-y-2 text-xs text-neutral-400">
                  <li className="flex justify-between"><strong>Camera EXIF:</strong> <span>Aperture, ISO, lens, focal length</span></li>
                  <li className="flex justify-between"><strong>GPS Data:</strong> <span>Location parameters</span></li>
                  <li className="flex justify-between"><strong>Copyright:</strong> <span>Notice & creator licenses</span></li>
                  <li className="flex justify-between"><strong>Timestamps:</strong> <span>Date/time taken info</span></li>
                  <li className="flex justify-between"><strong>Color Profile:</strong> <span>ICC color profiles</span></li>
                </ul>
              </div>

              <div className="p-6 rounded-3xl bg-neutral-950 border border-white/5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                    🗑️ Remove All Mode:
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Removes everything, resulting in a minimal file containing only image data. Use this mode for maximum privacy when you want absolutely no metadata whatsoever attached to your file.
                  </p>
                </div>
                
                <div className="p-4 bg-red-950/20 border border-red-500/10 rounded-2xl flex gap-3">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-neutral-500 leading-relaxed font-medium">
                    Please use <strong>Remove All</strong> mode with caution if you need to retain copyright or camera specs for professional portfolios.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What This Tool Cannot Remove Section */}
          <div className="p-8 rounded-[2.5rem] bg-neutral-950 border border-white/5 space-y-6">
            <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
              ⚠️ What this tool CANNOT remove
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              This tool strips metadata — EXIF tags, IPTC fields, XMP packets, C2PA/JUMBF manifests, and AI-tool fingerprints embedded in the file's metadata containers. It does not alter the image pixels themselves.
            </p>
            <p className="text-neutral-400 text-sm leading-relaxed">
              That means certain AI signatures survive even a full strip:
            </p>
            
            <div className="space-y-4 pl-4 text-sm text-neutral-400">
              <div>
                <strong className="text-white">▪ Google SynthID:</strong>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  An imperceptible watermark embedded directly into the pixel values of images generated by Google's AI models (Imagen, Veo, Lyria). Designed to survive compression, resizing, cropping, and screenshots. Removing the file's metadata does not remove SynthID. Google's Gemini app will still flag a SynthID-watermarked image as Google-AI-generated after you've cleaned the metadata.
                </p>
              </div>
              <div>
                <strong className="text-white">▪ Statistical and frequency-domain fingerprints:</strong>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Left by most diffusion models in the image pixels themselves. Specialized classifiers like AI or Not, Hive Moderation, and Sightengine can detect these regardless of metadata.
                </p>
              </div>
              <div>
                <strong className="text-white">▪ Visual artifacts:</strong>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Garbled text, anatomy issues, lighting inconsistencies. Vision models and trained eyes spot these easily.
                </p>
              </div>
            </div>
            
            <p className="text-neutral-500 text-xs italic">
              If you need a tool's confirmation that an image was AI-generated, see the AI Image Detector — same caveats apply in reverse: a clean detector result doesn't guarantee an image is authentic, since the metadata can be stripped.
            </p>
          </div>

          {/* Legal and compliance considerations */}
          <div className="space-y-8 pt-8 border-t border-white/5">
            <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white text-center">
              ⚠️ Should You Remove AI Metadata? Legal & Compliance Considerations
            </h3>
            
            <p className="text-center text-neutral-400 text-sm max-w-2xl mx-auto leading-relaxed">
              ⚖️ <strong>Legal Protection:</strong> With EU regulations coming in August 2026 and platform policies already in effect, removing AI metadata could expose you to legal issues and platform violations. Consider carefully before stripping AI disclosure markers.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-wider text-emerald-500 flex items-center gap-2">
                  ✅ When to KEEP AI Metadata
                </h4>
                <ul className="space-y-3 text-xs text-neutral-400">
                  <li><strong>Commercial Use:</strong> When selling AI-generated images or using them in business/marketing.</li>
                  <li><strong>Social Media:</strong> When posting on platforms that require disclosure (LinkedIn, Facebook, Instagram, YouTube).</li>
                  <li><strong>News & Journalism:</strong> When publishing content that could be mistaken for real photography.</li>
                  <li><strong>Public Interest Content:</strong> Anything related to politics, current events, or public figures.</li>
                  <li><strong>Professional Portfolios:</strong> To demonstrate your AI workflow and maintain transparency with clients.</li>
                  <li><strong>EU Distribution:</strong> Any content that may reach European audiences after August 2, 2026 (EU AI Act compliance).</li>
                  <li><strong>Legal Protection:</strong> When you want verifiable proof of content authenticity and origin.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-wider text-red-500 flex items-center gap-2">
                  🔸 When You Might Remove AI Metadata
                </h4>
                <ul className="space-y-3 text-xs text-neutral-400">
                  <li><strong>Personal Use:</strong> Images not shared publicly or used for private purposes only.</li>
                  <li><strong>Artistic Expression:</strong> When the AI process is integral to your creative work and you want to focus on the final art.</li>
                  <li><strong>Minor AI Edits:</strong> When AI was only used for background removal, color correction, or upscaling rather than full generation.</li>
                  <li><strong>File Size Reduction:</strong> When you need smaller files and aren't subject to disclosure regulations.</li>
                  <li><strong>Privacy Concerns:</strong> When metadata reveals sensitive information about your AI workflow or prompts.</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4 bg-neutral-950 p-6 border border-white/5 rounded-3xl">
              <h4 className="text-sm font-black uppercase tracking-wider text-white">
                📋 Platform-Specific Guidelines
              </h4>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li><strong>LinkedIn:</strong> Uses C2PA credentials to automatically label AI content - keeping metadata ensures proper labeling.</li>
                <li><strong>Meta (Facebook/Instagram/Threads):</strong> Applies "Imagined with AI" labels based on metadata and watermarks.</li>
                <li><strong>YouTube:</strong> Requires manual disclosure for realistic AI content; metadata helps demonstrate compliance.</li>
                <li><strong>EU AI Act (Aug 2026):</strong> Will require machine-readable AI disclosure markers in metadata for content distributed in Europe.</li>
              </ul>
            </div>

            <div className="space-y-4 bg-neutral-950 p-6 border border-white/5 rounded-3xl">
              <h4 className="text-sm font-black uppercase tracking-wider text-white">
                🔮 Future of AI Metadata & Detection
              </h4>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li><strong>C2PA Standard:</strong> Becoming the industry standard for content provenance, supported by Adobe, Microsoft, Google, OpenAI, and major social platforms.</li>
                <li><strong>Invisible Watermarks:</strong> Many AI tools now embed watermarks that survive editing and can be detected even if metadata is stripped.</li>
                <li><strong>AI Detection AI:</strong> Platforms are developing advanced classifiers that can detect AI generation without relying on metadata.</li>
                <li><strong>Blockchain Verification:</strong> Emerging systems use blockchain to create tamper-proof records of content origin.</li>
                <li><strong>Global Regulations:</strong> More countries expected to introduce AI disclosure laws similar to the EU AI Act.</li>
              </ul>
              <p className="text-[10px] text-neutral-500 italic mt-2">
                Bottom Line: Even if you remove metadata today, platforms may still detect and label AI content through other means. Being transparent about AI usage is increasingly the safer legal and ethical choice.
              </p>
            </div>

            <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-2xl text-center text-xs text-neutral-400 font-medium leading-relaxed">
              💡 <strong>Recommended Approach: Use AI-Only Mode.</strong> Instead of removing all metadata, consider selectively stripping sensitive prompts while keeping content credentials and camera EXIF data for provenance and copyright verification.
            </div>
          </div>
        </div>

        {/* Promo and Footer Section */}
        <div className="mt-20">
          <CorePromo />
        </div>
      </main>

      <Footer />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
